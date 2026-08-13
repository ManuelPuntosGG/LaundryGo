import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow active:scale-[0.99]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80',
    outline: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-xs sm:text-sm gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-6 sm:px-8 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
