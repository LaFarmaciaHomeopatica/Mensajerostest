import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';

export default function Index({ procedures, messengers, filters }) {
    const [selectedMessenger, setSelectedMessenger] = useState(filters.messenger_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [syncingId, setSyncingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkSyncing, setIsBulkSyncing] = useState(false);

    const handleFilter = () => {
        router.get(route('internal-procedures.index'), {
            messenger_id: selectedMessenger,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSelectedMessenger('');
        setSelectedStatus('');
        router.get(route('internal-procedures.index'));
    };

    const handleSync = (id) => {
        setSyncingId(id);
        router.post(route('internal-procedures.sync', id), {}, {
            preserveScroll: true,
            onFinish: () => setSyncingId(null),
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const syncableIds = procedures.data
                .filter(proc => proc.status !== 'synced')
                .map(proc => proc.id);
            setSelectedIds(syncableIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const handleBulkSync = () => {
        if (selectedIds.length === 0) return;

        setIsBulkSyncing(true);
        router.post(route('internal-procedures.sync-bulk'), {
            ids: selectedIds
        }, {
            preserveScroll: true,
            onFinish: () => {
                setIsBulkSyncing(false);
                setSelectedIds([]);
            },
        });
    };

    const getStatusBadge = (status) => {
        const configs = {
            created: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Creado' },
            synced: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Sincronizado' },
            failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Error' },
        };
        const config = configs[status] || configs.created;
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <LeaderLayout>
            <Head title="Trámites Internos" />

            <div className="py-6 sm:py-12">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    <span className="bg-indigo-600/10 p-2 rounded-xl text-xl">📦</span>
                                    Trámites Internos
                                </h1>
                                <Link
                                    href={route('internal-procedures.create')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 transition-all duration-200 text-xs uppercase tracking-widest"
                                >
                                    + Crear Trámite
                                </Link>
                            </div>

                            {/* Filters */}
                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-end text-black dark:text-white">
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
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ESTADO</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full h-[46px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm px-4 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="created">Creado</option>
                                        <option value="synced">Sincronizado</option>
                                        <option value="failed">Error</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleFilter}
                                        className="h-[46px] px-8 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    >
                                        FILTRAR
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMessenger('');
                                            setSelectedStatus('');
                                            router.get(route('internal-procedures.index'));
                                        }}
                                        className="h-[46px] px-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                                    >
                                        LIMPIAR
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Action Toolbar */}
                            {selectedIds.length > 0 && (
                                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {selectedIds.length} trámite(s) seleccionado(s)
                                        </span>
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline"
                                        >
                                            Limpiar selección
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleBulkSync}
                                        disabled={isBulkSyncing}
                                        className={`
                                            px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                                            ${isBulkSyncing
                                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95'}
                                        `}
                                    >
                                        {isBulkSyncing ? '⏳ Sincronizando...' : `🔄 Sincronizar ${selectedIds.length}`}
                                    </button>
                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
                                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-4 text-center w-12">
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedIds.length > 0 && selectedIds.length === procedures.data.filter(p => p.status !== 'synced').length}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mensajero</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino / Acción</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                        {procedures.data.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                                    No se encontraron trámites internos.
                                                </td>
                                            </tr>
                                        ) : (
                                            procedures.data.map((proc) => (
                                                <tr key={proc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-4 py-4 text-center">
                                                        {proc.status !== 'synced' && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(proc.id)}
                                                                onChange={() => handleSelectOne(proc.id)}
                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                                            {proc.code}
                                                        </span>
                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                            {new Date(proc.created_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                            {proc.messenger?.name || 'No asignado'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {proc.messenger?.vehicle || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {proc.item_name ? (
                                                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                                                    {proc.item_name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">Sin acción definida</span>
                                                            )}

                                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                                <span className="text-slate-400">📍</span>
                                                                {proc.destination_address} {proc.destination_city && <span className="text-slate-400 text-xs">({proc.destination_city})</span>}
                                                            </div>

                                                            <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                                <span className="flex items-center gap-1">👤 {proc.contact_name}</span>
                                                                <span className="flex items-center gap-1">📞 {proc.contact_phone}</span>
                                                                {proc.contact_identifier && <span className="flex items-center gap-1">🆔 {proc.contact_identifier}</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(proc.status)}
                                                        {proc.beetrack_id && (
                                                            <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                                                                ID: {proc.beetrack_id}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {proc.status !== 'synced' && (
                                                            <button
                                                                onClick={() => handleSync(proc.id)}
                                                                disabled={syncingId === proc.id}
                                                                className={`
                                                                    text-xs font-bold uppercase tracking-tighter flex items-center gap-1 mx-auto group
                                                                    ${syncingId === proc.id
                                                                        ? 'text-slate-400 cursor-not-allowed'
                                                                        : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300'}
                                                                `}
                                                            >
                                                                <span className={`transition-transform duration-500 ${syncingId === proc.id ? 'animate-spin' : 'group-hover:rotate-180'}`}>
                                                                    {syncingId === proc.id ? '⏳' : '🔄'}
                                                                </span>
                                                                {syncingId === proc.id ? 'Sincronizando...' : 'Sincronizar'}
                                                            </button>
                                                        )}
                                                        {proc.status === 'synced' && (
                                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                                                                Completado
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {procedures.links && procedures.links.length > 3 && (
                                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        Página {procedures.current_page} de {procedures.last_page} — {procedures.total} registros
                                    </div>
                                    <div className="flex gap-1">
                                        {procedures.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url || link.active}
                                                className={`
                                                    min-w-[32px] h-[32px] flex items-center justify-center rounded-lg text-[10px] font-black transition-all
                                                    ${link.active
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'}
                                                    ${!link.url && 'opacity-30 cursor-not-allowed'}
                                                `}
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
        </LeaderLayout>
    );
}
