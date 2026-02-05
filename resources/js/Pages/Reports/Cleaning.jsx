import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';

export default function CleaningReports({ reports, messengers, filters }) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedMessenger, setSelectedMessenger] = useState(filters.messenger_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '', messenger_id: '', type: '' });

    const types = {
        'maletas_semanal': 'Limpieza Maletas (Semanal)',
        'maletas_mensual': 'Limpieza Maletas (Mensual)',
        'motos_semanal': 'Limpieza Moto (Semanal)',
        'motos_mensual': 'Limpieza Moto (Mensual)',
    };

    const handleFilter = () => {
        router.get(route('reports.cleaning'), {
            date: selectedDate,
            messenger_id: selectedMessenger,
            type: selectedType,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSelectedDate('');
        setSelectedMessenger('');
        setSelectedType('');
        setExportDates({ start: '', end: '', messenger_id: '', type: '' });
        router.get(route('reports.cleaning'));
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (!exportDates.start || !exportDates.end) {
            alert('Selecciona ambas fechas');
            return;
        }
        const url = route('reports.cleaning.export', {
            start_date: exportDates.start,
            end_date: exportDates.end,
            messenger_id: exportDates.messenger_id,
            type: exportDates.type
        });
        window.location.href = url;
        setShowExportModal(false);
    };

    const handleSort = (field) => {
        const newOrder = field === filters.sort_by && filters.sort_order === 'asc' ? 'desc' : 'asc';
        router.get(route('reports.cleaning'), {
            ...filters,
            sort_by: field,
            sort_order: newOrder
        }, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <LeaderLayout>
            <Head title="Reportes de Limpieza" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    <span className="bg-emerald-600/10 p-2 rounded-xl text-xl">🧹</span>
                                    Reportes de Limpieza
                                </h1>
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

                            {/* Filters */}
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">FECHA</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">TIPO</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                    >
                                        <option value="">Todos los tipos</option>
                                        {Object.entries(types).map(([id, label]) => (
                                            <option key={id} value={id}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">MENSAJERO</label>
                                    <MessengerSearchSelect
                                        messengers={messengers}
                                        selectedId={selectedMessenger}
                                        onChange={setSelectedMessenger}
                                        placeholder="Todos"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFilter}
                                        className="h-[38px] px-8 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                                    >
                                        FILTRAR
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="h-[38px] px-8 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        LIMPIAR
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                                Fecha {filters.sort_by === 'created_at' && (filters.sort_order === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('messenger_name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                                                Mensajero {filters.sort_by === 'messenger_name' && (filters.sort_order === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Evidencia</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {reports.data.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {new Date(report.created_at).toLocaleString('es-CO')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {report.messenger.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-bold">
                                                        {types[report.type] || report.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex justify-center">
                                                        <img
                                                            src={`/storage/${report.evidence_path}`}
                                                            alt="Evidencia"
                                                            className="h-10 w-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-150 transition-all"
                                                            onClick={() => setSelectedReport(report)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedReport(report)}
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-sm"
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
                                                className={`px-3 py-1 rounded ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} ${!link.url && 'opacity-50'}`}
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

            {/* Modal de Detalles */}
            {selectedReport && (
                <Modal show={true} onClose={() => setSelectedReport(null)}>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">🔍 Detalle de Limpieza</h3>
                                <p className="text-sm text-slate-500">{selectedReport.messenger.name} ({selectedReport.messenger.vehicle})</p>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="text-2xl text-slate-400">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Evidencia Fotográfica</h4>
                                <a href={`/storage/${selectedReport.evidence_path}`} target="_blank" rel="noreferrer">
                                    <img
                                        src={`/storage/${selectedReport.evidence_path}`}
                                        alt="Evidencia completa"
                                        className="w-full rounded-2xl shadow-xl border border-slate-100 hover:opacity-90 transition-opacity"
                                    />
                                </a>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Respuestas</h4>
                                    <div className="space-y-2">
                                        {Object.entries(selectedReport.answers).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                                <span className={`text-lg font-black ${value ? 'text-emerald-600' : 'text-red-600'}`}>{value ? '✓' : '✗'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {selectedReport.observations && (
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones</h4>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-sm italic text-amber-900 dark:text-amber-200">
                                            "{selectedReport.observations}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <SecondaryButton onClick={() => setSelectedReport(null)} className="w-full justify-center">Cerrar</SecondaryButton>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de Exportación */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <h2 className="text-xl font-bold mb-4">📂 Exportar a Excel</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Selecciona el rango de fechas para exportar los reportes de limpieza.
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
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tipo (Opcional)</label>
                            <select
                                value={exportDates.type}
                                onChange={(e) => setExportDates({ ...exportDates, type: e.target.value })}
                                className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                            >
                                <option value="">Todos los tipos</option>
                                {Object.entries(types).map(([id, label]) => (
                                    <option key={id} value={id}>{label}</option>
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
        </LeaderLayout>
    );
}
