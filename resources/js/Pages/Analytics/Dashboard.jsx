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
    const [messengerSearch, setMessengerSearch] = useState('');
    const [isMessengerDropdownOpen, setIsMessengerDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Data Stats
    const [generalStats, setGeneralStats] = useState({});
    const [cleaningData, setCleaningData] = useState({ trends: [], quality: {} });
    const [mechanicalData, setMechanicalData] = useState([]);
    const [complianceData, setComplianceData] = useState([]);
    const [cleaningComplianceData, setCleaningComplianceData] = useState([]);
    const [exitAnalysis, setExitAnalysis] = useState({ avg_diff: 0, history: [] });
    const [completionStats, setCompletionStats] = useState([]);
    const [attendanceCompliance, setAttendanceCompliance] = useState([]);
    const [performanceSummary, setPerformanceSummary] = useState({ top: [], attention: [], health: { preop: 0, cleaning: 0, attendance: 0, global: 0 } });
    const [sectionTrends, setSectionTrends] = useState([]);
    const [globalTrend, setGlobalTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    const filteredTrend = React.useMemo(() => {
        if (!globalTrend || globalTrend.length === 0) return [];
        // Find first day with any activity
        const firstActive = globalTrend.findIndex(d => d.preop > 0 || d.cleaning > 0 || d.tiempos > 0);
        if (firstActive === -1) return globalTrend.slice(-7); // If all zero, show last week
        // Start from first activity or at least show some context before if possible
        return globalTrend.slice(Math.max(0, firstActive - 1));
    }, [globalTrend]);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            messenger_id: selectedMessenger
        });

        try {
            const [gen, cleaning, mechanical, compliance, cleaningComp, completion, summary, section, attendance, exit, globalTrendData] = await Promise.all([
                fetch(`${route('analytics.general')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.cleaning')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.mechanical')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.compliance')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.cleaning-compliance')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.completion')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.performance-summary')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.section-trends')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.attendance-compliance')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.exit-analysis')}?${params}`).then(res => res.json()),
                fetch(`${route('analytics.global-trend')}?${params}`).then(res => res.json()),
            ]);

            setGeneralStats(gen);
            setCleaningData(cleaning);
            setMechanicalData(mechanical.failures || []);
            setComplianceData(compliance || []);
            setCleaningComplianceData(cleaningComp || []);
            setCompletionStats(completion);
            setPerformanceSummary(summary);
            setSectionTrends(section);
            setAttendanceCompliance(attendance);
            setExitAnalysis(exit);
            setGlobalTrend(globalTrendData);
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
        { id: 'compliance', label: 'Tiempos' },
    ];

    const StatCard = ({ label, value, subtext, color = "indigo", trend }) => (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 group">
            <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-slate-500 transition-colors">{label}</span>
                {trend !== undefined && trend !== null && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        <span>{trend >= 0 ? '▲' : '▼'}</span>
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className={`text-4xl font-black text-${color}-500 mt-2 tracking-tight`}>{value || 0}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-medium">{subtext}</p>
        </div>
    );

    return (
        <LeaderLayout title="Inteligencia de Datos">
            <Head title="Análisis de Operación" />

            <div className="p-6 max-w-[1800px] mx-auto space-y-6">
                {/* Header & Global Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Panel de Inteligencia</h1>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">En Vivo</span>
                            </div>
                        </div>
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
                        <div className="relative">
                            <InputLabel value="Mensajero" />
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsMessengerDropdownOpen(!isMessengerDropdownOpen)}
                                    className="w-56 flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                                >
                                    <span className="truncate">
                                        {selectedMessenger ? messengers.find(m => m.id == selectedMessenger)?.name : "Todos los mensajeros"}
                                    </span>
                                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isMessengerDropdownOpen && (
                                    <div className="absolute z-50 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden ring-1 ring-black ring-opacity-5">
                                        <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                                            <input
                                                type="text"
                                                autoFocus
                                                autoComplete="off"
                                                value={messengerSearch}
                                                onChange={(e) => setMessengerSearch(e.target.value)}
                                                placeholder="Buscar mensajero..."
                                                className="w-full px-3 py-2 text-xs border-0 focus:ring-0 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                            <button
                                                onClick={() => {
                                                    setSelectedMessenger('');
                                                    setIsMessengerDropdownOpen(false);
                                                    setMessengerSearch('');
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors ${!selectedMessenger ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                            >
                                                Todos los mensajeros
                                            </button>
                                            {messengers
                                                .filter(m => m.name.toLowerCase().includes(messengerSearch.toLowerCase()))
                                                .map((m) => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => {
                                                            setSelectedMessenger(m.id);
                                                            setIsMessengerDropdownOpen(false);
                                                            setMessengerSearch('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors mt-0.5 ${selectedMessenger == m.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                                                    >
                                                        {m.name}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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

                {
                    loading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500"></div>
                            <p className="text-slate-500 animate-pulse font-medium">Analizando datos...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Tab Content: Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Top Stats - Combined Efficiency */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <StatCard label="Eficiencia Global" value={`${performanceSummary.health?.global}%`} subtext="Índice de 3 pilares" color="indigo" />
                                        <StatCard label="Cumplimiento Preop" value={`${performanceSummary.health?.preop}%`} subtext="Promedio de flota" color="blue" />
                                        <StatCard label="Estado Limpieza" value={`${performanceSummary.health?.cleaning}%`} subtext="Mantenimiento físico" color="emerald" />
                                        <StatCard label="Asistencia" value={`${performanceSummary.health?.attendance}%`} subtext="Salidas y almuerzos" color="purple" />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Pulse of the Operation (Trend Chart) */}
                                        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex flex-col">
                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Pulso de la Operación</h4>
                                                    <p className="text-slate-500 text-[10px]">Frecuencia combinada de todos los reportes operativos</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Preop</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Aseo</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Tiempos</span></div>
                                                </div>
                                            </div>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={filteredTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorPreop" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorCleaning" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorTiempos" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.05} />
                                                        <XAxis
                                                            dataKey="date"
                                                            tick={{ fontSize: 10, fontWeight: 600 }}
                                                            stroke="#94a3b8"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            minTickGap={30}
                                                            tickFormatter={(str) => {
                                                                const d = new Date(str);
                                                                return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                                                            }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 10, fontWeight: 600 }}
                                                            stroke="#94a3b8"
                                                            axisLine={false}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: 'white', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                            itemStyle={{ fontSize: '11px', fontWeight: 'bold', padding: '2px 0' }}
                                                            labelStyle={{ marginBottom: '8px', color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                                        />
                                                        <Area type="monotone" dataKey="preop" name="Preoperacionales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPreop)" strokeWidth={4} />
                                                        <Area type="monotone" dataKey="cleaning" name="Control Aseo" stroke="#10b981" fillOpacity={1} fill="url(#colorCleaning)" strokeWidth={4} />
                                                        <Area type="monotone" dataKey="tiempos" name="Gestión Tiempos" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTiempos)" strokeWidth={4} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Sidebar widgets for Highlights */}
                                        <div className="space-y-6">
                                            {/* Top Performers */}
                                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none text-white overflow-hidden relative group">
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-6 italic">Muro de Excelencia (Top 5)</h4>
                                                <div className="space-y-4">
                                                    {performanceSummary.top?.map((p, i) => (
                                                        <div key={i} className="flex items-center justify-between group/item">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shadow-sm">
                                                                    {p.name.charAt(0)}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold truncate max-w-[120px]">{p.name}</span>
                                                                    <span className="text-[10px] opacity-60 font-medium">Cumplimiento Master</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-xl shadow-sm group-hover/item:scale-110 transition-transform">{p.overall}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Attention Needed */}
                                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-6 italic">Alertas con Prioridad</h4>
                                                {performanceSummary.attention?.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {performanceSummary.attention.slice(0, 3).map((p, i) => (
                                                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{p.name}</span>
                                                                    <span className="text-[10px] font-bold text-rose-500 uppercase mt-0.5">Requiere Seguimiento</span>
                                                                </div>
                                                                <span className="text-xs font-black text-rose-600 bg-rose-100 dark:bg-rose-900/40 px-3 py-1 rounded-xl">{p.overall}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight italic">Operación sin Riesgos</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                            }

                            {/* Tab Content: Cleaning */}
                            {activeTab === 'cleaning' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Frecuencia de Reportes</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Preop</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Aseo</span></div>
                                                </div>
                                            </div>
                                            <div className="h-[350px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={sectionTrends}>
                                                        <defs>
                                                            <linearGradient id="colorPreop" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                            <linearGradient id="colorCleaning" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                        <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }}
                                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                        />
                                                        <Area type="monotone" dataKey="preop" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPreop)" name="Preoperacionales" />
                                                        <Area type="monotone" dataKey="cleaning" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCleaning)" name="Limpiezas" />
                                                    </AreaChart>
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

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Cumplimiento Preoperacional (%)</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Excelente</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Atención</span></div>
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                                                <div style={{ height: `${Math.max(300, complianceData.length * 40)}px`, width: '100%' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={complianceData} layout="vertical" margin={{ left: 120, right: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="#94a3b8" />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }}
                                                                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                                formatter={(value) => [`${value}%`, ""]}
                                                                separator=""
                                                            />
                                                            <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={20}>
                                                                {complianceData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.rate < 80 ? '#f43f5e' : '#10b981'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex flex-col">
                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Cumplimiento de Limpieza (%)</h4>
                                                    <p className="text-slate-500 text-[10px]">Meta: 1 semanal y 1 mensual por equipo (Moto/Maleta)</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Excelente</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Atención</span></div>
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                                                <div style={{ height: `${Math.max(300, cleaningComplianceData.length * 40)}px`, width: '100%' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={cleaningComplianceData} layout="vertical" margin={{ left: 120, right: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="#94a3b8" />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }}
                                                                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                                formatter={(value) => [`${value}%`, ""]}
                                                                separator=""
                                                            />
                                                            <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={20}>
                                                                {cleaningComplianceData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.rate < 80 ? '#f43f5e' : '#10b981'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Tab Content: Tiempos */}
                            {activeTab === 'compliance' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Attendance Compliance (%) */}
                                        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex flex-col">
                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">Cumplimiento de Reportes (Tiempos)</h4>
                                                    <p className="text-slate-500 text-[10px]">Almuerzo + Fin de Ruta para mensajeros programados</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Excelente</span></div>
                                                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold text-slate-500 uppercase italic">Atención</span></div>
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto max-h-[350px] pr-4 custom-scrollbar">
                                                <div style={{ height: `${Math.max(300, attendanceCompliance.length * 40)}px`, width: '100%' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={attendanceCompliance} layout="vertical" margin={{ left: 120, right: 20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                                                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} stroke="#94a3b8" />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }}
                                                                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                                                formatter={(value) => [`${value}%`, ""]}
                                                                separator=""
                                                            />
                                                            <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={20}>
                                                                {attendanceCompliance.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.rate < 80 ? '#f43f5e' : '#10b981'} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Exit Distribution Pie Chart */}
                                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-6 uppercase tracking-tight text-center">Estado de Puntualidad</h4>
                                            <div className="h-[250px] w-full flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={[
                                                                { name: 'A Tiempo', value: exitAnalysis.history.filter(h => h.status === 'on-time').length },
                                                                { name: 'Tarde', value: exitAnalysis.history.filter(h => h.status === 'late').length },
                                                                { name: 'Temprano', value: exitAnalysis.history.filter(h => h.status === 'early').length },
                                                            ]}
                                                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                                                        >
                                                            <Cell fill="#10b981" /> {/* On Time */}
                                                            <Cell fill="#f43f5e" /> {/* Late */}
                                                            <Cell fill="#f59e0b" /> {/* Early */}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: 'white' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="flex justify-center gap-4 mt-4">
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] text-slate-500 font-bold">OK</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] text-slate-500 font-bold">LAT</span></div>
                                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] text-slate-500 font-bold">EAR</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Width Exit Table */}
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex flex-col">
                                                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Análisis Detallado de Salidas</h4>
                                                <p className="text-slate-500 text-xs">Comparativa histórica de fin de ruta vs programación oficial</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                                    <span className="text-indigo-600 dark:text-indigo-400 text-sm font-black italic">Desviación Promedio: {exitAnalysis.avg_diff} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                                        <th className="pb-4 px-4 font-black">Mensajero</th>
                                                        <th className="pb-4 px-4 font-black">Fecha</th>
                                                        <th className="pb-4 px-4 font-black">Programado</th>
                                                        <th className="pb-4 px-4 font-black">Reportado</th>
                                                        <th className="pb-4 px-4 font-black text-right">Diferencia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                    {exitAnalysis.history.map((h, i) => (
                                                        <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                                            <td className="py-5 px-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                                        {h.messenger.charAt(0)}
                                                                    </div>
                                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{h.messenger}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-5 px-4 text-slate-500 text-sm font-medium">{h.date}</td>
                                                            <td className="py-5 px-4">
                                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                                    {h.scheduled_end}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 px-4">
                                                                <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-black text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                    {h.actual_end}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 px-4 text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`px-3 py-1 rounded-xl text-xs font-black shadow-sm ${h.diff_minutes > 15 ? 'bg-rose-500 text-white' :
                                                                        (h.diff_minutes < -15 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white')
                                                                        }`}>
                                                                        {h.diff_minutes > 0 ? `+${h.diff_minutes}` : h.diff_minutes} min
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">
                                                                        {h.status === 'late' ? 'Retraso' : (h.status === 'early' ? 'Anticipado' : 'A Tiempo')}
                                                                    </span>
                                                                </div>
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
                    )
                }
            </div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6366f1;
                    border-radius: 10px;
                }
            `}} />
        </LeaderLayout >
    );
}
