"use client"

import Link from "next/link"
import { ArrowRight, AlertCircle, AlertTriangle, Info, CheckCircle2, Menu } from "lucide-react"
import type { CoachingInsight, RepTrend } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobileSidebar } from "@/components/shell/app-shell"

interface TodayItem extends Omit<CoachingInsight, "repName"> {
  repName: string
  rep?: {
    id: string
    full_name: string
    email: string
    role: string
    trend: RepTrend
  } | null
}

interface TodayClientProps {
  items: TodayItem[]
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    label: "Critical",
    labelBg: "bg-red-100 text-red-700",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    label: "High",
    labelBg: "bg-amber-100 text-amber-700",
  },
  medium: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    label: "Medium",
    labelBg: "bg-blue-100 text-blue-700",
  },
  low: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    label: "Low",
    labelBg: "bg-emerald-100 text-emerald-700",
  },
}

export function TodayClient({ items }: TodayClientProps) {
  const { toggle } = useMobileSidebar()
  
  // Sort by severity
  const sortedItems = [...items].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 px-6 h-14">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Today</h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 max-w-3xl">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedItems.length === 0 
              ? "No coaching conversations scheduled for today. Great job staying on top of things!"
              : `You have ${sortedItems.length} coaching conversation${sortedItems.length === 1 ? "" : "s"} to prepare for today.`
            }
          </p>
        </div>

        {/* Coaching items list */}
        <div className="flex flex-col gap-3">
          {sortedItems.map((item) => {
            const config = severityConfig[item.severity]
            const Icon = config.icon
            const repName = item.rep?.full_name || item.repName

            return (
              <Link
                key={item.id}
                href={`/reps/${item.repId}`}
                className={cn(
                  "group flex items-start gap-4 p-4 rounded-xl border transition-all",
                  "bg-card hover:shadow-md hover:border-primary/20",
                  config.border
                )}
              >
                {/* Severity icon */}
                <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{repName}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", config.labelBg)}>
                      {config.label}
                    </span>
                    {item.status === "new" && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item.reason}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                    Start coaching
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty state */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No urgent coaching items need your attention right now.
            </p>
            <Button asChild variant="outline">
              <Link href="/reps">View all reps</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
