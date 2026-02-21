import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';

export default function Dashboard({ messengers, dispatch_locations, beetrack_data }) {
    const { data, setData, submit, processing, errors, reset } = useForm({
        file: null,
        location_id: '',
        messenger_id: '',
        last_route: false,
        output_name: '',
    });

    const [filter, setFilter] = useState('');
    const [activeFilters, setActiveFilters] = useState(new Set());

    const toggleFilter = (key) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };
    const [localMessengers, setLocalMessengers] = useState(messengers);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
    const [beetrackLoading, setBeetrackLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Fast/Async Data Loading ---
    useEffect(() => {
        // Initial set from props
        let currentMessengers = [...messengers];
        setLocalMessengers(currentMessengers);

        // Fetch Beetrack Data asynchronously
        setBeetrackLoading(true);
        fetch(route('messenger.status.beetrack'))
            .then(res => res.json())
            .then(data => {
                if (data.beetrack_data) {
                    const normalize = (str) => {
                        if (!str) return '';
                        return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
                    };

                    const btData = data.beetrack_data;
                    const allBt = [...(btData.activos || []), ...(btData.libres || [])];

                    // Merge Beetrack data into local messengers
                    currentMessengers = currentMessengers.map(m => {
                        let btMatch = allBt.find(item => normalize(item.unidad) === normalize(m.vehicle));
                        let beetrackInfo = null;
                        let status = m.status;
                        let currentClass = m.class_name;
                        let priority = 1;

                        if (btData.activos) {
                            const active = btData.activos.find(item => normalize(item.unidad) === normalize(m.vehicle));
                            if (active) {
                                status = 'En Ruta';
                                currentClass = 'status-en-ruta';
                                beetrackInfo = active;
                                priority = 2; // Keep at top
                            }
                        }

                        // Don't override if already marked as Finished
                        if (m.finished_info) {
                            status = 'Finalizado';
                            currentClass = 'pendiente';
                            priority = 1;
                        }

                        return {
                            ...m,
                            name: btMatch ? (btMatch.nombre || m.name) : m.name,
                            status: status,
                            class_name: currentClass,
                            beetrack_info: beetrackInfo,
                            priority: priority
                        };
                    });

                    setLocalMessengers(currentMessengers);
                }
                setBeetrackLoading(false);
                setLastUpdated(new Date().toLocaleTimeString());
            })
            .catch(err => {
                console.error('Error fetching Beetrack status:', err);
                setBeetrackLoading(false);
            });
    }, [messengers]);

    // --- Real-time Updates with WebSockets & Polling Fallback ---
    useEffect(() => {
        // 1. Listen for real-time events
        if (window.Echo) {
            window.Echo.channel('messengers')
                .listen('.status.updated', (e) => {
                    console.log('Real-time update received:', e);
                    if (e.data && e.data.messengers) {
                        // NOTE: Real-time updates currently override Beetrack merged state.
                        // In a full implementation, you'd want to re-merge the existing Beetrack state here.
                        setLocalMessengers(e.data.messengers);
                        setLastUpdated(new Date().toLocaleTimeString());
                    }
                });
        }

        // 2. Local Polling (No longer fetches Beetrack by default)
        const interval = setInterval(() => {
            fetch(route('messenger.status'))
                .then(res => res.json())
                .then(data => {
                    // Update Local data (shifts, lunch) but KEEP exiting beetrack info
                    setLocalMessengers(prevMessengers => {
                        return data.messengers.map(newM => {
                            const oldM = prevMessengers.find(p => p.id === newM.id);
                            return {
                                ...newM,
                                name: oldM ? oldM.name : newM.name,
                                status: (oldM?.beetrack_info && !newM.finished_info) ? 'En Ruta' : newM.status,
                                class_name: (oldM?.beetrack_info && !newM.finished_info) ? 'status-en-ruta' : newM.class_name,
                                beetrack_info: oldM ? oldM.beetrack_info : null,
                                priority: (oldM?.beetrack_info && !newM.finished_info) ? 2 : 1
                            };
                        })
                    });
                    setLastUpdated(new Date().toLocaleTimeString());
                })
                .catch(err => console.error('Polling error:', err));
        }, 60000);

        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('messengers');
            }
            clearInterval(interval);
        };
    }, []);

    // --- Dispatch Form Handler ---
    const handleDispatchSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('location_id', data.location_id);
        formData.append('messenger_id', data.messenger_id);
        formData.append('last_route', data.last_route ? '1' : '0');
        formData.append('output_name', data.output_name);

        // Send token both in form data and headers for maximum compatibility
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) formData.append('_token', token);

        fetch(route('dispatch.store'), {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': token,
            }
        })
            .then(response => {
                if (response.ok) return response.blob();
                throw new Error('Error generador archivo');
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${data.output_name}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();

                // Clear form after success
                reset();
                if (document.querySelector('input[type="file"]')) {
                    document.querySelector('input[type="file"]').value = '';
                }
                setIsModalOpen(false);
            })
            .catch(err => alert('Error: ' + err.message));
    };

    // --- Drag and Drop Logic ---


    // --- Filtering & Sorting ---
    const getFilteredMessengers = () => {
        const locationOf = (m) => m.location === 'principal' ? '116' : (m.location || '').toLowerCase();
        const statusOf = (m) => (m.status || '').toLowerCase();

        // Group chips by category
        const locationKeys = new Set(['116', 'teusaquillo']);
        const statusKeys = new Set(['en-ruta', 'disponible', 'almuerzo', 'finalizado']);

        const activeLocationFilters = [...activeFilters].filter(k => locationKeys.has(k));
        const activeStatusFilters = [...activeFilters].filter(k => statusKeys.has(k));

        const chipMatchers = {
            '116': (m) => locationOf(m) === '116',
            'teusaquillo': (m) => locationOf(m) === 'teusaquillo',
            'en-ruta': (m) => statusOf(m) === 'en ruta',
            'disponible': (m) => statusOf(m) === 'disponible',
            'almuerzo': (m) => statusOf(m).includes('almuerzo'),
            'finalizado': (m) => statusOf(m) === 'finalizado',
        };

        return localMessengers
            .filter(m => {
                // 1. Text search
                const search = filter.toUpperCase();
                const textMatch = !filter ||
                    m.name.toUpperCase().includes(search) ||
                    m.vehicle.toUpperCase().includes(search) ||
                    statusOf(m).toUpperCase().includes(search) ||
                    locationOf(m).toUpperCase().includes(search);

                // 2. Faceted: OR within each category, AND between categories
                const locationMatch = activeLocationFilters.length === 0 ||
                    activeLocationFilters.some(k => chipMatchers[k]?.(m));
                const statusMatch = activeStatusFilters.length === 0 ||
                    activeStatusFilters.some(k => chipMatchers[k]?.(m));

                return textMatch && locationMatch && statusMatch;
            })
            .sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                return a.name.localeCompare(b.name);
            });
    };

    const selectMessenger = (m) => {
        setData(prev => ({
            ...prev,
            messenger_id: m.id,
            output_name: `${m.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}`
        }));
        setIsModalOpen(true);
    };

    return (
        <LeaderLayout title="Control Center">
            <Head title="Control Center" />
            {/* Glassmorphism Header */}
            <div className="sticky top-16 z-20 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-indigo-100 dark:border-indigo-900/50 shadow-sm transition-all duration-300">
                <div className="max-w-[1800px] mx-auto p-3 sm:p-4">
                    <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-4 w-full">
                        {/* Brand / Filter */}
                        <div className="w-full flex flex-col md:flex-row gap-3 items-start md:items-center">
                            <div className="relative w-full lg:max-w-md group shrink-0">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <svg className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <TextInput
                                    type="text"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder="Buscar por nombre, placa o estado..."
                                    className="pl-10 w-full"
                                />
                                {filter && (
                                    <button
                                        onClick={() => setFilter('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                )}
                            </div>

                            {/* Dynamic Filter Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full no-scrollbar">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 hidden lg:block shrink-0">Filtros:</span>

                                {/* Location Filters */}
                                <FilterBadge active={activeFilters.has('116')} onClick={() => toggleFilter('116')} label="Sede 116" color="blue" />
                                <FilterBadge active={activeFilters.has('teusaquillo')} onClick={() => toggleFilter('teusaquillo')} label="Teusaquillo" color="teal" />

                                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block shrink-0"></div>

                                {/* Status Filters */}
                                <FilterBadge active={activeFilters.has('en-ruta')} onClick={() => toggleFilter('en-ruta')} label="En Ruta" color="red" />
                                <FilterBadge active={activeFilters.has('disponible')} onClick={() => toggleFilter('disponible')} label="Disponible" color="emerald" />
                                <FilterBadge active={activeFilters.has('almuerzo')} onClick={() => toggleFilter('almuerzo')} label="Almorzando" color="amber" />
                                <FilterBadge active={activeFilters.has('finalizado')} onClick={() => toggleFilter('finalizado')} label="Finalizado" color="violet" />

                                {/* Clear all button */}
                                {activeFilters.size > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveFilters(new Set())}
                                        className="ml-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 cursor-pointer transition-all duration-200 whitespace-nowrap flex items-center gap-1"
                                    >
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md">
                <form onSubmit={handleDispatchSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                        Archivo de Ruta
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Generando ruta para: <span className="font-bold text-slate-700 dark:text-slate-300">
                            {localMessengers.find(m => m.id === data.messenger_id)?.name}
                        </span>
                    </p>

                    <div className="space-y-4">
                        {/* File Input */}
                        <div>
                            <InputLabel value="Planilla Excel (.xlsx, .xls)" />
                            <input
                                type="file"
                                onChange={(e) => setData('file', e.target.files[0])}
                                accept=".xlsx, .xls"
                                className="mt-1 block w-full text-sm text-slate-500 bg-slate-50/50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-2
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-md file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-indigo-50 file:text-indigo-700
                                          hover:file:bg-indigo-100
                                          cursor-pointer focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <InputLabel value="Bodega Origen" />
                            <SelectInput
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value)}
                                className="mt-1 w-full"
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {dispatch_locations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </SelectInput>
                        </div>

                        {/* Last Route Checkbox */}
                        <div className="flex items-center pt-2">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={data.last_route}
                                        onChange={(e) => setData('last_route', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">¿Es la última ruta del día?</span>
                            </label>
                        </div>

                        {/* Output Name */}
                        <div className="pt-2">
                            <InputLabel value="Nombre Archivo Final" />
                            <TextInput
                                type="text"
                                value={data.output_name}
                                onChange={(e) => setData('output_name', e.target.value)}
                                placeholder="Nombre archivo..."
                                className="mt-1 w-full font-mono text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setIsModalOpen(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            Generar y Descargar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto p-3 sm:p-4">
                {beetrackLoading && (
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] animate-pulse text-indigo-500 font-bold tracking-widest uppercase">
                            Consultando rutas en Beetrack...
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {getFilteredMessengers().map(m => (
                        <MessengerCard
                            key={m.id}
                            m={m}
                            onClick={selectMessenger}
                            isSelected={data.messenger_id === m.id}
                        />
                    ))}
                </div>
            </div>

        </LeaderLayout>
    );
}

function MessengerCard({ m, onClick, isSelected }) {
    const config = {
        'status-en-ruta': { color: 'red', avatar: 'bg-red-500', rowBg: 'bg-red-50/60 dark:bg-red-900/10', border: 'border-l-4 border-l-red-500' },
        'status-almuerzo': { color: 'amber', avatar: 'bg-amber-400', rowBg: 'bg-amber-50/60 dark:bg-amber-900/10', border: 'border-l-4 border-l-amber-400' },
        'status-libre': { color: 'emerald', avatar: 'bg-emerald-500', rowBg: 'bg-white dark:bg-slate-800', border: 'border-l-4 border-l-emerald-500' },
        'pendiente': { color: 'slate', avatar: 'bg-slate-400', rowBg: 'bg-slate-50/80 dark:bg-slate-800', border: 'border-l-4 border-l-slate-300' },
    }[m.class_name] || { color: 'slate', avatar: 'bg-slate-400', rowBg: 'bg-white dark:bg-slate-800', border: 'border-l-4 border-gray-200' };

    // Initials from name
    const initials = m.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return (
        <div
            onClick={() => onClick(m)}
            className={`
                flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 rounded-xl shadow-sm cursor-pointer transition-all duration-200 ease-out
                ${config.rowBg}
                ${config.border} border-y border-r border-slate-100 dark:border-slate-700/60
                hover:shadow-md hover:brightness-[0.97] dark:hover:brightness-110
                ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
                group gap-3 sm:gap-4 relative
            `}
        >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 w-full sm:w-1/3 sm:min-w-[220px]">
                {/* Avatar */}
                <div className={`shrink-0 w-9 h-9 rounded-full ${config.avatar} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-xs font-black tracking-tight">{initials}</span>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-tight">
                        {m.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        {m.location && (
                            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider whitespace-nowrap ${m.location === 'principal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'}`}>
                                {m.location === 'principal' ? '116' : m.location.toUpperCase()}
                            </span>
                        )}
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-bold tracking-wider whitespace-nowrap">
                            {m.vehicle}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Columns */}
            <div className="flex-1 flex flex-row flex-wrap sm:flex-nowrap items-center justify-end sm:justify-between gap-2 sm:gap-4 lg:gap-6 w-full px-1 sm:px-4 lg:px-8 max-w-4xl">

                {/* Turno */}
                <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[90px] hidden lg:flex shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Turno
                    </span>
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">{m.shift_info}</span>
                </div>

                {/* Almuerzo */}
                <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[90px] shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden xl:flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Almuerzo
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-slate-300 xl:hidden text-sm">🍽️</span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap">{m.lunch_range}</span>
                    </div>
                </div>

                {/* Reporte */}
                <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[90px] shrink-0 hidden sm:flex">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden xl:flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Reporte
                    </span>
                    {m.finished_info ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 flex items-center gap-1 whitespace-nowrap">
                            🏁 {m.finished_info.hora_cierre}
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                            Pendiente
                        </span>
                    )}
                </div>

                {/* Beetrack */}
                <div className="flex-1 flex items-center justify-end sm:justify-center w-full min-w-[120px] max-w-[200px] shrink-0">
                    {m.beetrack_info ? (
                        <div className="w-full flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-red-500 tracking-wider uppercase">En Ruta</span>
                                <span className="text-[9px] font-mono font-bold text-slate-500">{m.beetrack_info.progreso_str}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500" style={{ width: `${m.beetrack_info.porcentaje}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-300 dark:text-slate-600 italic text-xs hidden sm:block">Sin actividad</span>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className="hidden sm:flex justify-end min-w-[100px] shrink-0">
                <StatusBadge status={m.status} color={config.color} />
            </div>
            <div className="flex sm:hidden justify-end w-full absolute top-3 right-3">
                <StatusBadge status={m.status} color={config.color} />
            </div>
        </div>
    );
}

function StatusBadge({ status, color }) {
    const colors = {
        red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
        slate: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${colors[color]} uppercase tracking-wide`}>
            {status}
        </span>
    );
}

function FilterBadge({ active, onClick, label, color }) {
    const defaultClasses = "px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all duration-200 whitespace-nowrap shadow-sm";

    const colors = {
        blue: active ? 'bg-blue-500 text-white border-blue-600 shadow-blue-500/30 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700',
        teal: active ? 'bg-teal-500 text-white border-teal-600 shadow-teal-500/30 ring-2 ring-teal-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-slate-700',
        red: active ? 'bg-red-500 text-white border-red-600 shadow-red-500/30 ring-2 ring-red-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-slate-700',
        emerald: active ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/30 ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700',
        amber: active ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-slate-700',
        violet: active ? 'bg-violet-500 text-white border-violet-600 shadow-violet-500/30 ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-slate-700',
    };

    return (
        <button type="button" onClick={onClick} className={`${defaultClasses} ${colors[color]}`}>
            {label}
        </button>
    );
}
