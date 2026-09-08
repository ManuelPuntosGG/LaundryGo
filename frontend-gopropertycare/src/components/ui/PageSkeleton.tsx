import { Skeleton } from './Skeleton';

export function PageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-10 py-6 sm:py-10 animate-fade-in">
      {/* Hero Header Skeleton */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto w-full">
        <Skeleton className="h-7 w-64 rounded-full" />
        <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-6 w-full max-w-md rounded-lg" />
        <div className="flex gap-4 pt-2">
          <Skeleton variant="button" className="w-36" />
          <Skeleton variant="button" className="w-28" />
        </div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white/95 border border-slate-200/80 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <Skeleton variant="avatar" className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-5/6 rounded-md" />
            <Skeleton variant="button" className="w-full h-11 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
