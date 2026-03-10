import React, { useState, useEffect, useRef } from 'react';

export default function MessengerSearchSelect({ messengers, selectedId, onChange, placeholder = "Buscar mensajero..." }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Find the currently selected messenger to display its name in the input when closed
    const selectedMessenger = messengers.find(m => m.id.toString() === selectedId?.toString());

    // Filter messengers based on search term
    const filteredMessengers = messengers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (id) => {
        onChange(id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[46px] rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-300 text-sm px-4 flex justify-between items-center cursor-pointer hover:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            >
                <span className={selectedMessenger ? 'text-slate-900 dark:text-gray-100 font-medium' : 'text-slate-400'}>
                    {selectedMessenger ? `${selectedMessenger.name} (${selectedMessenger.vehicle})` : placeholder}
                </span>
                <span className="text-slate-400">
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-64 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar por nombre o placa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 rounded-lg border-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        <div
                            onClick={() => handleSelect('')}
                            className="p-3 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700/50"
                        >
                            👥 Todos los mensajeros
                        </div>
                        {filteredMessengers.length > 0 ? (
                            filteredMessengers.map((m) => (
                                <div
                                    key={m.id}
                                    onClick={() => handleSelect(m.id.toString())}
                                    className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex flex-col gap-0.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${selectedId?.toString() === m.id.toString() ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                >
                                    <span className="text-sm font-bold text-slate-800 dark:text-gray-200">{m.name}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.vehicle}</span>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-400">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
