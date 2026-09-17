interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-stone-200/80 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}
