import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';

export default function Landing({ preoperationalQuestions = [] }) {
    const { flash, errors } = usePage().props;
    const [viewState, setViewState] = useState('search'); // search, options, active_lunch
    const [messenger, setMessenger] = useState(null);
    const [plate, setPlate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeLunch, setActiveLunch] = useState(null);
    const [preoperationalAnswers, setPreoperationalAnswers] = useState({});

    // Group questions by category for rendering
    const groupedQuestions = preoperationalQuestions.reduce((acc, q) => {
        if (!acc[q.category]) acc[q.category] = [];
        acc[q.category].push(q);
        return acc;
    }, {});

    const answeredCount = Object.keys(preoperationalAnswers).length;
    const allAnswered = preoperationalQuestions.length > 0 && answeredCount === preoperationalQuestions.length;

    // Lunch Form
    const { data, setData, post, processing, reset: resetForm } = useForm({
        messenger_id: '',
    });

    const handleLunchSubmit = () => {
        post(route('lunch.store'), {
            onSuccess: (page) => {
                // Set active lunch data from success response
                if (page.props.flash.success) {
                    setActiveLunch({
                        end: page.props.flash.success.return_time
                    });
                }
                setViewState('active_lunch');
            },
            onError: (errors) => {
                if (errors.lunch_duplicate) {
                    setViewState('lunch_duplicate_error');
                }
            }
        });
    };

    const handleShiftSubmit = () => {
        post(route('shift-completion.store'), {
            onSuccess: () => setViewState('success_shift'),
            onError: (errors) => {
                if (errors.shift_duplicate) {
                    setViewState('shift_duplicate_error');
                }
            }
        });
    };

    const checkPlate = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post(route('messenger.check-plate'), { plate });
            const mData = response.data;
            setMessenger(mData);
            setData('messenger_id', mData.id);

            // Always go to options menu after plate check
            setViewState('options');
        } catch (err) {
            setError('Placa no encontrada o error en el sistema.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreopClick = () => {
        setViewState('preoperational');
    };

    const handlePreoperationalSubmit = () => {
        // Check if all questions are answered
        const allAnswered = preoperationalQuestions.every(q => {
            const answer = preoperationalAnswers[q.key];
            if (q.type === 'text') {
                return answer && answer.trim().length > 0;
            }
            return answer !== undefined;
        });

        if (!allAnswered) {
            alert('Por favor responde todas las preguntas antes de enviar.');
            return;
        }

        // Submit using router.post directly
        router.post(route('preoperational.store'), {
            messenger_id: messenger.id,
            answers: preoperationalAnswers,
            observations: null,
        }, {
            onSuccess: () => {
                setViewState('preop_success');
                setPreoperationalAnswers({});
            },
            onError: (errors) => {
                if (errors.preop_duplicate) {
                    setViewState('preop_duplicate_error');
                }
            },
            preserveState: true,
        });
    };

    const handlePreoperationalAnswer = (key, value) => {
        setPreoperationalAnswers({
            ...preoperationalAnswers,
            [key]: value
        });
    };

    const resetAll = () => {
        setViewState('search');
        setMessenger(null);
        setPlate('');
        setError(null);
        setActiveLunch(null);
        resetForm();
    };

    if (viewState === 'shift_finished' && messenger) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Turno Finalizado" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-gray-500">
                    <h1 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-400">Turno Finalizado 🏁</h1>
                    <p className="text-xl mb-4">
                        Hola <strong>{messenger.name}</strong>, ya registraste el fin de tu turno por hoy.
                    </p>
                    <p className="text-lg mb-6 text-gray-500">¡Nos vemos mañana!</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all mb-4"
                    >
                        Menú
                    </button>
                    <button
                        onClick={resetAll}
                        className="block w-full text-gray-600 dark:text-gray-400 font-bold hover:underline"
                    >
                        Salir
                    </button>
                </div>
            </div>
        );
    }

    if (flash.success && viewState === 'success_shift') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Buen descanso" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-indigo-500">
                    <h1 className="text-3xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">¡Buen descanso! 🌙</h1>
                    <p className="text-xl mb-4">
                        Has finalizado tu turno correctamente.
                    </p>
                    <p className="text-lg mb-6">Gracias por tu trabajo hoy.</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all mb-4"
                    >
                        Menú
                    </button>
                    <button
                        onClick={() => { resetAll(); window.location.reload(); }}
                        className="block w-full text-gray-600 dark:text-gray-400 font-bold hover:underline"
                    >
                        Salir
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'lunch_duplicate_error' && messenger) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Almuerzo Ya Registrado" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-orange-500">
                    <h1 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">⚠️ Almuerzo Ya Registrado</h1>
                    <p className="text-xl mb-4">
                        Hola <strong>{messenger.name}</strong>, ya has registrado tu almuerzo hoy.
                    </p>
                    <p className="text-lg mb-2">Debes regresar a las:</p>
                    <div className="text-5xl font-mono font-bold mb-6 text-indigo-600 dark:text-indigo-400">
                        {errors.lunch_end_time || '--:--'}
                    </div>
                    <p className="text-sm mb-6 text-gray-500">No puedes registrar más de un almuerzo por día.</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'shift_duplicate_error' && messenger) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Turno Ya Finalizado" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-orange-500">
                    <h1 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">⚠️ Turno Ya Finalizado</h1>
                    <p className="text-xl mb-4">
                        Hola <strong>{messenger.name}</strong>, ya has reportado el fin de tu turno hoy.
                    </p>
                    <p className="text-lg mb-6 text-gray-500">No puedes finalizar el turno más de una vez por día.</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'preop_success' && messenger) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Reporte Enviado" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-green-500">
                    <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">✅ ¡Reporte Enviado!</h1>
                    <p className="text-xl mb-4">
                        Gracias <strong>{messenger.name}</strong>, tu reporte preoperacional ha sido registrado.
                    </p>
                    <p className="text-lg mb-6 text-gray-500">¡Buen viaje y conduce con seguridad!</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all mb-4"
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'preop_duplicate_error' && messenger) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Reporte Ya Enviado" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-orange-500">
                    <h1 className="text-2xl font-bold mb-4 text-orange-600 dark:text-orange-400">⚠️ Reporte Ya Enviado</h1>
                    <p className="text-xl mb-4">
                        Hola <strong>{messenger.name}</strong>, ya has enviado tu reporte preoperacional hoy.
                    </p>
                    <p className="text-lg mb-6 text-gray-500">Solo puedes enviar un reporte por día.</p>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
                    >
                        Volver al Menú
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'preoperational' && messenger) {
        // Group questions by category
        const groupedQuestions = preoperationalQuestions.reduce((acc, question) => {
            if (!acc[question.category]) {
                acc[question.category] = [];
            }
            acc[question.category].push(question);
            return acc;
        }, {});

        const allAnswered = preoperationalQuestions.every(q => preoperationalAnswers[q.id] !== undefined);
        const answeredCount = Object.keys(preoperationalAnswers).length;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4">
                <Head title="Reporte Preoperacional" />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-2xl w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            📋 Reporte Preoperacional
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hola <strong>{messenger.name}</strong>, verifica el estado de tu vehículo antes de iniciar.
                        </p>
                        <div className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                            Progreso: {answeredCount} / {preoperationalQuestions.length}
                        </div>
                    </div>

                    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                        {Object.entries(groupedQuestions).map(([category, questions]) => (
                            <div key={category}>
                                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 border-b pb-2">
                                    {category}
                                </h3>
                                <div className="space-y-3">
                                    {questions.map((question) => (
                                        <div key={question.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <p className="text-sm font-medium mb-3">{question.label}</p>
                                            <div className="flex gap-3">
                                                {question.type === 'text' ? (
                                                    <textarea
                                                        value={preoperationalAnswers[question.key] || ''}
                                                        onChange={(e) => handlePreoperationalAnswer(question.key, e.target.value)}
                                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                        rows="3"
                                                        placeholder="Escribe tu respuesta aquí..."
                                                    />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handlePreoperationalAnswer(question.key, true)}
                                                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${preoperationalAnswers[question.key] === true
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                                                                }`}
                                                        >
                                                            ✓ Sí
                                                        </button>
                                                        <button
                                                            onClick={() => handlePreoperationalAnswer(question.key, false)}
                                                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${preoperationalAnswers[question.key] === false
                                                                ? 'bg-red-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900'
                                                                }`}
                                                        >
                                                            ✗ No
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => {
                                setViewState('options');
                                setPreoperationalAnswers({});
                            }}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handlePreoperationalSubmit}
                            disabled={!allAnswered}
                            className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all ${allAnswered
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Enviar Reporte
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (viewState === 'active_lunch' && messenger && activeLunch) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="En Almuerzo" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-green-500">
                    <h1 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">¡A disfrutar tu almuerzo! 🍔</h1>
                    <p className="text-xl mb-4">
                        ¡Hola <strong>{messenger.name}</strong>! Recarga baterías 🔋
                    </p>
                    <p className="text-lg mb-6">Debes regresar a las:</p>
                    <div className="text-5xl font-mono font-bold mb-8 text-indigo-600 dark:text-indigo-400">
                        {activeLunch.end}
                    </div>
                    <button
                        onClick={() => setViewState('options')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all mb-4"
                    >
                        Menú
                    </button>
                    <button
                        onClick={resetAll}
                        className="block w-full text-gray-600 dark:text-gray-400 font-bold hover:underline"
                    >
                        Salir
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

                {/* Button inside options view */}
                {viewState === 'options' && (
                    <div className="space-y-4">
                        {messenger?.shift_finished && (
                            <div className="bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-500 text-gray-700 dark:text-gray-300 p-4 rounded-md mb-4">
                                <p className="font-bold">🏁 Turno Finalizado</p>
                                <p className="text-sm">Ya has registrado el fin de tu turno por hoy.</p>
                            </div>
                        )}

                        <button
                            onClick={() => setViewState('shifts_view')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between text-lg group"
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">📅</span>
                                <span>Ver Mis Horarios</span>
                            </span>
                            <span className="text-indigo-200 group-hover:text-white">→</span>
                        </button>

                        <button
                            onClick={handlePreopClick}
                            className={`w-full font-bold py-5 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-between text-lg group ${messenger?.shift_finished
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'
                                }`}
                            disabled={messenger?.shift_finished}
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">📋</span>
                                <span>Reporte Preoperacional</span>
                            </span>
                            {!messenger?.shift_finished && <span className="text-blue-200 group-hover:text-white">→</span>}
                        </button>

                        <button
                            onClick={() => setViewState('lunch_confirm')}
                            className={`w-full font-bold py-5 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-between text-lg group ${messenger?.shift_finished
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                                }`}
                            disabled={messenger?.shift_finished}
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">🍽️</span>
                                <span>Registrar Almuerzo</span>
                            </span>
                            {!messenger?.shift_finished && <span className="text-green-200 group-hover:text-white">→</span>}
                        </button>

                        <button
                            onClick={() => setViewState('shift_confirm')}
                            className={`w-full font-bold py-5 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-between text-lg group ${messenger?.shift_finished
                                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                : 'bg-gray-800 hover:bg-gray-900 text-white hover:shadow-xl'
                                }`}
                            disabled={messenger?.shift_finished}
                        >
                            <span className="flex items-center gap-3">
                                <span className="text-2xl">🏁</span>
                                <span>Reportar Fin Turno</span>
                            </span>
                            {!messenger?.shift_finished && <span className="text-gray-400 group-hover:text-white">→</span>}
                        </button>

                        <button
                            onClick={resetAll}
                            className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-3 mt-4 text-sm font-medium border border-transparent hover:border-gray-200 rounded-lg transition-all"
                        >
                            Cancelar / Buscar otra placa
                        </button>
                    </div>
                )}

                {/* Shifts View */}
                {viewState === 'shifts_view' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
                            Mis Próximos Turnos
                        </h3>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {messenger?.shifts && messenger.shifts.length > 0 ? (
                                messenger.shifts.map((shift, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-l-4 shadow-sm ${shift.status === 'absent'
                                            ? 'bg-red-50 border-red-500'
                                            : shift.status === 'no_shift'
                                                ? 'bg-gray-50 border-gray-300 opacity-75'
                                                : shift.is_today
                                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-200'
                                                    : 'bg-white dark:bg-gray-700 border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-100 capitalize">
                                                    {shift.date}
                                                </p>
                                                {shift.status === 'absent' ? (
                                                    <span className="text-red-600 font-bold text-sm">NO ASISTE</span>
                                                ) : shift.status === 'no_shift' ? (
                                                    <span className="text-gray-500 text-sm italic">Sin Turno</span>
                                                ) : (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {shift.start_time} - {shift.end_time}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                {shift.status !== 'no_shift' && (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${shift.location === 'Principal'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                        }`}>
                                                        {shift.location}
                                                    </span>
                                                )}
                                                {shift.is_today && (
                                                    <div className="mt-1 text-xs font-bold text-indigo-600">HOY</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">No tienes turnos asignados para los próximos días.</p>
                            )}
                        </div>

                        <button
                            onClick={() => setViewState('options')}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
                        >
                            Volver
                        </button>
                    </div>
                )}

                {/* Shift Confirmation View */}
                {viewState === 'shift_confirm' && (
                    <div className="space-y-6 text-center">
                        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4 text-left text-sm">
                            <p className="font-bold">Advertencia:</p>
                            <p>Al reportar el fin de turno, ya no podrás recibir más despachos ni registrar almuerzos por hoy.</p>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            ¿Confirmas que terminaste turno?
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setViewState('options')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleShiftSubmit}
                                disabled={processing}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {processing ? 'Finalizando...' : 'Sí, Finalizar'}
                            </button>
                        </div>
                    </div>
                )}

                {viewState === 'lunch_confirm' && (
                    <div className="space-y-6 text-center">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            ¿Confirmas el inicio de tu almuerzo?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Mensajero: <span className="font-bold">{messenger?.name}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setViewState('options')}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLunchSubmit}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                {processing ? 'Registrando...' : 'Sí, confirmar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8 text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Logística
            </div>
        </div>
    );
}
