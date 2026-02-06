import React, { useState, useEffect, useCallback } from 'react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import { Head } from '@inertiajs/react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';

export default function Dashboard({ messengers, locations }) {
    // Filters
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMessenger, setSelectedMessenger] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    // Data Stats
    const [generalStats, setGeneralStats] = useState({});
    const [cleaningData, setCleaningData] = useState({ trends: [], quality: {} });
    const [mechanicalData, setMechanicalData] = useState([]);
    const [complianceData, setComplianceData] = useState([]);
    const [routeStats, setRouteStats] = useState({ managed: 0, potential: 0, rate: 0 });
    const [dispatchTrend, setDispatchTrend] = useState([]);
    const [lunchStats, setLunchStats] = useState({ avg_duration: 0, history: [] });
    const [completionStats, setCompletionStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            messenger_id: selectedMessenger
        });

        try {
            const [gen, cleaning, mechanical, compliance, routes, trend, lunch, completion] = await Promise.all([
                fetch(`${route('analytics.general')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.cleaning')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.mechanical')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.compliance')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.route-stats')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.dispatch-trend')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.lunch')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.completion')}?${params}`).then(res => res.json()),
            ]);

            setGeneralStats(gen);
            setCleaningData(cleaning);
            setMechanicalData(mechanical.failures || []);
            setComplianceData(compliance || []);
            setRouteStats(routes);
            setDispatchTrend(trend || []);
            setLunchStats(lunch);
            setCompletionStats(completion);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedMessenger]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const tabs = [
        { id: 'overview', label: 'Vista General' },
        { id: 'cleaning', label: 'Aseo & Preop' },
        { id: 'routes', label: 'Rutas & Despacho' },
        { id: 'compliance', label: 'Tiempos & Cumplimiento' },
    ];

    const StatCard = ({ label, value, subtext, color = "indigo" }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            <h3 className={`text-3xl font-black text-${color}-500 mt-1`}>{value}</h3>
            <p className="text-slate-500 text-xs mt-2">{subtext}</p>
        </div>
    );

    return (
        <LeaderLayout title="Inteligencia de Datos">
            <Head title="Análisis de Operación" />

            <div className="p-6 max-w-[1800px] mx-auto space-y-6">
                {/* Header & Global Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Panel de Inteligencia</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Control avanzado de la operación y cumplimiento</p>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div>
                            <InputLabel htmlFor="start_date" value="Desde" />
                            <TextInput
                                id="start_date"
                                type="date"
                                className="mt-1 block w-40"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="end_date" value="Hasta" />
                            <TextInput
                                id="end_date"
                                type="date"
                                className="mt-1 block w-40"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="messenger" value="Mensajero" />
                            <select
                                id="messenger"
                                className="mt-1 block w-56 border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                value={selectedMessenger}
                                onChange={(e) => setSelectedMessenger(e.target.value)}
                            >
                                <option value="">Todos los mensajeros</option>
                                {messengers.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <PrimaryButton onClick={fetchData} className="mb-[2px] h-[42px]">
                            Filtrar
                        </PrimaryButton>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                        <p className="text-slate-500 animate-pulse font-medium">Analizando datos...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tab Content: Overview */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <StatCard label="Reportes Preop" value={generalStats.preop_count} subtext="Revisiones diarias" />
                                    <StatCard label="Limpiezas" value={generalStats.cleaning_count} subtext="Mantenimiento físico" color="emerald" />
                                    <StatCard label="Guías Despachadas" value={generalStats.dispatch_guides} subtext="Volumen de salida" color="amber" />
                                    <StatCard label="Almuerzos" value={generalStats.lunch_count} subtext="Registros en periodo" color="purple" />
                                    <StatCard label="Cierres de Turno" value={generalStats.completion_count} subtext="Salidas reportadas" color="rose" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Tendencia de Actividad</h4>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={dispatchTrend}>
                                                    <defs>
                                                        <linearGradient id="colorGuides" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                    <Area type="monotone" dataKey="guides" stroke="#6366f1" fillOpacity={1} fill="url(#colorGuides)" strokeWidth={3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Cumplimiento de Flota (%)</h4>
                                        <div className="h-[350px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={complianceData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={0} angle={-30} textAnchor="end" height={60} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                    <Bar dataKey="rate" radius={[6, 6, 0, 0]} barSize={24}>
                                                        {complianceData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.rate < 80 ? '#f43f5e' : '#10b981'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tab Content: Cleaning */}
                        {activeTab === 'cleaning' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Calidad de Limpieza</h4>
                                    <div className="h-[350px] w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Aseo General', value: cleaningData.quality.aseo_general },
                                                        { name: 'Desinfección', value: cleaningData.quality.desinfeccion },
                                                        { name: 'Orden', value: cleaningData.quality.orden },
                                                    ]}
                                                    cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value"
                                                >
                                                    {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Fallas Preoperacionales</h4>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={mechanicalData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.1} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="issue" type="category" width={150} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                <Bar dataKey="count" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Routes */}
                        {activeTab === 'routes' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Rutas (Beetrack Live / Logs)</h4>
                                    <div className="flex items-center justify-around h-[350px]">
                                        <div className="text-center">
                                            <h5 className="text-slate-400 text-xs font-bold uppercase mb-2">Efectividad Total</h5>
                                            <div className="relative inline-flex items-center justify-center">
                                                <svg className="w-32 h-32">
                                                    <circle className="text-slate-200 dark:text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                                    <circle className="text-emerald-500" strokeWidth="10" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * routeStats.rate) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                                                </svg>
                                                <span className="absolute text-2xl font-black text-slate-800 dark:text-white">{routeStats.rate}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase">Entregas Gestionadas</p>
                                                <p className="text-2xl font-black text-slate-800 dark:text-white">{routeStats.managed}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase">Potencial de Ruta</p>
                                                <p className="text-2xl font-black text-slate-800 dark:text-white">{routeStats.potential}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Volumen Histórico de Guías</h4>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dispatchTrend}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                <Line type="monotone" dataKey="guides" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b' }} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Compliance/Time */}
                        {activeTab === 'compliance' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight">Cierres de Turno por Hora</h4>
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={completionStats}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Análisis de Almuerzos</h4>
                                        <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                                            <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">Promedio {lunchStats.avg_duration} min</span>
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full overflow-y-auto pr-2 custom-scrollbar">
                                        <table className="w-full text-left text-sm">
                                            <thead className="text-xs text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                                                <tr>
                                                    <th className="pb-3 px-2">Fecha</th>
                                                    <th className="pb-3 px-2">Mensajero</th>
                                                    <th className="pb-3 px-2 text-right">Duración</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {lunchStats.history.map((h, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                        <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{h.date}</td>
                                                        <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{h.messenger}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${h.duration > 60 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                {h.duration}m
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6366f1;
                    border-radius: 10px;
                }
            `}} />
        </LeaderLayout>
    );
}
