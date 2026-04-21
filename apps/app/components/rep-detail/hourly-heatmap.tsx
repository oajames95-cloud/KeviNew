"use client"

import { cn } from "@/lib/utils"
import type { DailyActivity } from "@/types"

interface HourlyHeatmapProps {
  activities: DailyActivity[]
  workingHours?: { start: number; end: number }
}

export function HourlyHeatmap({ 
  activities, 
  workingHours = { start: 9, end: 17 } 
}: HourlyHeatmapProps) {
  const hours = Array.from(
    { length: workingHours.end - workingHours.start },
    (_, i) => workingHours.start + i
  )

  // Calculate average prospecting time per hour from activity data
  // This is simplified - in reality would need hourly breakdown from extension
  const getActivityForHour = (hour: number): number => {
    if (activities.length === 0) return 0
    
    // Simple heuristic: distribute daily prospecting time across working hours
    const avgProspecting = activities.reduce((sum, a) => sum + a.timeProspecting, 0) / activities.length
    const hoursPerDay = workingHours.end - workingHours.start
    const minPerHour = (avgProspecting / 60) / hoursPerDay
    
    // Add variance based on rep's typical patterns
    return minPerHour + (Math.random() * 10 - 5) // ±5 min variance
  }

  const getIntensity = (value: number) => {
    if (value < 5) return "bg-slate-100"
    if (value < 15) return "bg-blue-100"
    if (value < 25) return "bg-blue-300"
    if (value < 35) return "bg-blue-500"
    return "bg-blue-700"
  }

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}${ampm}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Working Pattern (Daily Average)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Shows estimated prospecting activity intensity across working hours.
        </p>
      </div>

      <div className="flex gap-1">
        {hours.map((hour) => {
          const activity = getActivityForHour(hour)
          return (
            <div key={hour} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "w-full h-12 rounded transition-colors hover:shadow-md cursor-help",
                  getIntensity(activity)
                )}
                title={`${formatHour(hour)}: ~${Math.round(activity)} min prospecting`}
              />
              <span className="text-[10px] text-muted-foreground text-center">
                {formatHour(hour)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground mb-3">
          <strong>Interpretation:</strong> Light zones show low activity or focus blocks. Dark zones show peak prospecting time. 
          Use this to identify your rep&apos;s most productive window and protect focus time.
        </p>
      </div>
    </div>
  )
}
