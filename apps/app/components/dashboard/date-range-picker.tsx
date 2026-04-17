"use client"

import * as React from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 14 days", value: "14d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This month", value: "month" },
  { label: "This quarter", value: "quarter" },
]

interface DateRangePickerProps {
  value?: string
  onChange?: (value: string) => void
}

export function DateRangePicker({ value = "7d", onChange }: DateRangePickerProps) {
  const selected = DATE_RANGES.find((r) => r.value === value) ?? DATE_RANGES[1]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs font-normal bg-card"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {selected.label}
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {DATE_RANGES.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onClick={() => onChange?.(range.value)}
            className={range.value === value ? "bg-accent" : ""}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
