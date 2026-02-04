import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';

export default function Index({ messengers }) {
    const { flash } = usePage().props;

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este mensajero?')) {
            router.delete(route('messengers.destroy', id));
        }
    };

    return (
        <LeaderLayout title="Administración de Mensajeros">
            <Head title="Mensajeros" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mensajeros</h1>
                    <Link
                        href={route('messengers.create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"
                    >
                        + Nuevo Mensajero
                    </Link>
                </div>

                {flash.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                        <p>{flash.success}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duración Almuerzo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ubicación</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {messengers.map((messenger) => (
                                    <tr key={messenger.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {messenger.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {messenger.vehicle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {messenger.lunch_duration} min
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${messenger.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                {messenger.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {messenger.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('messengers.edit', messenger.id)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 mr-4"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(messenger.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </LeaderLayout>
    );
}
