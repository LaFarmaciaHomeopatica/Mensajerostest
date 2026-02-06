import React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import DangerButton from '@/Components/DangerButton';

export default function Index({ messengers, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        router.get(route('messengers.index'), { search: value }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este mensajero?')) {
            router.delete(route('messengers.destroy', id));
        }
    };

    return (
        <LeaderLayout title="Administración de Mensajeros">
            <Head title="Mensajeros" />

            <div className="max-w-[1800px] mx-auto p-3 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Mensajeros</h1>

                    <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
                        <div className="relative flex-grow sm:min-w-[300px] group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={handleSearch}
                                placeholder="Buscar nombre o vehículo..."
                                className="pl-10 w-full py-3 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>

                        <Link
                            href={route('messengers.create')}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-2"
                        >
                            <span>➕</span> Nuevo Mensajero
                        </Link>
                    </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Analíticas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ubicación</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {messengers.data.map((messenger) => (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${!messenger.exclude_from_analytics
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                }`}>
                                                {!messenger.exclude_from_analytics ? 'Incluido' : 'Excluido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                            {messenger.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('messengers.edit', messenger.id)}
                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 font-bold uppercase text-[10px] tracking-widest mr-4 transition-colors"
                                            >
                                                EDITAR
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(messenger.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 font-bold uppercase text-[10px] tracking-widest transition-colors"
                                            >
                                                ELIMINAR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center flex-wrap gap-2">
                    {messengers.links.map((link, key) => (
                        link.url ? (
                            <Link
                                key={key}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all
                                    ${link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}
                                `}
                            />
                        ) : (
                            <span
                                key={key}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className="px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-xs font-bold"
                            />
                        )
                    ))}
                </div>
            </div>
        </LeaderLayout>
    );
}
