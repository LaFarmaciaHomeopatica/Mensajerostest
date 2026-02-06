export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={`block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 ml-1 ` + className}>
            {value ? value : children}
        </label>
    );
}
