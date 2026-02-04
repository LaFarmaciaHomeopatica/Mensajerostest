import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function LeaderLayout({ children, title }) {
    const { auth } = usePage().props;

    const menuItems = [
        { label: 'Dashboard', route: 'dashboard', active: route().current('dashboard') },
        { label: 'Mensajeros', route: 'messengers.index', active: route().current('messengers.*') },
        { label: 'Horarios', route: 'shifts.index', active: route().current('shifts.*') },
        { label: 'Reporte Almuerzos', route: 'reports.lunch', active: route().current('reports.lunch') },
        { label: 'Reporte Preoperacional', route: 'reports.preoperational', active: route().current('reports.preoperational') },
    ];

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-sm selection:bg-indigo-100 dark:selection:bg-indigo-900">
            {/* Top Navigation Bar */}
            <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Brand & Links */}
                    <div className="flex items-center gap-8">
                        <Link href={route('dashboard')} className="font-black text-lg tracking-tight text-indigo-400">
                            LOGISTICA <span className="text-white">LFH</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {menuItems.map((nav) => (
                                <Link
                                    key={nav.route}
                                    href={route(nav.route)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                                        ${nav.active
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                                    `}
                                >
                                    {nav.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 hidden sm:inline">
                            Hola, <span className="font-bold text-white">{auth.user.name}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    );
}
