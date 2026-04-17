import { cn } from "@/lib/utils"

interface DataTableProps {
  children: React.ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function DataTableHeader({ children, className }: DataTableProps) {
  return (
    <thead>
      <tr className={cn("border-b border-border bg-muted/30", className)}>{children}</tr>
    </thead>
  )
}

interface DataTableColumnProps {
  children?: React.ReactNode
  className?: string
  align?: "left" | "center" | "right"
}

export function DataTableColumn({ children, className, align = "left" }: DataTableColumnProps) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  )
}

interface DataTableRowProps {
  children: React.ReactNode
  className?: string
  highlight?: boolean
}

export function DataTableRow({ children, className, highlight }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-border/50 last:border-0 transition-colors",
        highlight ? "bg-warning/[0.02] hover:bg-warning/[0.04]" : "hover:bg-muted/30",
        className
      )}
    >
      {children}
    </tr>
  )
}

interface DataTableCellProps {
  children?: React.ReactNode
  className?: string
  align?: "left" | "center" | "right"
}

export function DataTableCell({ children, className, align = "left" }: DataTableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  )
}

export function DataTableEmpty({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
