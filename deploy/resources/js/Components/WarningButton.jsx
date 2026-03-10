import React from 'react';

export default function WarningButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-6 py-3 bg-amber-600 dark:bg-amber-500 border border-transparent rounded-xl font-black text-[10px] text-white uppercase tracking-widest hover:bg-amber-700 dark:hover:bg-amber-400 focus:bg-amber-700 active:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all duration-200 shadow-lg shadow-amber-500/30 dark:shadow-amber-500/10 active:scale-95 disabled:opacity-25 ${disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
