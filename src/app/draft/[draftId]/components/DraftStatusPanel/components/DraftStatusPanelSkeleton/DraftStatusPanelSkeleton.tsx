"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function DraftStatusPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1 mb-3 pb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="border-2 rounded-lg p-2 h-[20vh] flex flex-col border-gray-300">
          <Skeleton className="h-4 w-20 mb-1" />
          <div className="flex-1 space-y-2 mt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="border-2 rounded-lg p-2 h-[20vh] flex flex-col border-gray-300">
          <Skeleton className="h-4 w-20 mb-1" />
          <div className="flex-1 space-y-2 mt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

