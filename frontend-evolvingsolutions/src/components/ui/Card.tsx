import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'featured' | 'flat' | 'dark' | 'none';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const hasCustomBg = className.includes('bg-');
  const hasCustomBorder = className.includes('border-') || className.includes('border ');
  const hasCustomPadding = /\bp[xytblr]?-\d+/.test(className);

  const defaultBg = hasCustomBg ? '' : 'bg-white/95 backdrop-blur-sm';
  const defaultBorder = hasCustomBorder ? '' : 'border border-stone-200/80';
  const defaultPadding = hasCustomPadding ? '' : 'p-6 sm:p-7';

  const variants = {
    default: `${defaultBg} ${defaultBorder} shadow-sm ${defaultPadding}`,
    interactive: `${defaultBg} ${defaultBorder} shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-[#b58057] transition-all duration-300 ease-out ${defaultPadding}`,
    featured: `${defaultBg} backdrop-blur-sm border-2 border-[#815133] shadow-md shadow-[#815133]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out ${defaultPadding}`,
    flat: hasCustomBg ? defaultPadding : `bg-[#fdfaf6] backdrop-blur-sm ${defaultBorder} ${defaultPadding}`,
    dark: `bg-[#2f1b11] border border-[#573725] text-white shadow-xl ${defaultPadding}`,
    none: '',
  };

  return (
    <div className={`w-full rounded-2xl ${variants[variant].trim()} ${className}`.trim()}>
      {children}
    </div>
  );
}
