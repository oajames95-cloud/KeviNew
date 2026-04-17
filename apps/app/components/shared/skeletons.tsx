import { Skeleton } from "@/components/ui/skeleton"

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-2.5 w-32" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function RepCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-14 rounded" />
      <Skeleton className="h-5 w-10 rounded" />
    </div>
  )
}
