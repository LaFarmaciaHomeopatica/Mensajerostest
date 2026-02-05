import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';

export default function PreoperationalReports({ reports, messengers, questions, filters, locations }) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedMessenger, setSelectedMessenger] = useState(filters.messenger_id || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '', messenger_id: '', location: '' });

    // Column Management logic
    const allColumns = [
        { id: 'created_at', label: 'Fecha/Hora', sortable: true },
        { id: 'messenger_name', label: 'Mensajero', sortable: true },
        { id: 'vehicle', label: 'Placa', sortable: true },
        { id: 'location', label: 'Sede', sortable: false },
        { id: 'start_time', label: 'Hora Ingreso', sortable: false },
        { id: 'compliance', label: 'Cumplimiento', sortable: false },
        { id: 'answers', label: 'Respuestas', sortable: false },
    ];

    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem('preop_columns');
            if (!saved) return allColumns.map(c => c.id);
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : allColumns.map(c => c.id);
        } catch (e) {
            console.error("Error parsing columns from localStorage", e);
            return allColumns.map(c => c.id);
        }
    });

    useEffect(() => {
        localStorage.setItem('preop_columns', JSON.stringify(visibleColumns));
    }, [visibleColumns]);

    const toggleColumn = (id) => {
        setVisibleColumns(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const isVisible = (id) => visibleColumns.includes(id);

    // Sorting logic
    const sortField = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';

    const handleSort = (field) => {
        const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        router.get(route('reports.preoperational'), {
            ...filters,
            sort_by: field,
            sort_order: newOrder
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Create a label and type mapping from the dynamic questions
    const questionData = questions.reduce((acc, q) => {
        acc[q.key] = { label: q.label, type: q.type };
        return acc;
    }, {});

    const questionLabels = questions.reduce((acc, q) => {
        acc[q.key] = q.label;
        return acc;
    }, {});

    const handleFilter = () => {
        router.get(route('reports.preoperational'), {
            date: selectedDate,
            messenger_id: selectedMessenger,
            location: selectedLocation,
            sort_by: sortField,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSelectedDate('');
        setSelectedMessenger('');
        setSelectedLocation('');
        setExportDates({ start: '', end: '', messenger_id: '', location: '' });
        router.get(route('reports.preoperational'));
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (!exportDates.start || !exportDates.end) {
            alert('Selecciona ambas fechas');
            return;
        }
        const url = route('reports.preoperational.export', {
            start_date: exportDates.start,
            end_date: exportDates.end,
            messenger_id: exportDates.messenger_id,
            location: exportDates.location
        });
        window.location.href = url;
        setShowExportModal(false);
    };

    const getAnswerIcon = (value) => {
        return value === true ? '✓' : value === false ? '✗' : '-';
    };

    const getAnswerColor = (value) => {
        return value === true ? 'text-green-600' : value === false ? 'text-red-600' : 'text-gray-400';
    };

    return (
        <LeaderLayout>
            <Head title="Reportes" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header and Export Button */}
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    <span className="bg-indigo-600/10 p-2 rounded-xl text-xl">📋</span>
                                    Reportes Preoperacionales
                                </h1>
                                <Link
                                    href={route('preoperational-questions.index')}
                                    className="px-4 py-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 group"
                                >
                                    <span className="group-hover:rotate-90 transition-transform duration-500">⚙️</span>
                                    Config Preguntas
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">FECHA</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SEDE</label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                    >
                                        <option value="">Todas las sedes</option>
                                        <option value="principal">Principal</option>
                                        {locations?.filter(loc => loc.name.toLowerCase() !== 'principal').map((loc) => (
                                            <option key={loc.id} value={loc.name}>
                                                {loc.name.charAt(0).toUpperCase() + loc.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[140px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">MENSAJERO</label>
                                    <MessengerSearchSelect
                                        messengers={messengers}
                                        selectedId={selectedMessenger}
                                        onChange={setSelectedMessenger}
                                        placeholder="Todos los mensajeros"
                                    />
                                </div>

                                {/* Consolidated Action Group */}
                                <div className="flex flex-wrap items-end gap-2">
                                    <button
                                        onClick={() => setShowColumnModal(true)}
                                        className="h-[38px] px-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                        </svg>
                                        COLUMNAS
                                    </button>

                                    <button
                                        onClick={handleFilter}
                                        className="h-[38px] px-8 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                        FILTRAR
                                    </button>

                                    <button
                                        onClick={handleReset}
                                        className="h-[38px] px-8 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                                    >
                                        LIMPIAR
                                    </button>

                                    <button
                                        onClick={() => setShowExportModal(true)}
                                        className="h-[38px] px-5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        EXPORTAR
                                    </button>
                                </div>
                            </div>

                            {/* Reports Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {isVisible('created_at') && (
                                                <th
                                                    onClick={() => handleSort('created_at')}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Fecha/Hora
                                                        {sortField === 'created_at' && (
                                                            <span className="text-indigo-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </div>
                                                </th>
                                            )}
                                            {isVisible('messenger_name') && (
                                                <th
                                                    onClick={() => handleSort('messenger_name')}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Mensajero
                                                        {sortField === 'messenger_name' && (
                                                            <span className="text-indigo-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </div>
                                                </th>
                                            )}
                                            {isVisible('vehicle') && (
                                                <th
                                                    onClick={() => handleSort('vehicle')}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        Placa
                                                        {sortField === 'vehicle' && (
                                                            <span className="text-indigo-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                                        )}
                                                    </div>
                                                </th>
                                            )}
                                            {isVisible('location') && (
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Sede
                                                </th>
                                            )}
                                            {isVisible('start_time') && (
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Hora Ingreso
                                                </th>
                                            )}
                                            {isVisible('compliance') && (
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Cumplimiento
                                                </th>
                                            )}
                                            {isVisible('answers') && (
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Respuestas
                                                </th>
                                            )}
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {reports.data.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                {isVisible('created_at') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {new Date(report.created_at).toLocaleString('es-CO')}
                                                    </td>
                                                )}
                                                {isVisible('messenger_name') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {report.messenger.name}
                                                    </td>
                                                )}
                                                {isVisible('vehicle') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {report.messenger.vehicle}
                                                    </td>
                                                )}
                                                {isVisible('location') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                            {report.shift?.location || 'principal'}
                                                        </span>
                                                    </td>
                                                )}
                                                {isVisible('start_time') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                        {report.shift ? (
                                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                {report.shift.start_time}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Sin turno</span>
                                                        )}
                                                    </td>
                                                )}
                                                {isVisible('compliance') && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        {report.compliant === true && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                ✓ A tiempo
                                                            </span>
                                                        )}
                                                        {report.compliant === false && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                ✗ Tardío
                                                            </span>
                                                        )}
                                                        {report.compliant === null && (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                {isVisible('answers') && (
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center items-center gap-2">
                                                            {(() => {
                                                                const counts = Object.values(report.answers).reduce((acc, val) => {
                                                                    if (val === true) acc.yes++;
                                                                    if (val === false) acc.no++;
                                                                    return acc;
                                                                }, { yes: 0, no: 0 });
                                                                return (
                                                                    <>
                                                                        <span className="flex items-center gap-1 font-black text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md border border-green-100 dark:border-green-800/50">
                                                                            <span className="text-sm">{counts.yes}</span>
                                                                            <span className="text-lg">✓</span>
                                                                        </span>
                                                                        <span className="flex items-center gap-1 font-black text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-800/50">
                                                                            <span className="text-sm">{counts.no}</span>
                                                                            <span className="text-lg leading-none">✗</span>
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                                                    >
                                                        Ver Detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {reports.links && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando {reports.from} a {reports.to} de {reports.total} resultados
                                    </div>
                                    <div className="flex gap-2">
                                        {reports.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded ${link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Report Details */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        📋 Detalles del Reporte Preoperacional
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {selectedReport.messenger.name} - {selectedReport.messenger.vehicle}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            Reportado: {new Date(selectedReport.created_at).toLocaleString('es-CO')}
                                        </p>
                                        <span className="text-gray-400">•</span>
                                        <p className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                            Sede: {selectedReport.shift?.location || 'principal'}
                                        </p>
                                        {selectedReport.shift && (
                                            <>
                                                <span className="text-gray-400">•</span>
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                                                    Ingreso: {selectedReport.shift.start_time}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    {selectedReport.compliant !== null && (
                                        <div className="mt-2">
                                            {selectedReport.compliant ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    ✓ Registrado a tiempo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                    ✗ Registrado después del ingreso
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold ml-4"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {Object.entries(selectedReport.answers).map(([key, value]) => {
                                const qInfo = questionData[key];
                                const isText = qInfo?.type === 'text';

                                return (
                                    <div
                                        key={key}
                                        className={`flex flex-col p-4 rounded-lg border-2 ${isText
                                            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                            : value
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-gray-100">
                                                    {qInfo?.label || key}
                                                </p>
                                            </div>
                                            {!isText && (
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`text-2xl font-bold ${value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {value ? '✓' : '✗'}
                                                    </span>
                                                    <span
                                                        className={`text-sm font-semibold ${value ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {value ? 'Sí' : 'No'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {isText && (
                                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-2 rounded italic">
                                                {value || '-'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {selectedReport.observations && (
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        Observaciones:
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        {selectedReport.observations}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-4">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Selection Modal */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <h2 className="text-xl font-bold mb-4">📂 Exportar a Excel</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Selecciona el rango de fechas para exportar los reportes preoperacionales.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={exportDates.start}
                                onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                                className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={exportDates.end}
                                onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                                className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mensajero (Opcional)</label>
                            <MessengerSearchSelect
                                messengers={messengers}
                                selectedId={exportDates.messenger_id}
                                onChange={(id) => setExportDates({ ...exportDates, messenger_id: id })}
                                placeholder="Todos los mensajeros"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sede (Opcional)</label>
                            <select
                                value={exportDates.location}
                                onChange={(e) => setExportDates({ ...exportDates, location: e.target.value })}
                                className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                            >
                                <option value="">Todas las sedes</option>
                                <option value="principal">Principal</option>
                                {locations?.filter(loc => loc.name.toLowerCase() !== 'principal').map((loc) => (
                                    <option key={loc.id} value={loc.name}>
                                        {loc.name.charAt(0).toUpperCase() + loc.name.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <SecondaryButton onClick={() => setShowExportModal(false)} className="uppercase tracking-widest text-xs">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-900 focus:ring-indigo-500 uppercase tracking-widest text-xs">
                            Generar Reporte
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Column Selection Modal */}
            <Modal show={showColumnModal} onClose={() => setShowColumnModal(false)}>
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-2xl">⚙️</span> Configurar Columnas
                        </h2>
                        <button
                            onClick={() => setShowColumnModal(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Selecciona las columnas que deseas visualizar en la tabla de reportes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {allColumns.map((col) => (
                            <label
                                key={col.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isVisible(col.id)
                                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                                    : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isVisible(col.id)}
                                        onChange={() => toggleColumn(col.id)}
                                        className="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-900 transition-all"
                                    />
                                </div>
                                <span className={`text-sm font-semibold ${isVisible(col.id) ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {col.label}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                        <PrimaryButton
                            onClick={() => setShowColumnModal(false)}
                            className="bg-slate-800 hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 w-full sm:w-auto justify-center"
                        >
                            Listo, guardar cambios
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </LeaderLayout>
    );
}

