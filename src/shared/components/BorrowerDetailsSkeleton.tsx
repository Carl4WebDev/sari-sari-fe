import Skeleton from "./Skeleton";

export default function BorrowerDetailsSkeleton() {
  return (
    <div className="space-y-6 pb-32">
      {/* Back Button */}
      <Skeleton className="h-5 w-20" />

      {/* Top Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        {/* Left Column */}
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        {/* Right Column — Profile */}
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 lg:h-40 lg:w-40 rounded-full" />
          <Skeleton className="mt-4 h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-28" />
          <Skeleton className="mt-1 h-4 w-20" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-11 w-40 rounded-lg" />
        <Skeleton className="h-11 flex-1 rounded-lg" />
        <Skeleton className="h-11 w-24 rounded-lg" />
      </div>

      {/* Transaction Cards */}
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>

      {/* Reminders */}
      <Skeleton className="h-32 rounded-xl" />

      {/* Notes */}
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
