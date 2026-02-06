import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function LunchReport({ logs, filters }) {
    const [date, setDate] = useState(filters.date || '');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(route('reports.lunch'), { date: newDate }, { preserveState: true, replace: true });
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (!exportDates.start || !exportDates.end) {
            alert('Por favor selecciona ambas fechas para exportar.');
            return;
        }

        const params = new URLSearchParams({
            start_date: exportDates.start,
            end_date: exportDates.end
        }).toString();

        window.location.href = route('reports.lunch.export') + '?' + params;
        setShowExportModal(false);
    };

    return (
        <LeaderLayout title="Reporte de Almuerzos">
            <Head title="Reporte Almuerzos" />

            <div className="max-w-[1800px] mx-auto p-3 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Reporte de Almuerzos</h1>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <SuccessButton
                            onClick={() => setShowExportModal(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            EXPORTAR
                        </SuccessButton>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-2">Filtrar:</span>
                            <TextInput
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="border-none bg-transparent dark:text-white text-xs focus:ring-0 py-1 shadow-none"
                            />
                            {date && (
                                <button
                                    onClick={() => {
                                        setDate('');
                                        router.get(route('reports.lunch'), {}, { preserveState: true, replace: true });
                                    }}
                                    className="p-1 px-2 text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold uppercase transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mensajero</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inicio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fin (Estimado)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {log.messenger?.name || 'Desconocido'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${log.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {log.status === 'active' ? 'Activo' : log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No hay registros de almuerzo.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex justify-center">
                    {logs.links.map((link, key) => (
                        link.url ? (
                            <Link
                                key={key}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 mx-1 rounded border text-sm
                                    ${link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
                                `}
                            />
                        ) : (
                            <span
                                key={key}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="px-4 py-2 mx-1 rounded border bg-gray-100 text-gray-400 text-sm"
                            />
                        )
                    ))}
                </div>
            </div>

            {/* Export Modal */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                        📥 Exportar Reporte de Almuerzos
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Selecciona el rango de fechas para generar el archivo Excel.
                    </p>

                    <form onSubmit={handleExport}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <InputLabel value="Fecha Inicio" />
                                <TextInput
                                    type="date"
                                    required
                                    value={exportDates.start}
                                    onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <InputLabel value="Fecha Fin" />
                                <TextInput
                                    type="date"
                                    required
                                    value={exportDates.end}
                                    onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <SecondaryButton onClick={() => setShowExportModal(false)}>
                                Cancelar
                            </SecondaryButton>
                            <SuccessButton type="submit" className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                EXPORTAR
                            </SuccessButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </LeaderLayout>
    );
}
