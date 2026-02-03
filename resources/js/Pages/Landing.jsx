import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Landing({ messengers }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        messenger_id: '',
    });

    const { flash } = usePage().props;
    const [showSuccess, setShowSuccess] = useState(!!flash.success);

    const submit = (e) => {
        e.preventDefault();
        post(route('lunch.store'), {
            onSuccess: () => setShowSuccess(true),
        });
    };

    if (flash.success && showSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Disfruta tu almuerzo" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-green-500">
                    <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">¡Disfruta tu almuerzo!</h1>
                    <p className="text-xl mb-6">
                        {flash.success.messenger_name}, tu hora de regreso es:
                    </p>
                    <div className="text-5xl font-mono font-bold mb-8 text-indigo-600 dark:text-indigo-400">
                        {flash.success.return_time}
                    </div>
                    <button
                        onClick={() => { setShowSuccess(false); reset(); window.location.reload(); }}
                        className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title="Registro de Almuerzo" />

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all hover:scale-105 duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Seguimiento de Mensajeros</h2>
                    <p className="text-gray-500 dark:text-gray-400">Registra tu salida a almorzar</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Selecciona tu nombre
                        </label>
                        <select
                            value={data.messenger_id}
                            onChange={(e) => setData('messenger_id', e.target.value)}
                            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm text-lg py-3"
                            required
                        >
                            <option value="">-- Seleccionar --</option>
                            {messengers.map((messenger) => (
                                <option key={messenger.id} value={messenger.id}>
                                    {messenger.name}
                                </option>
                            ))}
                        </select>
                        {errors.messenger_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.messenger_id}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    >
                        {processing ? 'Registrando...' : '🍽️ Salir a Almorzar'}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Logística
            </div>
        </div>
    );
}
