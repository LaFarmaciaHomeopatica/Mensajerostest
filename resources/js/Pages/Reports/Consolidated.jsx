import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';
import ExportModal from '@/Components/ExportModal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';

export default function ConsolidatedReport({ reportData, messengers, filters, locations }) {
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedMessenger, setSelectedMessenger] = useState(filters.messenger_id || '');
    const [selectedLocation, setSelectedLocation] = useState(filters.location || '');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const handleFilter = () => {
        router.get(route('reports.consolidated'), {
            date: selectedDate,
            messenger_id: selectedMessenger,
            location: selectedLocation,
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSelectedDate('');
        setSelectedMessenger('');
        setSelectedLocation('');
        router.get(route('reports.consolidated'));
    };

    const handleExport = (filters) => {
        window.location.href = route('reports.consolidated.export', filters);
        setIsExportModalOpen(false);
    };

    return (
        <LeaderLayout>
            <Head title="Reporte Consolidado" />

            <div className="py-12">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    <span className="bg-indigo-600/10 p-2 rounded-xl text-xl">📊</span>
                                    Reporte Consolidado
                                </h1>
                                <SuccessButton
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    EXPORTAR
                                </SuccessButton>
                            </div>

                            {/* Filters */}
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">FECHA</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-[46px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">MENSAJERO</label>
                                    <MessengerSearchSelect
                                        messengers={messengers}
                                        selectedId={selectedMessenger}
                                        onChange={setSelectedMessenger}
                                        placeholder="Todos los mensajeros"
                                    />
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">SEDE</label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full h-[46px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                                    >
                                        <option value="">Todas las sedes</option>
                                        {locations?.map((loc) => (
                                            <option key={loc.name} value={loc.name}>
                                                {loc.name.charAt(0).toUpperCase() + loc.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-2">
                                    <PrimaryButton
                                        onClick={handleFilter}
                                        className="h-[46px] px-8"
                                    >
                                        FILTRAR
                                    </PrimaryButton>
                                    <SecondaryButton
                                        onClick={handleReset}
                                        className="h-[46px] px-8"
                                    >
                                        LIMPIAR
                                    </SecondaryButton>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Mensajero / Placa</th>
                                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sede</th>
                                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Preoperacional</th>
                                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Limpieza</th>
                                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Almuerzo</th>
                                            <th className="px-6 py-4 text-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Fin Turno</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {reportData.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{row.name}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 w-fit px-2 py-0.5 rounded mt-1">{row.vehicle}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        {row.location}
                                                    </span>
                                                </td>

                                                {/* Preoperational */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {row.preoperational ? (
                                                        <div className="flex flex-col items-center">
                                                            {(() => {
                                                                const { status, compliant, shift_start } = row.preoperational;

                                                                // LOGIC 1: Has Shift assigned
                                                                if (shift_start) {
                                                                    // Special Check: 00:00 shift means "No asiste"
                                                                    if (shift_start === '00:00' || shift_start === '00:00:00') {
                                                                        return (
                                                                            <>
                                                                                <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                                    ⚠ No asiste
                                                                                </div>
                                                                                <span className="text-[9px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">
                                                                                    No asiste
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    }

                                                                    let statusBadge;

                                                                    if (status === 'No realizado') {
                                                                        statusBadge = (
                                                                            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                                                ℹ Sin registro
                                                                            </div>
                                                                        );
                                                                    } else if (compliant === true) {
                                                                        statusBadge = (
                                                                            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                                ✓ A tiempo
                                                                            </div>
                                                                        );
                                                                    } else {
                                                                        // Includes compliant === false (Tardío)
                                                                        statusBadge = (
                                                                            <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                                                                ⚠ Tardío
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <>
                                                                            {statusBadge}
                                                                            <span className="text-[10px] text-gray-400 font-mono">{row.preoperational.time}</span>
                                                                            <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                                                                (Turno: {shift_start})
                                                                            </span>
                                                                        </>
                                                                    );
                                                                }

                                                                // LOGIC 2: No Shift assigned
                                                                return (
                                                                    <>
                                                                        <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 mb-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                                            N/A
                                                                        </div>
                                                                        <span className="text-[9px] text-gray-400 dark:text-gray-600 font-mono mt-0.5">
                                                                            (Sin turno)
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-gray-300 dark:text-gray-600 text-xl font-bold">-</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Cleaning */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {row.cleaning ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-1">
                                                                ✓ Realizado ({row.cleaning.count})
                                                            </span>
                                                            <div className="flex flex-col gap-1 mt-1">
                                                                {row.cleaning.types.map((type, idx) => {
                                                                    const isWeekly = type.includes('semanal');
                                                                    const isMonthly = type.includes('mensual');
                                                                    const frequency = isWeekly ? 'Semanal' : (isMonthly ? 'Mensual' : '');
                                                                    const icon = type.includes('maletas') ? '🎒' : '🏍️';

                                                                    return (
                                                                        <span key={idx} className="flex items-center gap-1.5 text-[10px] uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 w-fit mx-auto" title={type}>
                                                                            <span className="text-sm">{icon}</span>
                                                                            <span className="font-bold">{frequency}</span>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {row.preoperational?.shift_start === '00:00' || row.preoperational?.shift_start === '00:00:00' ? (
                                                                <div className="flex flex-col items-center opacity-50">
                                                                    <span className="text-xs text-red-400 font-bold">No asiste</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300 dark:text-gray-600 text-2xl font-bold">-</span>
                                                            )}
                                                        </>
                                                    )}
                                                </td>

                                                {/* Lunch */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {row.lunch ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className={`px-3 py-1 rounded-full text-xs font-bold mb-1 ${row.lunch.status === 'finished' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                }`}>
                                                                {row.lunch.status === 'finished' ? '✓ Completado' : '⏳ En curso'}
                                                            </div>
                                                            <div className="text-[10px] text-gray-500 font-mono">
                                                                {row.lunch.start} - {row.lunch.end || '...'}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {row.preoperational?.shift_start === '00:00' || row.preoperational?.shift_start === '00:00:00' ? (
                                                                <div className="flex flex-col items-center opacity-50">
                                                                    <span className="text-xs text-red-400 font-bold">No asiste</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300 dark:text-gray-600 text-2xl font-bold">-</span>
                                                            )}
                                                        </>
                                                    )}
                                                </td>

                                                {/* Shift End */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {row.shift_end ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 px-3 py-1 rounded-full text-xs font-bold mb-1">
                                                                🏁 Finalizado
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-mono">{row.shift_end.time}</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {row.preoperational?.shift_start === '00:00' || row.preoperational?.shift_start === '00:00:00' ? (
                                                                <div className="flex flex-col items-center opacity-50">
                                                                    <span className="text-xs text-red-400 font-bold">No asiste</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-300 dark:text-gray-600 text-2xl font-bold">-</span>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {reportData.links && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Mostrando {reportData.from} a {reportData.to} de {reportData.total} resultados
                                    </div>
                                    <div className="flex gap-2">
                                        {reportData.links.map((link, index) => (
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

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
                locations={locations}
                messengers={messengers}
                reportType="Consolidado"
            />
        </LeaderLayout>
    );
}
