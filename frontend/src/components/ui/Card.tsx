import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'glass' | 'glass-strong' | 'glass-blue';
  className?: string;
}

export function Card({ children, variant = 'glass', className = '' }: CardProps) {
  const variants = {
    glass: 'bg-glass-white-15 backdrop-blur-md border border-white/20',
    'glass-strong': 'bg-glass-white-25 backdrop-blur-lg border border-white/30',
    'glass-blue': 'bg-glass-blue-15 backdrop-blur-md border border-blue-300/20',
  };

  return (
    <div className={`${variants[variant]} rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
