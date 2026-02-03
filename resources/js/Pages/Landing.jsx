import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';

export default function Landing() {
    const { flash } = usePage().props;
    const [viewState, setViewState] = useState('search'); // search, options, active_lunch
    const [messenger, setMessenger] = useState(null);
    const [plate, setPlate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeLunch, setActiveLunch] = useState(null);

    // Lunch Form
    const { data, setData, post, processing, reset: resetForm } = useForm({
        messenger_id: '',
    });

    const checkPlate = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post(route('messenger.check-plate'), { plate });
            const mData = response.data;
            setMessenger(mData);
            setData('messenger_id', mData.id);

            if (mData.active_lunch) {
                setActiveLunch(mData.active_lunch);
                setViewState('active_lunch');
            } else {
                setViewState('options');
            }
        } catch (err) {
            setError('Placa no encontrada o error en el sistema.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLunchSubmit = () => {
        post(route('lunch.store'), {
            onSuccess: () => setViewState('success'),
        });
    };

    const handlePreopClick = () => {
        alert("Reporte Preoperacional - Próximamente");
    };

    const resetAll = () => {
        setViewState('search');
        setMessenger(null);
        setPlate('');
        setError(null);
        setActiveLunch(null);
        resetForm();
    };

    if (flash.success && viewState === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Disfruta tu almuerzo" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-green-500">
                    <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">¡A disfrutar! 🍔</h1>
                    <p className="text-xl mb-4">
                        ¡Hola <strong>{flash.success.messenger_name}</strong>! recarga baterías 🔋
                    </p>
                    <p className="text-lg mb-6">Nos vemos de nuevo a las:</p>
                    <div className="text-5xl font-mono font-bold mb-8 text-indigo-600 dark:text-indigo-400">
                        {flash.success.return_time}
                    </div>
                    <button
                        onClick={() => { resetAll(); window.location.reload(); }}
                        className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'active_lunch' && messenger && activeLunch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="En Almuerzo" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-yellow-500">
                    <h1 className="text-2xl font-bold mb-4 text-yellow-600 dark:text-yellow-400">¡Ya estás en tu descanso! ☀️</h1>
                    <p className="text-xl mb-4">
                        Hola <strong>{messenger.name}</strong>, esperamos que estés disfrutando tu almuerzo.
                    </p>
                    <p className="text-lg mb-6">Recuerda regresar a las:</p>
                    <div className="text-5xl font-mono font-bold mb-8 text-indigo-600 dark:text-indigo-400">
                        {activeLunch.end}
                    </div>
                    <button
                        onClick={resetAll}
                        className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-4">
            <Head title="Registro de Mensajeros" />

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Logística LFH</h2>
                    {viewState === 'search' && <p className="text-gray-500">Ingresa la placa de tu vehículo</p>}
                    {viewState === 'options' && <p className="text-gray-500">Hola, <span className="font-bold text-indigo-500">{messenger?.name}</span></p>}
                </div>

                {viewState === 'search' && (
                    <form onSubmit={checkPlate} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Ej: AAA-123"
                                value={plate}
                                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm py-4 uppercase"
                                required
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {loading ? 'Buscando...' : 'Buscar Vehículo'}
                        </button>
                    </form>
                )}

                {viewState === 'options' && (
                    <div className="space-y-4">
                        <button
                            onClick={handleLunchSubmit}
                            disabled={processing}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg"
                        >
                            {processing ? 'Registrando...' : '🍽️ Registrar Almuerzo'}
                        </button>

                        <button
                            onClick={handlePreopClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-lg"
                        >
                            📋 Reporte Preoperacional
                        </button>

                        <button
                            onClick={resetAll}
                            className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 mt-4"
                        >
                            Cancelar / Buscar otra placa
                        </button>
                    </div>
                )}
            </div>
            <div className="mt-8 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Logística
            </div>
        </div>
    );
}
