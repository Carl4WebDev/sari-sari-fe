import Skeleton from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-3 w-10 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <div className="flex justify-end gap-1">
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
