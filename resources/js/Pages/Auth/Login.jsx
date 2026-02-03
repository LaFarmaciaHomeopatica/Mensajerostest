import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login.attempt'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-50 dark:bg-slate-900">
            <Head title="Log in" />

            <div className="w-full sm:max-w-md mt-6 px-10 py-12 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Bienvenido</h1>
                    <p className="text-slate-500 mt-2 font-medium">Ingresa tus credenciales para continuar</p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="block w-full border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 transition-all duration-200"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            placeholder="nombre@empresa.com"
                        />
                        {errors.email && <div className="text-red-600 mt-1 text-xs font-bold">{errors.email}</div>}
                    </div>

                    <div className="mt-4">
                        <label className="block font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="block w-full border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 transition-all duration-200"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="text-red-600 mt-1 text-xs font-bold">{errors.password}</div>}
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500 h-4 w-4"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">Recordarme</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4 pt-4">
                        <button
                            className="w-full inline-flex justify-center items-center px-4 py-3 bg-indigo-600 border border-transparent rounded-xl font-bold text-sm text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition ease-in-out duration-150 shadow-lg shadow-indigo-500/40"
                            disabled={processing}
                        >
                            INGRESAR
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
