import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'featured' | 'flat';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const variants = {
    default: 'bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm p-6 sm:p-7',
    interactive: 'bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-200/90 transition-all duration-300 ease-out p-6 sm:p-7',
    featured: 'bg-white/95 backdrop-blur-sm border-2 border-blue-600 shadow-md shadow-blue-500/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-6 sm:p-7',
    flat: 'bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 p-6 sm:p-7',
  };

  return (
    <div className={`w-full rounded-2xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
