"use client"

import { cn } from "@/lib/utils"

interface FilterOption<T extends string> {
  label: string
  value: T
  count?: number
  countClassName?: string
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  label?: string
  size?: "sm" | "md"
  className?: string
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded font-medium transition-colors",
              size === "sm" && "px-2 py-1 text-[11px]",
              size === "md" && "px-2.5 py-1.5 text-xs",
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
            {opt.count !== undefined && opt.count > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-[10px] px-1 rounded",
                  value === opt.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : opt.countClassName || "bg-muted-foreground/20"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
