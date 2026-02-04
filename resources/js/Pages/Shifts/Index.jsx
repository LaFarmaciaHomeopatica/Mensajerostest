import React, { useState } from 'react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react'; // Correct router import from adapter
import ShiftModal from '@/Components/ShiftModal';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.locale('es');
dayjs.extend(isBetween);

export default function ShiftsIndex({ auth, messengers, weekStart, weekEnd }) {
    const { errors } = usePage().props;
    const [selectedShift, setSelectedShift] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [modalMessenger, setModalMessenger] = useState(null);

    const { data, setData, post, delete: destroy, reset } = useForm({});

    const start = dayjs(weekStart);
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));

    const handleCellClick = (messenger, dateString, shift) => {
        setModalMessenger(messenger);
        setModalDate(dateString);
        setSelectedShift(shift);
        setIsModalOpen(true);
    };

    const handleSave = (formData) => {
        router.post('/shifts', {
            ...formData,
            messenger_id: modalMessenger.id,
            date: modalDate,
        }, {
            onSuccess: () => setIsModalOpen(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este turno?')) {
            router.delete(`/shifts/${id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    return (
        <LeaderLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Horarios</h2>}
        >
            <Head title="Horarios" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href={`/shifts?date=${start.subtract(1, 'week').format('YYYY-MM-DD')}`}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            &lt; Semana Anterior
                        </Link>
                        <span className="text-lg font-bold dark:text-gray-200 uppercase">
                            {start.format('MMMM D')} - {dayjs(weekEnd).format('MMMM D, YYYY')}
                        </span>
                        <Link
                            href={`/shifts?date=${start.add(1, 'week').format('YYYY-MM-DD')}`}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Semana Siguiente &gt;
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 sticky left-0 bg-gray-50 dark:bg-gray-700 z-10 w-48">Mensajero</th>
                                    {days.map(d => (
                                        <th key={d.toString()} className="px-6 py-3 text-center min-w-[120px]">
                                            <div className="font-bold">{d.format('dddd')}</div>
                                            <div className="text-gray-400">{d.format('DD MMM')}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {messengers.map(messenger => (
                                    <tr key={messenger.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                                            {messenger.name}
                                            <div className="text-xs text-slate-500">{messenger.vehicle}</div>
                                        </td>
                                        {days.map(d => {
                                            const dateStr = d.format('YYYY-MM-DD');
                                            const shift = messenger.shifts.find(s => s.date === dateStr);

                                            // Determine cell style
                                            let cellClass = "px-2 py-4 text-center cursor-pointer transition border border-gray-100 dark:border-gray-700 ";
                                            if (shift) {
                                                if (shift.status === 'absent') {
                                                    cellClass += "bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50";
                                                } else if (shift.location === 'teusaquillo') {
                                                    cellClass += "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40";
                                                } else {
                                                    cellClass += "bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40";
                                                }
                                            } else {
                                                cellClass += "hover:bg-slate-50 dark:hover:bg-slate-700";
                                            }

                                            return (
                                                <td
                                                    key={dateStr}
                                                    onClick={() => handleCellClick(messenger, dateStr, shift)}
                                                    className={cellClass}
                                                >
                                                    {shift ? (
                                                        shift.status === 'absent' ? (
                                                            <span className="font-bold text-xs uppercase">No Asiste</span>
                                                        ) : (
                                                            <div className="flex flex-col text-xs font-mono">
                                                                <span>{shift.start_time?.substring(0, 5)}</span>
                                                                <span>-</span>
                                                                <span>{shift.end_time?.substring(0, 5)}</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600 text-2xl">+</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shift={selectedShift}
                date={modalDate}
                messengerName={modalMessenger?.name}
                onSave={handleSave}
                onDelete={handleDelete}
                errors={errors}
            />
        </LeaderLayout>
    );
}
