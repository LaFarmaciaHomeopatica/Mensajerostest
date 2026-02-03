import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';

export default function Edit({ messenger }) {
    const { data, setData, put, processing, errors } = useForm({
        name: messenger.name,
        vehicle: messenger.vehicle,
        lunch_duration: messenger.lunch_duration,
        location: messenger.location,
        beetrack_id: messenger.beetrack_id || '',
        is_active: messenger.is_active !== 0 && messenger.is_active !== false // Handle possibly 0/1 or boolean
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('messengers.update', messenger.id));
    };

    return (
        <LeaderLayout title="Editar Mensajero">
            <Head title="Editar Mensajero" />

            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-black mb-8 text-gray-800 dark:text-gray-100 tracking-tight">Editar Mensajero: <span className="text-indigo-600">{messenger.name}</span></h2>

                    <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 transition-all duration-200"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                            </div>

                            {/* Vehicle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Placa Vehículo</label>
                                <input
                                    type="text"
                                    value={data.vehicle}
                                    onChange={e => setData('vehicle', e.target.value.toUpperCase())}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 transition-all duration-200 uppercase font-mono"
                                    required
                                />
                                {errors.vehicle && <p className="text-red-500 text-xs mt-1 font-bold">{errors.vehicle}</p>}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Ubicación Base</label>
                                <div className="relative">
                                    <select
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 transition-all duration-200 appearance-none"
                                    >
                                        <option value="principal">Principal (116)</option>
                                        <option value="teusaquillo">Teusaquillo</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {errors.location && <p className="text-red-500 text-xs mt-1 font-bold">{errors.location}</p>}
                            </div>

                            {/* Lunch Duration */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Duración Almuerzo (min)</label>
                                <input
                                    type="number"
                                    value={data.lunch_duration}
                                    onChange={e => setData('lunch_duration', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 transition-all duration-200"
                                    required
                                    min="1"
                                />
                                {errors.lunch_duration && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lunch_duration}</p>}
                            </div>

                            {/* Beetrack ID (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">ID Beetrack (Opcional)</label>
                                <input
                                    type="text"
                                    value={data.beetrack_id}
                                    onChange={e => setData('beetrack_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 transition-all duration-200"
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
                            <Link
                                href={route('messengers.index')}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all font-bold text-sm shadow-sm"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5"
                            >
                                {processing ? 'Actualizando...' : 'ACTUALIZAR MENSAJERO'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </LeaderLayout>
    );
}
