"use client"

import Link from "next/link"
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown,
  Phone, 
  Mail, 
  Calendar, 
  Linkedin,
  ArrowUpRight,
  Target,
  Users,
  Clock,
  BarChart3,
  Zap,
} from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { AccountPattern, Rep, TouchChannel } from "@/types"

interface PatternsClientProps {
  patterns: AccountPattern[]
  reps: Rep[]
}

// Channel styling
const channelConfig: Record<TouchChannel, { icon: typeof Phone; color: string; label: string }> = {
  call: { icon: Phone, color: "text-green-600 bg-green-50", label: "Calls" },
  email: { icon: Mail, color: "text-blue-600 bg-blue-50", label: "Email" },
  meeting: { icon: Calendar, color: "text-purple-600 bg-purple-50", label: "Meetings" },
  linkedin: { icon: Linkedin, color: "text-sky-600 bg-sky-50", label: "LinkedIn" },
  sms: { icon: Mail, color: "text-orange-600 bg-orange-50", label: "SMS" },
}

export function PatternsClient({ patterns, reps }: PatternsClientProps) {
  const { toggle } = useMobileSidebar()

  // Sort patterns by win rate
  const sortedPatterns = [...patterns].sort((a, b) => b.winRate - a.winRate)
  
  // Top quartile (top 25%)
  const topQuartileCount = Math.max(1, Math.ceil(patterns.length / 4))
  const topQuartile = sortedPatterns.slice(0, topQuartileCount)
  const bottomQuartile = sortedPatterns.slice(-topQuartileCount)

  // Calculate averages
  const avgMetrics = {
    touchesToMeeting: Math.round(patterns.reduce((s, p) => s + p.avgTouchesToMeeting, 0) / patterns.length * 10) / 10,
    daysToMeeting: Math.round(patterns.reduce((s, p) => s + p.avgDaysToMeeting, 0) / patterns.length),
    touchesPerWeek: Math.round(patterns.reduce((s, p) => s + p.avgTouchesPerWeek, 0) / patterns.length * 10) / 10,
    conversionRate: Math.round(patterns.reduce((s, p) => s + p.conversionRate, 0) / patterns.length),
    winRate: Math.round(patterns.reduce((s, p) => s + p.winRate, 0) / patterns.length),
  }

  // Top performer averages
  const topMetrics = {
    touchesToMeeting: Math.round(topQuartile.reduce((s, p) => s + p.avgTouchesToMeeting, 0) / topQuartile.length * 10) / 10,
    daysToMeeting: Math.round(topQuartile.reduce((s, p) => s + p.avgDaysToMeeting, 0) / topQuartile.length),
    touchesPerWeek: Math.round(topQuartile.reduce((s, p) => s + p.avgTouchesPerWeek, 0) / topQuartile.length * 10) / 10,
    conversionRate: Math.round(topQuartile.reduce((s, p) => s + p.conversionRate, 0) / topQuartile.length),
    winRate: Math.round(topQuartile.reduce((s, p) => s + p.winRate, 0) / topQuartile.length),
  }

  // Find the rep object for each pattern
  const getRepTrend = (repId: string) => reps.find(r => r.id === repId)?.trend || 'stable'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Account Patterns"
        subtitle="How top reps convert accounts to meetings and deals"
        onMenuClick={toggle}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Back link */}
        <Link
          href="/accounts"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Accounts
        </Link>

        {/* Winning Sequence Insight */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-2">Winning Sequence</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Top performers convert accounts to meetings with <span className="font-semibold text-foreground">{topMetrics.touchesToMeeting} touches</span> in <span className="font-semibold text-foreground">{topMetrics.daysToMeeting} days</span>, 
                averaging <span className="font-semibold text-foreground">{topMetrics.touchesPerWeek} touches/week</span>. Their channel mix emphasizes calls and meetings over pure email outreach.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{topMetrics.conversionRate}% conversion</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{topMetrics.winRate}% win rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Quartile */}
          <div className="rounded-xl border border-green-200 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-green-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Top Performers</h3>
                  <p className="text-xs text-muted-foreground">Highest win rates</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {topQuartile.map(pattern => (
                <Link
                  key={pattern.repId}
                  href={`/reps/${pattern.repId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-green-100 text-green-700">
                      {pattern.repName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{pattern.repName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{pattern.avgTouchesToMeeting} touches</span>
                      <span>·</span>
                      <span>{pattern.avgDaysToMeeting}d to meeting</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-600">{pattern.winRate}%</p>
                    <p className="text-[10px] text-muted-foreground">win rate</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Quartile */}
          <div className="rounded-xl border border-amber-200 bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-amber-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Needs Coaching</h3>
                  <p className="text-xs text-muted-foreground">Below team average</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-border">
              {bottomQuartile.map(pattern => (
                <Link
                  key={pattern.repId}
                  href={`/reps/${pattern.repId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-amber-100 text-amber-700">
                      {pattern.repName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{pattern.repName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{pattern.avgTouchesToMeeting} touches</span>
                      <span>·</span>
                      <span>{pattern.avgDaysToMeeting}d to meeting</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-amber-600">{pattern.winRate}%</p>
                    <p className="text-[10px] text-muted-foreground">win rate</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Full Rep Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              All Rep Patterns
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Rep</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Touches to Meeting</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Days to Meeting</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Touches/Week</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Conversion</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Win Rate</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Channel Mix</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPatterns.map((pattern, i) => {
                  const isTop = i < topQuartileCount
                  const isBottom = i >= sortedPatterns.length - topQuartileCount
                  
                  // Get top 3 channels
                  const topChannels = Object.entries(pattern.preferredChannelMix)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3) as [TouchChannel, number][]

                  return (
                    <tr key={pattern.repId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className={cn(
                              "text-xs font-semibold",
                              isTop ? "bg-green-100 text-green-700" : 
                              isBottom ? "bg-amber-100 text-amber-700" : 
                              "bg-primary/10 text-primary"
                            )}>
                              {pattern.repName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{pattern.repName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-medium",
                          pattern.avgTouchesToMeeting <= avgMetrics.touchesToMeeting ? "text-green-600" : "text-foreground"
                        )}>
                          {pattern.avgTouchesToMeeting}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-medium",
                          pattern.avgDaysToMeeting <= avgMetrics.daysToMeeting ? "text-green-600" : "text-foreground"
                        )}>
                          {pattern.avgDaysToMeeting}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-medium",
                          pattern.avgTouchesPerWeek >= avgMetrics.touchesPerWeek ? "text-green-600" : "text-foreground"
                        )}>
                          {pattern.avgTouchesPerWeek}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-medium",
                          pattern.conversionRate >= avgMetrics.conversionRate ? "text-green-600" : "text-foreground"
                        )}>
                          {pattern.conversionRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-sm font-semibold",
                          isTop ? "text-green-600" : isBottom ? "text-amber-600" : "text-foreground"
                        )}>
                          {pattern.winRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {topChannels.map(([channel, pct]) => {
                            const config = channelConfig[channel]
                            const Icon = config.icon
                            return (
                              <div
                                key={channel}
                                className={cn(
                                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                                  config.color
                                )}
                                title={`${config.label}: ${pct}%`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{pct}%</span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/reps/${pattern.repId}`}>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
