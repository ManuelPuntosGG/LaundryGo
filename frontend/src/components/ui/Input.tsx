import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full min-h-[44px] bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm shadow-2xs ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
            <span>•</span>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
