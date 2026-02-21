import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        vehicle: '',
        lunch_duration: 60,
        location: 'principal', // default
        beetrack_id: '',
        is_active: true
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('messengers.store'));
    };

    return (
        <LeaderLayout title="Nuevo Mensajero">
            <Head title="Crear Mensajero" />

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-black mb-8 text-gray-800 dark:text-gray-100 tracking-tight">Registrar Mensajero</h2>

                    <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Name */}
                            <div>
                                <InputLabel value="Nombre Completo" />
                                <TextInput
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full"
                                    placeholder="Ej. Juan Pérez"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>

                            {/* Vehicle */}
                            <div>
                                <InputLabel value="Placa Vehículo" />
                                <TextInput
                                    type="text"
                                    value={data.vehicle}
                                    onChange={e => setData('vehicle', e.target.value.toUpperCase())}
                                    className="w-full uppercase font-mono"
                                    placeholder="ABC-123"
                                    required
                                />
                                {errors.vehicle && <p className="text-red-500 text-xs mt-1 font-bold">{errors.vehicle}</p>}
                            </div>

                            {/* Location */}
                            <div>
                                <InputLabel value="Ubicación Base" />
                                <SelectInput
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="w-full"
                                >
                                    <option value="principal">Principal (116)</option>
                                    <option value="teusaquillo">Teusaquillo</option>
                                </SelectInput>
                                {errors.location && <p className="text-red-500 text-xs mt-1 font-bold">{errors.location}</p>}
                            </div>

                            {/* Lunch Duration */}
                            <div>
                                <InputLabel value="Duración Almuerzo (min)" />
                                <TextInput
                                    type="number"
                                    value={data.lunch_duration}
                                    onChange={e => setData('lunch_duration', e.target.value)}
                                    className="w-full"
                                    required
                                    min="1"
                                />
                                {errors.lunch_duration && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lunch_duration}</p>}
                            </div>

                            {/* Beetrack ID (Opcional) */}
                            <div>
                                <InputLabel value="ID Beetrack (Opcional)" />
                                <TextInput
                                    type="text"
                                    value={data.beetrack_id}
                                    onChange={e => setData('beetrack_id', e.target.value)}
                                    className="w-full"
                                    placeholder="ID externo"
                                />
                                {errors.beetrack_id && <p className="text-red-500 text-xs mt-1 font-bold">{errors.beetrack_id}</p>}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </div>
                                    <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">¿Mensajero Activo?</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <SecondaryButton onClick={() => router.get(route('messengers.index'))}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Guardando...' : 'GUARDAR MENSAJERO'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </LeaderLayout>
    );
}
