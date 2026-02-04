import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function QuestionsIndex({ questions }) {
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        category: '',
        label: '',
        key: '',
        type: 'boolean',
        order: 10,
        active: true,
    });

    const openModal = (question = null) => {
        if (question) {
            setEditingQuestion(question);
            setData({
                category: question.category,
                label: question.label,
                key: question.key,
                type: question.type || 'boolean',
                order: question.order,
                active: question.active,
            });
        } else {
            setEditingQuestion(null);
            reset();
        }
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingQuestion) {
            put(route('preoperational-questions.update', editingQuestion.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            post(route('preoperational-questions.store'), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta pregunta? Esto podría afectar la visualización de reportes antiguos.')) {
            router.delete(route('preoperational-questions.destroy', id));
        }
    };

    return (
        <LeaderLayout>
            <Head title="Configuración de Preguntas" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                    ⚙️ Configuración del Preoperacional
                                </h2>
                                <button
                                    onClick={() => openModal()}
                                    className="w-full lg:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>➕</span> Nueva Pregunta
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Orden</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pregunta / Label</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Key (ID)</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {questions.map((q) => (
                                            <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{q.order}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                                                        {q.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{q.label}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${q.type === 'text' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {q.type === 'text' ? 'Texto' : 'Sí/No'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{q.key}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${q.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {q.active ? 'Activa' : 'Inactiva'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    <button onClick={() => openModal(q)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold">Editar</button>
                                                    <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-bold">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                        {editingQuestion ? '✏️ Editar Pregunta' : '➕ Nueva Pregunta'}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 italic">Categoría</label>
                            <select
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Selecciona una...</option>
                                <option value="Vehículo">Vehículo</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Documentos">Documentos</option>
                            </select>
                            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 italic">Key (Identificador único)</label>
                            <input
                                type="text"
                                value={data.key}
                                onChange={e => setData('key', e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white font-mono"
                                placeholder="ej: luces_direccionales"
                                required
                                disabled={editingQuestion}
                            />
                            {errors.key && <p className="text-red-500 text-xs mt-1">{errors.key}</p>}
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 italic">Tipo de Campo</label>
                            <select
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                required
                            >
                                <option value="boolean">Sí / No (Botones)</option>
                                <option value="text">Texto Libre (Escribir)</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 italic">Texto de la Pregunta</label>
                            <input
                                type="text"
                                value={data.label}
                                onChange={e => setData('label', e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                placeholder="¿Las luces funcionan correctamente?"
                                required
                            />
                            {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 italic">Orden</label>
                            <input
                                type="number"
                                value={data.order}
                                onChange={e => setData('order', e.target.value)}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="col-span-1 flex items-end pb-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.active}
                                    onChange={e => setData('active', e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm font-bold text-gray-700 dark:text-gray-300">Pregunta Activa</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowModal(false)} className="uppercase tracking-widest text-xs">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 uppercase tracking-widest text-xs">
                            {editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </LeaderLayout>
    );
}
