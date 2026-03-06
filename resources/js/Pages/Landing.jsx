import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SuccessButton from '@/Components/SuccessButton';
import WarningButton from '@/Components/WarningButton';
import DangerButton from '@/Components/DangerButton';

export default function Landing() {
    const { flash, errors } = usePage().props;
    const [viewState, setViewState] = useState('search'); // search, options, active_lunch
    const [messenger, setMessenger] = useState(null);
    const [plate, setPlate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeLunch, setActiveLunch] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState('esta'); // esta, proxima

    // Preoperational State
    const [preopQuestions, setPreopQuestions] = useState([]);
    const [preopAnswers, setPreopAnswers] = useState({});
    const [preopObservations, setPreopObservations] = useState('');
    const [loadingQuestions, setLoadingQuestions] = useState(false);



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

    const loadPreopQuestions = async () => {
        setLoadingQuestions(true);
        setViewState('preop_form');
        try {
            const res = await axios.get(route('preoperational.questions'));
            setPreopQuestions(res.data.questions || []);

            // Initialize answers state
            const initialAnswers = {};
            (res.data.questions || []).forEach(q => {
                initialAnswers[q.key] = ''; // empty string forces user to select
            });
            setPreopAnswers(initialAnswers);
            setPreopObservations('');
        } catch (err) {
            console.error('Error loading questions', err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handlePreopSubmit = async (e) => {
        e.preventDefault();

        // Validate all questions answered
        const unanswered = preopQuestions.filter(q => preopAnswers[q.key] === '');
        if (unanswered.length > 0) {
            alert('Por favor responde todas las preguntas del checklist.');
            return;
        }

        try {
            await axios.post(route('preoperational.store'), {
                messenger_id: messenger.id,
                answers: preopAnswers,
                observations: preopObservations
            });
            setViewState('success_preop');
        } catch (error) {
            alert(error.response?.data?.error || 'Ocurrió un error guardando el reporte.');
            console.error(error);
        }
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

    if (viewState === 'success_preop') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Head title="Inspección Completada" />
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center border-l-4 border-green-500">
                    <h1 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">¡Inspección Enviada! ✅</h1>
                    <p className="text-xl mb-4">
                        Gracias por completar tu inspección preoperacional de hoy.
                    </p>
                    <p className="text-lg mb-6">Maneja con precaución.</p>
                    <PrimaryButton
                        onClick={() => setViewState('options')}
                        className="rounded-full mb-4"
                    >
                        Volver al Menú
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

                            <PrimaryButton
                                onClick={loadPreopQuestions}
                                disabled={messenger?.preop_finished}
                                className={`w-full py-5 flex items-center justify-between text-lg group ${messenger?.preop_finished ? 'bg-gray-400 border-gray-400 cursor-not-allowed hover:bg-gray-400 text-gray-700' : 'bg-cyan-700 hover:bg-cyan-800 border-cyan-800'}`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-2xl">📋</span>
                                    <span>{messenger?.preop_finished ? 'PREOPERACIONAL LISTO ✅' : 'PREOPERACIONAL'}</span>
                                </span>
                                {!messenger?.preop_finished && <span className="text-cyan-200 group-hover:text-white">→</span>}
                            </PrimaryButton>

                            <PrimaryButton
                                onClick={() => setViewState('forms_view')}
                                className="w-full py-5 flex items-center justify-between text-lg group bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 border-slate-700"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="text-2xl">📝</span>
                                    <span>FORMULARIOS</span>
                                </span>
                                <span className="text-slate-400 group-hover:text-white">→</span>
                            </PrimaryButton>

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

                {/* Forms View */}
                {viewState === 'forms_view' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center flex items-center justify-center gap-2">
                            <span>📝</span> Formularios Externos
                        </h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            {messenger?.external_forms && messenger.external_forms.length > 0 ? (
                                messenger.external_forms.map((form, index) => (
                                    <a
                                        key={index}
                                        href={form.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-5 bg-white dark:bg-gray-700 rounded-2xl border-2 border-slate-100 dark:border-slate-600 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                                    {form.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                    Toca para abrir el formulario
                                                </p>
                                            </div>
                                            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                    No hay formularios disponibles en este momento.
                                </div>
                            )}
                        </div>

                        <SecondaryButton
                            onClick={() => setViewState('options')}
                            className="w-full justify-center py-4"
                        >
                            Volver al Menú
                        </SecondaryButton>
                    </div>
                )}

                {/* Shifts View */}
                {viewState === 'shifts_view' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
                            Mis Próximos Turnos
                        </h3>

                        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            <button
                                onClick={() => setSelectedWeek('esta')}
                                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${selectedWeek === 'esta'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                ESTA SEMANA
                            </button>
                            <button
                                onClick={() => setSelectedWeek('proxima')}
                                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${selectedWeek === 'proxima'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                PRÓX. SEMANA
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {messenger?.shifts && messenger.shifts.length > 0 ? (
                                messenger.shifts
                                    .filter(s => selectedWeek === 'esta' ? !s.is_next_week : s.is_next_week)
                                    .map((shift, index) => (
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
                {viewState === 'preop_form' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center flex items-center justify-center gap-2 mb-2">
                            <span>📋</span> Inspección Preoperacional
                        </h3>

                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800 font-medium mb-4 text-center">
                            Vehículo: <span className="font-bold">{messenger?.vehicle}</span>
                        </div>

                        {loadingQuestions ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <form onSubmit={handlePreopSubmit} className="space-y-6">
                                <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6">
                                    {/* Group Questions by Category */}
                                    {Object.entries(preopQuestions.reduce((acc, q) => {
                                        if (!acc[q.category]) acc[q.category] = [];
                                        acc[q.category].push(q);
                                        return acc;
                                    }, {})).map(([category, questions]) => (
                                        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-2 border-b-2 border-slate-100 dark:border-slate-600">
                                                <h4 className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide text-sm">{category}</h4>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {questions.map((q) => (
                                                    <div key={q.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{q.label}</span>
                                                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 shrink-0 w-full sm:w-auto">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreopAnswers({ ...preopAnswers, [q.key]: true })}
                                                                className={`flex-1 sm:px-4 py-2 rounded-md font-bold text-sm transition-colors ${preopAnswers[q.key] === true ? 'bg-green-500 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                                            >
                                                                SÍ
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreopAnswers({ ...preopAnswers, [q.key]: false })}
                                                                className={`flex-1 sm:px-4 py-2 rounded-md font-bold text-sm transition-colors ${preopAnswers[q.key] === false ? 'bg-red-500 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                                                            >
                                                                NO
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 p-4">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📝 Observaciones Adicionales (Opcional)</label>
                                        <TextArea
                                            value={preopObservations}
                                            onChange={(e) => setPreopObservations(e.target.value)}
                                            placeholder="Detalla cualquier anomalía aquí..."
                                            className="w-full text-sm"
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <SecondaryButton onClick={() => setViewState('options')} className="justify-center">Cancelar</SecondaryButton>
                                    <PrimaryButton type="submit" className="justify-center">Enviar Reporte</PrimaryButton>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
