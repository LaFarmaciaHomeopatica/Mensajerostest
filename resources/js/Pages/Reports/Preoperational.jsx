import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PreoperationalReports({ reports, messengers, questions, filters }) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedMessenger, setSelectedMessenger] = useState(filters.messenger_id || '');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });

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
        }, {
            preserveState: true,
        });
    };

    const handleClearFilters = () => {
        setSelectedDate('');
        setSelectedMessenger('');
        router.get(route('reports.preoperational'));
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (!exportDates.start || !exportDates.end) {
            alert('Por favor selecciona ambas fechas para exportar.');
            return;
        }

        const params = {
            start_date: exportDates.start,
            end_date: exportDates.end,
        };

        if (selectedMessenger) {
            params.messenger_id = selectedMessenger;
        }

        window.location.href = route('reports.preoperational.export', params);
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
            <Head title="Reportes Preoperacionales" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header and Export Button */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">📋 Reportes Preoperacionales</h2>
                                <div className="flex gap-3">
                                    <Link
                                        href={route('preoperational-questions.index')}
                                        className="px-6 py-2 bg-amber-600 text-white rounded-lg font-semibold uppercase tracking-wider hover:bg-amber-700 transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
                                    >
                                        ⚙️ Config Preguntas
                                    </Link>
                                    <button
                                        onClick={() => setShowExportModal(true)}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md active:transform active:scale-95 flex items-center gap-2"
                                    >
                                        📥 Exportar Reporte
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-6 flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Fecha</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-2">Mensajero</label>
                                    <select
                                        value={selectedMessenger}
                                        onChange={(e) => setSelectedMessenger(e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                    >
                                        <option value="">Todos</option>
                                        {messengers.map((messenger) => (
                                            <option key={messenger.id} value={messenger.id}>
                                                {messenger.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFilter}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Filtrar
                                    </button>
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>

                            {/* Reports Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Fecha/Hora
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Mensajero
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Placa
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Hora Ingreso
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Cumplimiento
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Respuestas
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Acciones
                                            </th>
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
                                                    {report.messenger.vehicle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    {report.shift ? (
                                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                            {report.shift.start_time}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Sin turno</span>
                                                    )}
                                                </td>
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
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-1">
                                                        {Object.entries(report.answers).map(([key, value]) => (
                                                            <span
                                                                key={key}
                                                                className={`text-lg font-bold ${getAnswerColor(value)}`}
                                                                title={key}
                                                            >
                                                                {getAnswerIcon(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
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

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                            <input
                                type="date"
                                value={exportDates.start}
                                onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                            <input
                                type="date"
                                value={exportDates.end}
                                onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            />
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
