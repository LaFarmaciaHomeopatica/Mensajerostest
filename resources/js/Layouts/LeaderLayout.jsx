import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import DataPurgeModal from '@/Components/DataPurgeModal';

export default function LeaderLayout({ children, title, onPurgeClick }) {
    const { auth } = usePage().props;

    const menuItems = [
        { label: 'Dashboard', route: 'dashboard', active: route().current('dashboard'), roles: ['administrador', 'desarrollador'] },
        { label: 'Horarios', route: 'shifts.index', active: route().current('shifts.*'), roles: ['administrador', 'desarrollador'] },
        { label: 'Almuerzo', route: 'reports.lunch', active: route().current('reports.lunch'), roles: ['administrador', 'desarrollador'] },
        { label: 'Salida', route: 'reports.exit', active: route().current('reports.exit'), roles: ['administrador', 'desarrollador'] },
        { label: 'Mensajeros', route: 'messengers.index', active: route().current('messengers.*'), roles: ['administrador', 'desarrollador'] },
        { label: 'Usuarios', route: 'users.index', active: route().current('users.*'), roles: ['desarrollador'] },
    ].filter(item => item.roles.includes(auth.user.role));

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [showPurgeModal, setShowPurgeModal] = React.useState(false);

    const [theme, setTheme] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    React.useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-sm selection:bg-indigo-100 dark:selection:bg-indigo-900">
            {/* Top Navigation Bar */}
            <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-[2000]">
                <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Brand & Desktop Links */}
                    <div className="flex items-center gap-8">
                        <Link href={route('dashboard')} className="font-black text-xl tracking-tight text-indigo-400">
                            LOGISTICA <span className="text-white">LFH</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1">
                            {menuItems.map((nav) => (
                                <Link
                                    key={nav.route}
                                    href={route(nav.route)}
                                    className={`
                                        px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200
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

                    {/* User Profile & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Usuario</span>
                            <span className="text-xs font-bold text-white">{auth.user.name}</span>
                        </div>

                        {auth.user.role === 'desarrollador' && (
                            <button
                                onClick={() => setShowPurgeModal(true)}
                                className="hidden md:flex items-center gap-1.5 bg-slate-800 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
                                title="Depurar base de datos"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Depurar BD
                            </button>
                        )}

                        <button
                            onClick={logout}
                            className="hidden md:block bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
                        >
                            Salir
                        </button>

                        {/* Theme Toggle */}
                        <div className="flex items-center bg-slate-800 rounded-full p-1 border border-slate-700">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Modo Día"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                title="Modo Oscuro"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            </button>
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div className={`
                    lg:hidden transition-all duration-300 ease-in-out border-t border-slate-800 overflow-hidden
                    ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
                `}>
                    <div className="p-4 space-y-2 bg-slate-900">
                        {menuItems.map((nav) => (
                            <Link
                                key={nav.route}
                                href={route(nav.route)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    block px-4 py-3 rounded-xl text-sm font-bold transition-all
                                    ${nav.active
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                                `}
                            >
                                {nav.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-slate-800 mt-2">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-slate-400 text-xs">{auth.user.name}</span>
                                <button
                                    onClick={logout}
                                    className="text-red-400 text-xs font-bold hover:text-red-300"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            <DataPurgeModal show={showPurgeModal} onClose={() => setShowPurgeModal(false)} />
        </div>
    );
}
