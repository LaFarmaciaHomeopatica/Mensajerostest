import React, { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';

export default function ExportModal({ isOpen, onClose, onExport, locations, messengers, reportType = 'reporte' }) {
    if (!isOpen) return null;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedMessenger, setSelectedMessenger] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onExport({
            start_date: startDate,
            end_date: endDate,
            location: selectedLocation,
            messenger_id: selectedMessenger
        });
    };

    // Safe locations check
    const safeLocations = Array.isArray(locations) ? locations : [];

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="p-6 text-gray-900 dark:text-gray-100">
                <h2 className="text-xl font-bold mb-4">📂 Exportar {reportType}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Selecciona el rango de fechas para exportar el reporte.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Inicio</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Fecha Fin</label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mensajero (Opcional)</label>
                        <MessengerSearchSelect
                            messengers={messengers}
                            selectedId={selectedMessenger}
                            onChange={setSelectedMessenger}
                            placeholder="Todos los mensajeros"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sede (Opcional)</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full h-[38px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                        >
                            <option value="">Todas las sedes</option>
                            {safeLocations.map((loc, index) => (
                                <option key={index} value={loc.name}>
                                    {loc.name.charAt(0).toUpperCase() + loc.name.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <SecondaryButton onClick={onClose} className="uppercase tracking-widest text-xs">
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-900 focus:ring-indigo-500 uppercase tracking-widest text-xs">
                        Generar Reporte
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}
