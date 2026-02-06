import React, { forwardRef, useRef } from 'react';

export default forwardRef(function TextArea({ className = '', ...props }, ref) {
    const input = ref ? ref : useRef();

    return (
        <textarea
            {...props}
            className={
                'w-full border-slate-200 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 text-sm rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 p-4 shadow-sm ' +
                className
            }
            ref={input}
        />
    );
});
