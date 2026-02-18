import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Dashboard({ messengers, dispatch_locations, beetrack_data }) {
    const { data, setData, submit, processing, errors, reset } = useForm({
        file: null,
        location_id: '',
        messenger_id: '',
        last_route: false,
        output_name: '',
    });

    const [filter, setFilter] = useState('');
    const [localMessengers, setLocalMessengers] = useState(messengers);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    // --- Real-time Updates with WebSockets & Polling Fallback ---
    useEffect(() => {
        // 1. Listen for real-time events
        if (window.Echo) {
            window.Echo.channel('messengers')
                .listen('.status.updated', (e) => {
                    console.log('Real-time update received:', e);
                    if (e.data && e.data.messengers) {
                        setLocalMessengers(e.data.messengers);
                        setLastUpdated(new Date().toLocaleTimeString());
                    }
                });
        }

        // 2. Polling as fallback (increased interval to 1 minute)
        const interval = setInterval(() => {
            fetch(route('messenger.status'))
                .then(res => res.json())
                .then(data => {
                    setLocalMessengers(data.messengers);
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

    // Update local state when props change (initial load or manual refresh)
    useEffect(() => {
        setLocalMessengers(messengers);
    }, [messengers]);

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
                document.querySelector('input[type="file"]').value = '';
            })
            .catch(err => alert('Error: ' + err.message));
    };

    // --- Drag and Drop Logic ---


    // --- Filtering & Sorting ---
    const getFilteredMessengers = (loc) => {
        return localMessengers
            .filter(m => m.location?.toLowerCase() === loc.toLowerCase())
            .filter(m => {
                const search = filter.toUpperCase();
                return m.name.toUpperCase().includes(search) ||
                    m.vehicle.includes(search) ||
                    m.status.toUpperCase().includes(search);
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
    };

    return (
        <LeaderLayout title="Control Center">
            <Head title="Control Center" />
            {/* Glassmorphism Header */}
            <div className="sticky top-16 z-20 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-indigo-100 dark:border-indigo-900/50 shadow-sm transition-all duration-300">
                <div className="max-w-[1800px] mx-auto p-3 sm:p-4">
                    <form onSubmit={handleDispatchSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 lg:gap-4">

                        {/* Brand / Filter */}
                        <div className="flex-grow lg:flex-grow-0 lg:flex-[1.5] min-w-[280px]">
                            <InputLabel value="Buscar en lista" />
                            <div className="relative w-full group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <svg className="h-3 w-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <TextInput
                                    type="text"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder="Nombre, placa o estado..."
                                    className="pl-10 w-full"
                                />
                            </div>
                        </div>

                        {/* File Input - Custom Styling */}
                        <div className="w-full lg:w-[350px] relative group cursor-pointer">
                            <InputLabel value="Archivo de Ruta" />
                            <input
                                type="file"
                                onChange={(e) => setData('file', e.target.files[0])}
                                accept=".xlsx, .xls"
                                className="block w-full text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-2
                                  file:mr-2 file:py-1 file:px-3
                                  file:rounded-lg file:border-0
                                  file:text-[10px] file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100
                                  cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Location & Messenger */}
                        <div className="w-full lg:w-[220px]">
                            <InputLabel value="Bodega Destino" />
                            <SelectInput
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value)}
                                className="w-full py-2"
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {dispatch_locations.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </SelectInput>
                        </div>

                        {/* Last Route Checkbox */}
                        <div className="flex items-center pb-2">
                            <label className="flex items-center cursor-pointer group">
                                <span className="mr-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">¿Última Ruta?</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={data.last_route}
                                        onChange={(e) => setData('last_route', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/10 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                        </div>

                        <div className="flex-grow lg:flex-1 min-w-[180px]">
                            <InputLabel value="Nombre Archivo Salida" />
                            <div className="flex gap-2">
                                <TextInput
                                    type="text"
                                    value={data.output_name}
                                    onChange={(e) => setData('output_name', e.target.value)}
                                    placeholder="Click en una tarjeta..."
                                    className="w-full font-mono py-2"
                                    required
                                />
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing}
                                    className="text-xs px-4"
                                >
                                    GENERAR
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto p-3 sm:p-4 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-screen lg:h-[calc(100vh-160px)]">

                {/* Column: 116 (Principal) */}
                <div
                    className="flex-[2] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300"
                >
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">SEDE 116</h2>
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Principal</span>
                        </div>
                        <span className="text-slate-400 font-mono text-xs font-bold">{getFilteredMessengers('principal').length} ACTIVOS</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                            {getFilteredMessengers('principal').map(m => (
                                <MessengerCard
                                    key={m.id}
                                    m={m}
                                    onClick={selectMessenger}
                                    isSelected={data.messenger_id === m.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column: Teusaquillo */}
                <div
                    className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300"
                >
                    <div className="p-4 bg-gradient-to-r from-teal-50 to-white dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
                            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">TEUSAQUILLO</h2>
                        </div>
                        <span className="text-slate-400 font-mono text-xs font-bold">{getFilteredMessengers('teusaquillo').length} ACTIVOS</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            {getFilteredMessengers('teusaquillo').map(m => (
                                <MessengerCard
                                    key={m.id}
                                    m={m}
                                    onClick={selectMessenger}
                                    isSelected={data.messenger_id === m.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </LeaderLayout>
    );
}

function MessengerCard({ m, onClick, isSelected }) {
    // Status Config
    const config = {
        'status-en-ruta': { color: 'red', icon: 'Motorcycle', bg: 'bg-white', border: 'border-l-4 border-l-red-500' },
        'status-almuerzo': { color: 'amber', icon: 'Coffee', bg: 'bg-amber-50/50', border: 'border-l-4 border-l-amber-500' },
        'status-libre': { color: 'emerald', icon: 'Check', bg: 'bg-white', border: 'border-l-4 border-l-emerald-500' },
        'pendiente': { color: 'slate', icon: 'Clock', bg: 'bg-slate-50', border: 'border-l-4 border-l-slate-300' },
    }[m.class_name] || { color: 'slate', icon: '?', bg: 'bg-white', border: 'border-l-4 border-gray-300' };

    return (
        <div
            onClick={() => onClick(m)}
            className={`
                relative p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-300 ease-out
                ${config.bg} dark:bg-slate-800
                ${config.border} border-y border-r border-slate-100 dark:border-slate-700
                hover:shadow-lg hover:-translate-y-1
                ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                group
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 transition-colors">
                        {m.name}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-400 font-bold tracking-wider">{m.vehicle}</p>
                </div>
                <StatusBadge status={m.status} color={config.color} />
            </div>

            <div className="space-y-2">
                {/* Info Rows */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-slate-300">🍽️</span>
                    <span className="font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {m.lunch_range}
                    </span>
                </div>

                {/* Progress / Status Detail */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-slate-300">📡</span>
                    {m.beetrack_info ? (
                        <div className="flex-1 flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-red-600">EN RUTA</span>
                                <span className="text-[10px] font-mono">{m.beetrack_info.progreso_str}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: `${m.beetrack_info.porcentaje}%` }}></div>
                            </div>
                        </div>
                    ) : m.finished_info ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-medium">
                            <span>Finalizó:</span>
                            <span className="font-mono">{m.finished_info.hora_cierre}</span>
                        </div>
                    ) : (
                        <span className="text-slate-400 italic text-[10px]">Sin actividad reciente</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status, color }) {
    const colors = {
        red: 'bg-red-100 text-red-700 border-red-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200',
        emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        slate: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors[color]} uppercase tracking-tight`}>
            {status}
        </span>
    );
}
