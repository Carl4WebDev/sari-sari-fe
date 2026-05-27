import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>

      {/* Chart Placeholder */}
      <Skeleton className="h-72 rounded-xl" />

      {/* Top Borrowers */}
      <Skeleton className="h-48 rounded-xl" />

      {/* Insights */}
      <Skeleton className="h-40 rounded-xl" />

      {/* Recent Activities */}
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
