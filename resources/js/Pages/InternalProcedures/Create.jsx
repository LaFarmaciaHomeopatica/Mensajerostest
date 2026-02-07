import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import LeaderLayout from '@/Layouts/LeaderLayout';
import MessengerSearchSelect from '@/Components/MessengerSearchSelect';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import InputLabel from '@/Components/InputLabel';

export default function Create({ messengers }) {
    // Get today's date with default times (local timezone)
    const getDefaultMinTime = () => {
        const today = new Date();
        today.setHours(7, 0, 0, 0);
        // Format as YYYY-MM-DDTHH:mm in local time
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const getDefaultMaxTime = () => {
        const today = new Date();
        today.setHours(22, 0, 0, 0);
        // Format as YYYY-MM-DDTHH:mm in local time
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        messenger_id: '',
        item_name: '',
        item_quantity: 1,
        item_code: '',
        contact_identifier: '',
        destination_address: '',
        destination_city: 'BOGOTA',
        contact_name: '',
        contact_phone: '',
        contact_email: '',

        min_delivery_at: getDefaultMinTime(),
        max_delivery_at: getDefaultMaxTime(),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('internal-procedures.store'));
    };

    return (
        <LeaderLayout>
            <Head title="Nuevo Trámite Interno" />

            <div className="py-6 sm:py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-2xl sm:rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="p-8">
                            {/* Header */}
                            <div className="mb-8">
                                <Link
                                    href={route('internal-procedures.index')}
                                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 mb-4"
                                >
                                    ← Volver al listado
                                </Link>
                                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                                    <span className="bg-indigo-600/10 p-2 rounded-xl text-2xl">📝</span>
                                    Nuevo Trámite Interno
                                </h1>
                                <p className="text-slate-400 text-sm mt-2">Completa la información para generar una nueva guía interna compatible con Beetrack.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Messenger Selection */}
                                    <div className="md:col-span-2 space-y-2">
                                        <InputLabel value="Mensajero Responsable (Opcional)" />
                                        <MessengerSearchSelect
                                            messengers={messengers}
                                            selectedId={data.messenger_id}
                                            onChange={(id) => setData('messenger_id', id)}
                                            placeholder="Buscar mensajero por nombre o placa..."
                                        />
                                        {errors.messenger_id && <p className="text-red-500 text-xs italic mt-1">{errors.messenger_id}</p>}
                                    </div>

                                    {/* Item Section */}
                                    <div className="md:col-span-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Información del Item</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel value="Nombre del Item (Acción)" />
                                        <TextInput
                                            value={data.item_name}
                                            onChange={(e) => setData('item_name', e.target.value)}
                                            className="w-full"
                                            placeholder="Ej: RECOGER A, LLEVAR G..."
                                        />
                                        {errors.item_name && <p className="text-red-500 text-xs italic mt-1">{errors.item_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <InputLabel value="Cantidad" />
                                            <TextInput
                                                type="number"
                                                value={data.item_quantity}
                                                onChange={(e) => setData('item_quantity', e.target.value)}
                                                className="w-full"
                                                min="1"
                                            />
                                            {errors.item_quantity && <p className="text-red-500 text-xs italic mt-1">{errors.item_quantity}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <InputLabel value="Código Item" />
                                            <TextInput
                                                value={data.item_code}
                                                onChange={(e) => setData('item_code', e.target.value)}
                                                className="w-full"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>



                                    {/* Address Section */}
                                    <div className="md:col-span-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ubicación y Tiempo</h3>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <InputLabel value="Dirección de Destino" />
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">📍</span>
                                            <TextInput
                                                type="text"
                                                value={data.destination_address}
                                                onChange={(e) => setData('destination_address', e.target.value)}
                                                className="w-full pl-10"
                                                placeholder="Calle, Carrera, Apto, Barrio..."
                                                required
                                            />
                                        </div>
                                        {errors.destination_address && <p className="text-red-500 text-xs italic mt-1">{errors.destination_address}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <InputLabel value="Ciudad" />
                                            <TextInput
                                                value={data.destination_city}
                                                onChange={(e) => setData('destination_city', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>



                                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                        <div className="space-y-2">
                                            <InputLabel value="Fecha/Hora Min Entrega" />
                                            <TextInput
                                                type="datetime-local"
                                                value={data.min_delivery_at}
                                                onChange={(e) => setData('min_delivery_at', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <InputLabel value="Fecha/Hora Max Entrega" />
                                            <TextInput
                                                type="datetime-local"
                                                value={data.max_delivery_at}
                                                onChange={(e) => setData('max_delivery_at', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Section Title */}
                                    <div className="md:col-span-2 pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Información de Contacto</h3>
                                    </div>

                                    {/* Contact ID / Identificador */}
                                    <div className="space-y-2">
                                        <InputLabel value="Identificador de Contacto (Cédula/NIT)" />
                                        <TextInput
                                            type="text"
                                            value={data.contact_identifier}
                                            onChange={(e) => setData('contact_identifier', e.target.value)}
                                            className="w-full"
                                            placeholder="Identificador para Beetrack..."
                                        />
                                    </div>

                                    {/* Contact Name */}
                                    <div className="space-y-2">
                                        <InputLabel value="Nombre de Contacto" />
                                        <TextInput
                                            type="text"
                                            value={data.contact_name}
                                            onChange={(e) => setData('contact_name', e.target.value)}
                                            className="w-full"
                                            placeholder="Ej: Juan Perez"
                                            required
                                        />
                                        {errors.contact_name && <p className="text-red-500 text-xs italic mt-1">{errors.contact_name}</p>}
                                    </div>

                                    {/* Contact Phone */}
                                    <div className="space-y-2">
                                        <InputLabel value="Teléfono (Opcional)" />
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">📞</span>
                                            <TextInput
                                                type="text"
                                                value={data.contact_phone}
                                                onChange={(e) => setData('contact_phone', e.target.value)}
                                                className="w-full pl-10"
                                                placeholder="Ej: 3001234567"
                                            />
                                        </div>
                                        {errors.contact_phone && <p className="text-red-500 text-xs italic mt-1">{errors.contact_phone}</p>}
                                    </div>

                                    {/* Contact Email */}
                                    <div className="space-y-2">
                                        <InputLabel value="Correo Electrónico (Opcional)" />
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">✉️</span>
                                            <TextInput
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                className="w-full pl-10"
                                                placeholder="Ej: contacto@ejemplo.com"
                                            />
                                        </div>
                                        {errors.contact_email && <p className="text-red-500 text-xs italic mt-1">{errors.contact_email}</p>}
                                    </div>
                                </div>

                                {/* Form Footers */}
                                <div className="pt-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                                    <SecondaryButton
                                        type="button"
                                        onClick={() => router.get(route('internal-procedures.index'))}
                                    >
                                        Cancelar
                                    </SecondaryButton>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {processing ? 'CREANDO...' : 'GUARDAR TRÁMITE'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </LeaderLayout>
    );
}
