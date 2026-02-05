import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function CleaningForm({ messenger, onCancel, onSuccess }) {
    const [step, setStep] = useState('type'); // type, questions, success
    const { data, setData, post, processing, errors, reset } = useForm({
        messenger_id: messenger.id,
        type: '',
        answers: {},
        evidence: null,
        observations: '',
    });

    const types = [
        { id: 'maletas_semanal', label: 'Limpieza Maletas (Semanal)', icon: '🎒' },
        { id: 'maletas_mensual', label: 'Limpieza Maletas (Mensual)', icon: '🎒✨' },
        { id: 'motos_semanal', label: 'Limpieza Moto (Semanal)', icon: '🛵' },
        { id: 'motos_mensual', label: 'Limpieza Moto (Mensual)', icon: '🛵✨' },
    ];

    const questions = [
        { key: 'aseo_general', label: '¿Se realizó el aseo general profundo?' },
        { key: 'desinfeccion', label: '¿Se realizó desinfección de superficies?' },
        { key: 'orden', label: '¿Los elementos quedaron ordenados?' },
    ];

    const handleTypeSelect = (typeId) => {
        setData('type', typeId);
        setStep('questions');
    };

    const handleAnswer = (key, value) => {
        setData('answers', {
            ...data.answers,
            [key]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!data.evidence) {
            alert('Por favor adjunta una foto como evidencia.');
            return;
        }

        const allAnswered = questions.every(q => data.answers[q.key] !== undefined);
        if (!allAnswered) {
            alert('Por favor responde todas las preguntas.');
            return;
        }

        post(route('cleaning.store'), {
            onSuccess: () => {
                setStep('success');
                onSuccess();
            },
        });
    };

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">¡Reporte Enviado!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Tu reporte de limpieza ha sido registrado correctamente.
                </p>
                <button
                    onClick={onCancel}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                >
                    Volver al Menú
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {step === 'type' ? '🧹 Selecciona el Reporte' : '📝 Diligencia el Reporte'}
                </h2>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            {step === 'type' && (
                <div className="grid grid-cols-1 gap-4">
                    {types.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-100 dark:border-gray-700 rounded-2xl transition-all group text-left"
                        >
                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                                {type.icon}
                            </span>
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {type.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {step === 'questions' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-sm mb-4">
                        <p className="text-indigo-700 dark:text-indigo-300 font-bold">
                            Tipo: {types.find(t => t.id === data.type)?.label}
                        </p>
                    </div>

                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {questions.map((q) => (
                            <div key={q.key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">{q.label}</p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleAnswer(q.key, true)}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${data.answers[q.key] === true ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-600'}`}
                                    >
                                        ✓ Sí
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAnswer(q.key, false)}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${data.answers[q.key] === false ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-600'}`}
                                    >
                                        ✗ No
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">📸 Evidencia (Foto)</p>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => setData('evidence', e.target.files[0])}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {errors.evidence && <p className="text-red-500 text-[10px] mt-1">{errors.evidence}</p>}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">💬 Observaciones (Opcional)</p>
                            <textarea
                                value={data.observations}
                                onChange={(e) => setData('observations', e.target.value)}
                                className="w-full rounded-xl border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm focus:ring-indigo-500"
                                rows="2"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setStep('type')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-xl transition-all"
                        >
                            Atrás
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {processing ? 'Enviando...' : 'Enviar Reporte'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
