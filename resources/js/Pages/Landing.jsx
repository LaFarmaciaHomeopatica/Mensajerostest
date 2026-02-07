import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import CleaningForm from './Cleaning/Form';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';
import WarningButton from '@/Components/WarningButton';
import DangerButton from '@/Components/DangerButton';

export default function Landing({ preoperationalQuestions = [] }) {
    const { flash, errors } = usePage().props;
    const [viewState, setViewState] = useState('search'); // search, options, active_lunch
    const [messenger, setMessenger] = useState(null);
    const [plate, setPlate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeLunch, setActiveLunch] = useState(null);
    const [preoperationalAnswers, setPreoperationalAnswers] = useState({});
    const [preoperationalObservations, setPreoperationalObservations] = useState('');

    // Grouped questions will be calculated during render if needed or once here
    const groupedQuestions = React.useMemo(() => {
        return preoperationalQuestions.reduce((acc, q) => {
            if (!acc[q.category]) acc[q.category] = [];
            acc[q.category].push(q);
            return acc;
        }, {});
    }, [preoperationalQuestions]);



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

            // Handle Active Lunch
            if (mData.active_lunch) {
                setActiveLunch({
                    start: mData.active_lunch.start,
                    end: mData.active_lunch.end
                });
                setViewState('active_lunch');
                return;
            }

            // Handle Shift Finished (Optional: redirect to finished view or options)
            if (mData.shift_finished) {
                // We can either go to options (which shows finished banner) or redirect to finished view
                // Let's stick to options as it gives more context but maybe highlight it?
                // Actually, if they are done, maybe show the finished screen directly?
                setViewState('shift_finished');
                return;
            }

            // Default to options menu
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
            observations: preoperationalObservations,
        }, {
            onSuccess: () => {
                setViewState('preop_success');
                setPreoperationalAnswers({});
                setPreoperationalObservations('');
                setMessenger(prev => ({ ...prev, preoperational_submitted: true }));
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full mb-4"
                    >
                        Menú
                    </PrimaryButton>
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full mb-4"
                    >
                        Menú
                    </PrimaryButton>
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full"
                    >
                        Volver al Menú
                    </PrimaryButton>
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full"
                    >
                        Volver al Menú
                    </PrimaryButton>
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full mb-4"
                    >
                        Volver al Menú
                    </PrimaryButton>
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
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full"
                    >
                        Volver al Menú
                    </PrimaryButton>
                </div>
            </div>
        );
    }

    if (viewState === 'preoperational' && messenger) {
        // Use the memoized groupedQuestions from the top level

        const allAnswered = preoperationalQuestions.every(q => {
            const answer = preoperationalAnswers[q.key];
            if (q.type === 'text') {
                return answer && typeof answer === 'string' && answer.trim().length > 0;
            }
            return answer !== undefined;
        });
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

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(groupedQuestions).map(([category, questions]) => (
                            <div key={category}>
                                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 border-b pb-2">
                                    {category}
                                </h3>
                                <div className="space-y-3">
                                    {questions.map((question) => (
                                        <div key={question.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all">
                                            <p className="text-sm font-bold mb-4 text-slate-700 dark:text-slate-200">
                                                {question.label || question.key || 'Pregunta sin enunciado'}
                                            </p>
                                            <div className="flex gap-4">
                                                {question.type === 'text' ? (
                                                    <TextArea
                                                        value={preoperationalAnswers[question.key] || ''}
                                                        onChange={(e) => handlePreoperationalAnswer(question.key, e.target.value)}
                                                        rows="3"
                                                        placeholder="Escribe tu respuesta aquí..."
                                                        className="w-full"
                                                    />
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreoperationalAnswer(question.key, true)}
                                                            className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${preoperationalAnswers[question.key] === true
                                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none ring-4 ring-emerald-500/20'
                                                                : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                                                                }`}
                                                        >
                                                            {preoperationalAnswers[question.key] === true && <span>✓</span>}
                                                            SÍ
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreoperationalAnswer(question.key, false)}
                                                            className={`flex-1 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${preoperationalAnswers[question.key] === false
                                                                ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none ring-4 ring-red-500/20'
                                                                : 'bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                                                                }`}
                                                        >
                                                            {preoperationalAnswers[question.key] === false && <span>✗</span>}
                                                            NO
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

                    {/* Observaciones Field */}
                    <div className="mt-6 bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-800">
                        <label className="block text-sm font-bold mb-2 text-amber-900 dark:text-amber-100">
                            📝 Observaciones (Opcional)
                        </label>
                        <TextArea
                            value={preoperationalObservations}
                            onChange={(e) => setPreoperationalObservations(e.target.value)}
                            rows="3"
                            placeholder="Agrega cualquier observación adicional sobre el estado del vehículo..."
                            className="w-full"
                        />
                    </div>

                    <div className="mt-6 flex gap-3">
                        <SecondaryButton
                            onClick={() => {
                                setViewState('options');
                                setPreoperationalAnswers({});
                                setPreoperationalObservations('');
                            }}
                            className="flex-1 justify-center"
                        >
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={handlePreoperationalSubmit}
                            disabled={!allAnswered}
                            className={`flex-1 justify-center rounded-full ${!allAnswered && 'opacity-50'}`}
                        >
                            Enviar Reporte
                        </PrimaryButton>
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
                {viewState === 'cleaning' ? (
                    <CleaningForm
                        messenger={messenger}
                        onCancel={() => setViewState('options')}
                        onSuccess={() => {/* Keep in success state of form */ }}
                    />
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Logística LFH</h2>
                            {viewState === 'search' && <p className="text-gray-500">Ingresa la placa de tu vehículo</p>}
                            {viewState === 'options' && <p className="text-gray-500">Hola, <span className="font-bold text-indigo-500">{messenger?.name}</span></p>}
                        </div>

                        {viewState === 'search' && (
                            <form onSubmit={checkPlate} className="space-y-6">
                                <div>
                                    <TextInput
                                        type="text"
                                        placeholder="Ej: AAA-123"
                                        value={plate}
                                        onChange={(e) => setPlate(e.target.value.toUpperCase())}
                                        className="w-full text-center text-3xl font-mono tracking-widest py-4 uppercase"
                                        required
                                        autoFocus
                                    />
                                    {error && <p className="text-red-500 text-center mt-2 font-bold text-xs">{error}</p>}
                                </div>

                                <PrimaryButton
                                    type="submit"
                                    disabled={loading}
                                    className="w-full justify-center py-4 text-sm"
                                >
                                    {loading ? 'Buscando...' : 'BUSCAR VEHÍCULO'}
                                </PrimaryButton>
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

                                {messenger?.preoperational_submitted && !messenger?.shift_finished && (
                                    <div className="bg-green-50 dark:bg-green-900/40 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-md mb-4 shadow-sm">
                                        <p className="font-bold flex items-center gap-2">
                                            <span>✅</span> Reporte Preoperacional Completado
                                        </p>
                                        <p className="text-sm">Ya has registrado el estado de tu vehículo por hoy.</p>
                                    </div>
                                )}

                                <PrimaryButton
                                    onClick={() => setViewState('shifts_view')}
                                    className="w-full py-5 flex items-center justify-between text-lg group"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">📅</span>
                                        <span>VER MIS HORARIOS</span>
                                    </span>
                                    <span className="text-indigo-200 group-hover:text-white">→</span>
                                </PrimaryButton>

                                <SuccessButton
                                    onClick={handlePreopClick}
                                    className="w-full py-5 flex items-center justify-between text-lg group"
                                    disabled={messenger?.shift_finished || messenger?.preoperational_submitted}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">📋</span>
                                        <span>REPORTE PREOPERACIONAL</span>
                                    </span>
                                    {(!messenger?.shift_finished && !messenger?.preoperational_submitted) && <span className="text-emerald-200 group-hover:text-white">→</span>}
                                </SuccessButton>

                                <SuccessButton
                                    onClick={() => setViewState('cleaning')}
                                    className="w-full py-5 flex items-center justify-between text-lg group"
                                    disabled={messenger?.shift_finished}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">🧹</span>
                                        <span>REPORTE DE LIMPIEZA</span>
                                    </span>
                                    {!messenger?.shift_finished && <span className="text-emerald-200 group-hover:text-white">→</span>}
                                </SuccessButton>

                                <SuccessButton
                                    onClick={() => setViewState('lunch_confirm')}
                                    className="w-full py-5 flex items-center justify-between text-lg group"
                                    disabled={messenger?.shift_finished}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">🍽️</span>
                                        <span>REGISTRAR ALMUERZO</span>
                                    </span>
                                    {!messenger?.shift_finished && <span className="text-emerald-200 group-hover:text-white">→</span>}
                                </SuccessButton>

                                <WarningButton
                                    onClick={() => setViewState('shift_confirm')}
                                    className="w-full py-5 flex items-center justify-between text-lg group"
                                    disabled={messenger?.shift_finished}
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">🏁</span>
                                        <span>REPORTAR FIN TURNO</span>
                                    </span>
                                    {!messenger?.shift_finished && <span className="text-amber-200 group-hover:text-white">→</span>}
                                </WarningButton>

                                <SecondaryButton
                                    onClick={resetAll}
                                    className="w-full justify-center mt-4"
                                >
                                    CANCELAR / BUSCAR OTRA PLACA
                                </SecondaryButton>
                            </div>
                        )}
                    </>
                )}

                {/* Shifts View */}
                {viewState === 'shifts_view' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
                            Mis Próximos Turnos
                        </h3>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
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

                        <SecondaryButton
                            onClick={() => setViewState('options')}
                            className="w-full justify-center"
                        >
                            Volver
                        </SecondaryButton>
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
                            <SecondaryButton
                                onClick={() => setViewState('options')}
                                className="justify-center"
                            >
                                Cancelar
                            </SecondaryButton>
                            <WarningButton
                                onClick={handleShiftSubmit}
                                disabled={processing}
                                className="justify-center"
                            >
                                {processing ? 'Finalizando...' : 'Sí, Finalizar'}
                            </WarningButton>
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
                            <SecondaryButton
                                onClick={() => setViewState('options')}
                                className="justify-center"
                            >
                                Cancelar
                            </SecondaryButton>
                            <SuccessButton
                                onClick={handleLunchSubmit}
                                disabled={processing}
                                className="justify-center"
                            >
                                {processing ? 'Registrando...' : 'Sí, confirmar'}
                            </SuccessButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
