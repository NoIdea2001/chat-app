"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => {
        const isOwn = i % 3 === 0;
        return (
          <div
            key={i}
            className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
          >
            {!isOwn && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
            <div
              className={`flex flex-col gap-1 ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              {!isOwn && <Skeleton className="h-3 w-16" />}
              <Skeleton
                className={`h-10 rounded-2xl ${
                  i % 2 === 0 ? "w-48" : "w-64"
                }`}
              />
              <Skeleton className="h-2 w-12" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChatAreaSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {/* Messages skeleton */}
      <MessageListSkeleton />
      {/* Input skeleton */}
      <div className="border-t p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
