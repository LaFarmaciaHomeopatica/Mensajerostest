import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';

export default function LunchReport({ logs, filters }) {
    const [date, setDate] = useState(filters.date || '');

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(route('reports.lunch'), { date: newDate }, { preserveState: true, replace: true });
    };

    return (
        <LeaderLayout title="Reporte de Almuerzos">
            <Head title="Reporte Almuerzos" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reporte de Almuerzos</h1>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Filtrar por fecha:</span>
                        <input
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                            className="rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {date && (
                            <button
                                onClick={() => {
                                    setDate('');
                                    router.get(route('reports.lunch'), {}, { preserveState: true, replace: true });
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-bold underline"
                            >
                                Limpiar
                            </button>
                        )}
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
        </LeaderLayout>
    );
}
