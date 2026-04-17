"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts"
import type { DailyActivity } from "@/types"

interface WorkflowTimelineProps {
  activity: DailyActivity[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const tooltipData = payload[0].payload
  const total = tooltipData.timeProspecting + tooltipData.timeResearching + tooltipData.timeInApollo + tooltipData.timeInCRM + tooltipData.timeInEmail
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-foreground text-xs mb-2">{label}</p>
      <div className="space-y-1.5 text-xs mb-2 pb-2 border-b border-border/50">
        <div className="flex justify-between gap-3">
          <span className="text-primary font-semibold">Prospecting</span>
          <span className="font-mono text-foreground">{tooltipData.timeProspecting}m</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-chart-2 font-semibold">Research</span>
          <span className="font-mono text-foreground">{tooltipData.timeResearching}m</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-chart-3 font-semibold">Apollo</span>
          <span className="font-mono text-foreground">{tooltipData.timeInApollo}m</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-chart-4 font-semibold">CRM</span>
          <span className="font-mono text-foreground">{tooltipData.timeInCRM}m</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-chart-5 font-semibold">Email</span>
          <span className="font-mono text-foreground">{tooltipData.timeInEmail}m</span>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Calls</span>
          <span className="font-mono font-semibold text-foreground">{tooltipData.callsDialed}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Meetings</span>
          <span className="font-mono font-semibold text-success">{tooltipData.meetingsBooked}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Switches</span>
          <span className={`font-mono font-semibold ${tooltipData.contextSwitches > 40 ? "text-destructive" : "text-foreground"}`}>{tooltipData.contextSwitches}x</span>
        </div>
      </div>
    </div>
  )
}

export function WorkflowTimeline({ activity }: WorkflowTimelineProps) {
  const data = activity.map((a) => ({
    date: formatDate(a.date),
    timeProspecting: a.timeProspecting,
    timeResearching: a.timeResearching,
    timeInApollo: a.timeInApollo,
    timeInCRM: a.timeInCRM,
    timeInEmail: a.timeInEmail,
    contextSwitches: a.contextSwitches,
    callsDialed: a.callsDialed,
    meetingsBooked: a.meetingsBooked,
    focusBlocksMin: a.focusBlocksMin,
  }))

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Daily Workflow Allocation</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Time spent across key activities — compare to top performer baseline
        </p>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
              opacity={0.4}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Minutes per day", angle: -90, position: "insideLeft", offset: 5, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            {/* Benchmark lines for top performer targets */}
            <ReferenceLine 
              y={180} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5" 
              opacity={0.25}
              label={{ value: "Top Rep Prospecting Target: 180m", position: "right", offset: 5, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--accent))", opacity: 0.08 }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: "12px", fontWeight: 500 }}
              iconType="square"
              verticalAlign="top"
              height={24}
            />
            <Bar dataKey="timeProspecting" name="Prospecting" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="timeResearching" name="Research" stackId="a" fill="hsl(var(--chart-2))" />
            <Bar dataKey="timeInApollo" name="Apollo" stackId="a" fill="hsl(var(--chart-3))" />
            <Bar dataKey="timeInCRM" name="CRM" stackId="a" fill="hsl(var(--chart-4))" />
            <Bar dataKey="timeInEmail" name="Email" stackId="a" fill="hsl(var(--chart-5))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 px-5 py-4 border-t border-border bg-muted/30">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Prospecting</p>
          <p className="text-lg font-bold font-mono text-foreground mt-1">{Math.round(data.reduce((sum, d) => sum + d.timeProspecting, 0) / data.length)}m</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Target: 180m</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Switches</p>
          <p className={`text-lg font-bold font-mono mt-1 ${Math.round(data.reduce((sum, d) => sum + d.contextSwitches, 0) / data.length) > 30 ? "text-destructive" : "text-foreground"}`}>
            {Math.round(data.reduce((sum, d) => sum + d.contextSwitches, 0) / data.length)}x
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Target: &lt;20x</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Meetings</p>
          <p className="text-lg font-bold font-mono text-success mt-1">{Math.round(data.reduce((sum, d) => sum + d.meetingsBooked, 0) / data.length)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">This week</p>
        </div>
      </div>
    </div>
  )
}
