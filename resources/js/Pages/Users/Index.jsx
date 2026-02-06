import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function UserIndex({ users }) {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'regente',
    });

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setForm({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setForm({
                name: '',
                email: '',
                password: '',
                role: 'regente',
            });
        }
        setErrors({});
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            router.put(route('users.update', editingUser.id), form, {
                onSuccess: () => setShowModal(false),
                onError: (err) => setErrors(err),
            });
        } else {
            router.post(route('users.store'), form, {
                onSuccess: () => setShowModal(false),
                onError: (err) => setErrors(err),
            });
        }
    };

    const deleteUser = (user) => {
        if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    return (
        <LeaderLayout title="Gestión de Usuarios">
            <Head title="Gestión de Usuarios" />

            <div className="max-w-[1800px] mx-auto p-3 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Gestión de Usuarios</h1>
                    <button
                        onClick={() => openModal()}
                        className="w-full lg:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>➕</span> Nuevo Usuario
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-[10px] leading-5 font-black uppercase tracking-widest rounded-full border ${user.role === 'lider' ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800' :
                                                user.role === 'regente' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800' :
                                                    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openModal(user)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 font-bold uppercase text-[10px] tracking-widest transition-colors"
                                                    title="Editar Usuario"
                                                >
                                                    EDITAR
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 font-bold uppercase text-[10px] tracking-widest transition-colors"
                                                    title="Eliminar Usuario"
                                                >
                                                    ELIMINAR
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-tight">
                        {editingUser ? 'Actualizar Usuario' : 'Crear Nuevo Usuario'}
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={editingUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required={!editingUser}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Rol" />
                            <SelectInput
                                id="role"
                                className="mt-1 block w-full"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                required
                            >
                                <option value="lider">Líder</option>
                                <option value="regente">Regente</option>
                                <option value="mensajero">Mensajero</option>
                            </SelectInput>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end mt-6 gap-3">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton disabled={router.processing}>
                                {editingUser ? 'Actualizar' : 'Crear'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </LeaderLayout>
    );
}
