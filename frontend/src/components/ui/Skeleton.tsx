import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'rect';
}

export function Skeleton({ variant = 'rect', className = '', ...props }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-200/80 rounded-xl shrink-0';

  const variants = {
    text: 'h-4 w-full rounded-md',
    card: 'h-32 w-full rounded-2xl border border-slate-200/60 bg-slate-100/60',
    avatar: 'h-10 w-10 rounded-xl',
    button: 'h-11 w-28 rounded-xl',
    rect: 'w-full h-full rounded-xl',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
