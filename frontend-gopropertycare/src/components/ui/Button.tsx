import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer';

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]',
    secondary: 'bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-900 border border-emerald-200/80 active:scale-[0.98]',
    outline: 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50/50 hover:border-emerald-400 active:bg-emerald-100/50 shadow-2xs active:scale-[0.98]',
    ghost: 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/70 active:bg-emerald-100/70',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm hover:shadow-md hover:shadow-rose-500/20 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'h-10 min-h-[40px] px-3.5 text-xs sm:text-sm gap-1.5',
    md: 'h-11 min-h-[44px] px-5 text-sm gap-2',
    lg: 'h-12 min-h-[48px] px-6 sm:px-8 text-base gap-2.5',
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
