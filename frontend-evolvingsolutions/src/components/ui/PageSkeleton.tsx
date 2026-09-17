import { Skeleton } from './Skeleton';

export function PageSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in py-6">
      {/* Header skeleton */}
      <div className="space-y-4 text-center max-w-xl mx-auto">
        <Skeleton className="h-7 w-36 mx-auto rounded-full" />
        <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-full mx-auto" />
      </div>

      {/* Hero card / main box skeleton */}
      <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="bg-white/80 border border-stone-200/80 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
