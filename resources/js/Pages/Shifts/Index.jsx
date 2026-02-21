import React, { useState } from 'react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react'; // Correct router import from adapter
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SuccessButton from '@/Components/SuccessButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
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
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });
    const [messengerSearch, setMessengerSearch] = useState('');

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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('shifts.import'), formData, {
            forceFormData: true,
            onSuccess: () => {
                alert('Horarios importados correctamente');
                e.target.value = ''; // Reset input
            },
            onError: (errors) => {
                alert(errors.file || 'Error al importar');
            }
        });
    };

    const handleExport = () => {
        if (!exportDates.start || !exportDates.end) {
            alert('Selecciona ambas fechas');
            return;
        }
        const url = route('shifts.export', { start_date: exportDates.start, end_date: exportDates.end });
        window.location.href = url;
        setShowExportModal(false);
    };

    return (
        <LeaderLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestión de Horarios</h2>}
        >
            <Head title="Horarios" />

            <div className="py-6 sm:py-12">
                <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-8 gap-6">
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                            <a
                                href={route('shifts.template')}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all font-sans"
                            >
                                📄 Plantilla
                            </a>
                            <label className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl font-bold text-[10px] text-white uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer">
                                📤 Cargar Turnos
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            <SuccessButton
                                onClick={() => setShowExportModal(true)}
                                className="justify-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                EXPORTAR
                            </SuccessButton>
                        </div>

                        {/* Messenger search — centro */}
                        <div className="relative flex items-center gap-2 bg-white dark:bg-slate-800 p-1 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <TextInput
                                type="text"
                                value={messengerSearch}
                                onChange={(e) => setMessengerSearch(e.target.value)}
                                placeholder="Buscar mensajero..."
                                className="border-none bg-transparent dark:text-white text-xs focus:ring-0 py-1 shadow-none w-40"
                            />
                            {messengerSearch && (
                                <button onClick={() => setMessengerSearch('')} className="pr-2 text-slate-400 hover:text-slate-600">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between sm:justify-center gap-4 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-2xl">
                            <Link
                                href={`/shifts?date=${start.subtract(1, 'week').format('YYYY-MM-DD')}`}
                                className="p-2 sm:px-4 bg-white dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                            >
                                <span className="font-black text-indigo-600">←</span>
                            </Link>
                            <span className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight text-center px-2">
                                {start.format('D MMM')} - {dayjs(weekEnd).format('D MMM')}
                            </span>
                            <Link
                                href={`/shifts?date=${start.add(1, 'week').format('YYYY-MM-DD')}`}
                                className="p-2 sm:px-4 bg-white dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                            >
                                <span className="font-black text-indigo-600">→</span>
                            </Link>
                        </div>
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
                                {messengers
                                    .filter(m => !messengerSearch || m.name.toLowerCase().includes(messengerSearch.toLowerCase()))
                                    .map(messenger => (
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

            {/* Export Modal */}
            <Modal show={showExportModal} onClose={() => setShowExportModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Exportar Reporte de Horarios</h2>

                    <div className="mb-4">
                        <InputLabel value="Fecha Inicio" />
                        <TextInput
                            type="date"
                            value={exportDates.start}
                            onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <div className="mb-6">
                        <InputLabel value="Fecha Fin" />
                        <TextInput
                            type="date"
                            value={exportDates.end}
                            onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={() => setShowExportModal(false)}>Cancelar</SecondaryButton>
                        <SuccessButton onClick={handleExport} className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            EXPORTAR
                        </SuccessButton>
                    </div>
                </div>
            </Modal>
        </LeaderLayout>
    );
}
