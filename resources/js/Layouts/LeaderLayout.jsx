import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function LeaderLayout({ children, title }) {
    const { auth } = usePage().props;

    const menuItems = [
        { label: 'Dashboard', route: 'dashboard', active: route().current('dashboard'), roles: ['lider'] },
        { label: 'Mensajeros', route: 'messengers.index', active: route().current('messengers.*'), roles: ['lider'] },
        { label: 'Horarios', route: 'shifts.index', active: route().current('shifts.*'), roles: ['lider'] },
        { label: 'Almuerzos', route: 'reports.lunch', active: route().current('reports.lunch'), roles: ['lider'] },
        { label: 'Preoperacionales', route: 'reports.preoperational', active: route().current('reports.preoperational'), roles: ['lider', 'regente'] },
        { label: 'Usuarios', route: 'users.index', active: route().current('users.*'), roles: ['lider'] },
    ].filter(item => item.roles.includes(auth.user.role));

    const logout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-sm selection:bg-indigo-100 dark:selection:bg-indigo-900">
            {/* Top Navigation Bar */}
            <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
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

                        <button
                            onClick={logout}
                            className="hidden md:block bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors duration-200"
                        >
                            Salir
                        </button>

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
        </div>
    );
}
