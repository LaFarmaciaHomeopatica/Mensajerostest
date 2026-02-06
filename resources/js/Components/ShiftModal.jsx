import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';

export default function ShiftModal({ isOpen, onClose, shift, onSave, onDelete, date, messengerName, errors }) {
    const [data, setData] = useState({
        start_time: '',
        end_time: '',
        status: 'present',
    });

    useEffect(() => {
        if (shift) {
            setData({
                start_time: shift.start_time ? shift.start_time.substring(0, 5) : '',
                end_time: shift.end_time ? shift.end_time.substring(0, 5) : '',
                status: shift.status || 'present',
                location: shift.location || 'principal',
            });
        } else {
            setData({
                start_time: '08:00',
                end_time: '17:00',
                status: 'present',
                location: 'principal',
            });
        }
    }, [shift, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e) => {
        setData(prev => ({ ...prev, status: e.target.checked ? 'absent' : 'present' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(data);
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {shift ? 'Editar Turno' : 'Asignar Turno'} - {messengerName}
                </h2>
                <p className="text-sm text-gray-500 mb-4">Fecha: {date}</p>

                <div className="mb-4">
                    <InputLabel value="Ubicación" />
                    <SelectInput
                        name="location"
                        value={data.location}
                        onChange={handleChange}
                        className="mt-1 block w-full"
                    >
                        <option value="principal">Principal (116)</option>
                        <option value="teusaquillo">Teusaquillo</option>
                    </SelectInput>
                </div>

                <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.status === 'absent'}
                            onChange={handleStatusChange}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No Asiste</span>
                    </label>
                </div>

                {data.status === 'present' && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel value="Hora Inicio" />
                            <TextInput
                                type="time"
                                name="start_time"
                                value={data.start_time}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors?.start_time && <div className="text-red-500 text-xs mt-1">{errors.start_time}</div>}
                        </div>
                        <div>
                            <InputLabel value="Hora Fin" />
                            <TextInput
                                type="time"
                                name="end_time"
                                value={data.end_time}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                                required
                            />
                            {errors?.end_time && <div className="text-red-500 text-xs mt-1">{errors.end_time}</div>}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    {shift && (
                        <DangerButton type="button" onClick={() => onDelete(shift.id)}>
                            ELIMINAR
                        </DangerButton>
                    )}
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton type="submit">Guardar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
