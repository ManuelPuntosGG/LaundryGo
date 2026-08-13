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
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all duration-200 text-sm ${
            error ? 'border-red-400/50 focus:ring-red-400/50' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-300">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
