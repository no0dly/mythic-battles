import { Skeleton } from "@/components/ui/skeleton";

export function CardModalSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-full rounded-md" />
      <Skeleton className="mt-2 h-[300px] w-full rounded-md" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/5" />
      </div>
    </>
  );
}
