"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export type TimeRange = "today" | "week" | "month" | "custom"

interface TimeFilterProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  showCustom?: boolean
}

export function TimeFilter({ value, onChange, showCustom = true }: TimeFilterProps) {
  const options: { value: TimeRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ]

  if (showCustom) {
    options.push({ value: "custom", label: "Custom Range" })
  }

  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 rounded text-sm font-medium transition-colors",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
