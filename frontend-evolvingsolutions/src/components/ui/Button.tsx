import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white' | 'none';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#815133] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#815133] hover:bg-[#6a422a] active:bg-[#573725] text-white shadow-sm hover:shadow-md hover:shadow-stone-900/20 active:scale-[0.98]',
    secondary: 'bg-[#f7efe6] hover:bg-[#eedecd] active:bg-[#e0c3a7] text-[#2f1b11] border border-[#e0c3a7] active:scale-[0.98]',
    outline: 'bg-white border border-stone-300 text-stone-700 hover:bg-[#fdfaf6] hover:border-[#815133] active:bg-[#f7efe6] shadow-2xs active:scale-[0.98]',
    ghost: 'text-stone-600 hover:text-[#2f1b11] hover:bg-[#f7efe6]/70 active:bg-[#eedecd]/70',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm hover:shadow-md hover:shadow-rose-500/20 active:scale-[0.98]',
    white: 'bg-white hover:bg-[#fdfaf6] active:bg-[#f7efe6] text-[#2f1b11] font-black border border-white shadow-md active:scale-[0.98]',
    none: '',
  };

  const sizes = {
    sm: 'h-10 min-h-[40px] px-3.5 text-xs sm:text-sm gap-1.5',
    md: 'h-11 min-h-[44px] px-5 text-sm gap-2',
    lg: 'h-12 min-h-[48px] px-6 sm:px-8 text-base gap-2.5',
  };

  let variantStyle = variants[variant];
  if (className.includes('bg-')) {
    variantStyle = variantStyle.replace(/\bbg-\S+/g, '').replace(/\bhover:bg-\S+/g, '').replace(/\bactive:bg-\S+/g, '');
  }
  if (className.includes('text-')) {
    variantStyle = variantStyle.replace(/\btext-\S+/g, '').replace(/\bhover:text-\S+/g, '').replace(/\bactive:text-\S+/g, '');
  }
  if (className.includes('border-') || className.includes('border ')) {
    variantStyle = variantStyle.replace(/\bborder-\S+/g, '').replace(/\bborder\b/g, '');
  }

  return (
    <button
      className={`${baseStyles} ${variantStyle.trim()} ${sizes[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
