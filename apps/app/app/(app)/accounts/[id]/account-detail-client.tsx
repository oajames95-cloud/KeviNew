"use client"

import Link from "next/link"
import { 
  ChevronLeft, 
  Building2, 
  Globe, 
  Users, 
  DollarSign, 
  Phone, 
  Mail, 
  Calendar, 
  Linkedin,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  MinusCircle,
  User,
  Target,
  BarChart3,
} from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AccountPulse } from "@/components/accounts/account-pulse"
import { cn } from "@/lib/utils"
import type { Account, AccountTouch, AccountPattern, TouchChannel, TouchOutcome, AccountStage } from "@/types"

interface AccountDetailClientProps {
  account: Account
  touches: AccountTouch[]
  repPattern?: AccountPattern
}

// Channel styling
const channelConfig: Record<TouchChannel, { icon: typeof Phone; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  email: { icon: Mail, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  meeting: { icon: Calendar, color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  linkedin: { icon: Linkedin, color: "text-sky-600", bg: "bg-sky-50 border-sky-200" },
  sms: { icon: Mail, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
}

// Outcome styling
const outcomeConfig: Record<TouchOutcome, { icon: typeof CheckCircle2; color: string; label: string }> = {
  positive: { icon: CheckCircle2, color: "text-green-600", label: "Positive" },
  negative: { icon: XCircle, color: "text-red-600", label: "Negative" },
  neutral: { icon: MinusCircle, color: "text-slate-500", label: "Neutral" },
  no_response: { icon: Clock, color: "text-amber-600", label: "No Response" },
  meeting_booked: { icon: Calendar, color: "text-purple-600", label: "Meeting Booked" },
  deal_moved: { icon: TrendingUp, color: "text-blue-600", label: "Deal Moved" },
}

// Stage colors
const stageColors: Record<AccountStage, string> = {
  prospecting: "bg-slate-100 text-slate-700 border-slate-200",
  discovery: "bg-blue-100 text-blue-700 border-blue-200",
  evaluation: "bg-purple-100 text-purple-700 border-purple-200",
  negotiation: "bg-amber-100 text-amber-700 border-amber-200",
  "closed-won": "bg-green-100 text-green-700 border-green-200",
  "closed-lost": "bg-red-100 text-red-700 border-red-200",
}

const stageLabels: Record<AccountStage, string> = {
  prospecting: "Prospecting",
  discovery: "Discovery",
  evaluation: "Evaluation",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

// Heat colors
const heatColors = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

export function AccountDetailClient({ account, touches, repPattern }: AccountDetailClientProps) {
  const { toggle } = useMobileSidebar()

  // Calculate channel distribution from touches
  const channelCounts = touches.reduce((acc, t) => {
    acc[t.channel] = (acc[t.channel] || 0) + 1
    return acc
  }, {} as Record<TouchChannel, number>)

  const totalTouchCount = touches.length
  const channelDistribution = Object.entries(channelCounts)
    .map(([channel, count]) => ({
      channel: channel as TouchChannel,
      count,
      percentage: Math.round((count / totalTouchCount) * 100),
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate timing patterns
  const touchesByDay = touches.reduce((acc, t) => {
    const day = new Date(t.timestamp).toLocaleDateString('en-US', { weekday: 'short' })
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={account.name}
        subtitle={`${stageLabels[account.stage]} · ${account.industry || 'Unknown Industry'}`}
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

        {/* Hero Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Account Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted text-muted-foreground shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-xl font-bold text-foreground">{account.name}</h1>
                  <Badge variant="outline" className={cn("text-xs", stageColors[account.stage])}>
                    {stageLabels[account.stage]}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", heatColors[account.heat])} />
                    <span className="text-xs text-muted-foreground capitalize">{account.heat}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {account.domain && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {account.domain}
                    </span>
                  )}
                  {account.employeeCount && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {account.employeeCount.toLocaleString()} employees
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {account.ownerName}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Metrics */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-foreground">{account.totalTouches}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total Touches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-foreground">{account.meetingsBooked}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Meetings</p>
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  account.daysSinceLastTouch > 7 ? "text-amber-600" : "text-foreground"
                )}>
                  {account.daysSinceLastTouch}d
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Since Touch</p>
              </div>
              {account.pipelineValue && (
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-foreground">
                    ${(account.pipelineValue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pipeline</p>
                </div>
              )}
            </div>
          </div>

          {/* Win probability bar + Activity chart */}
          {account.winProbability !== undefined && account.winProbability > 0 && (
            <div className="mt-6 pt-4 border-t border-border space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Win Probability</span>
                  <span className="text-sm font-semibold text-foreground">{account.winProbability}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                    style={{ width: `${account.winProbability}%` }}
                  />
                </div>
              </div>
              
              {/* Activity Pulse - 7 day visualization */}
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-2">7-Day Activity</span>
                <AccountPulse touches={touches} width={240} height={40} />
              </div>
            </div>
          )}
          
          {/* Activity Pulse when no win probability */}
          {(account.winProbability === undefined || account.winProbability === 0) && (
            <div className="mt-6 pt-4 border-t border-border">
              <span className="text-xs font-medium text-muted-foreground block mb-2">7-Day Activity</span>
              <AccountPulse touches={touches} width={240} height={40} />
            </div>
          )}
        </div>

        {/* Main Content: Timeline (60%) + Right Column (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Touch Timeline - 60% */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Activity Timeline</h2>
              <span className="text-xs text-muted-foreground">{touches.length} touches</span>
            </div>
            
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {touches.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No activity recorded yet
                </div>
              ) : (
                touches.map((touch, i) => {
                  const config = channelConfig[touch.channel]
                  const outcomeConf = outcomeConfig[touch.outcome]
                  const Icon = config.icon
                  const OutcomeIcon = outcomeConf.icon

                  return (
                    <div key={touch.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Channel Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg border shrink-0",
                          config.bg
                        )}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {touch.subject || `${touch.channel.charAt(0).toUpperCase() + touch.channel.slice(1)} ${touch.direction}`}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{touch.repName}</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground capitalize">{touch.direction}</span>
                                {touch.durationMinutes && (
                                  <>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">{touch.durationMinutes} min</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Outcome badge */}
                              <div className={cn("flex items-center gap-1", outcomeConf.color)}>
                                <OutcomeIcon className="w-3.5 h-3.5" />
                                <span className="text-xs">{outcomeConf.label}</span>
                              </div>
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(touch.timestamp).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {touch.nextStepScheduled && (
                              <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                                Next step
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column - 40% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Channel Mix */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Channel Mix
              </h3>
              <div className="space-y-3">
                {channelDistribution.map(({ channel, count, percentage }) => {
                  const config = channelConfig[channel]
                  const Icon = config.icon
                  return (
                    <div key={channel} className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center justify-center w-7 h-7 rounded border shrink-0",
                        config.bg
                      )}>
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground capitalize">{channel}</span>
                          <span className="text-xs text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", config.color.replace('text-', 'bg-'))}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contacts */}
            {account.contacts && account.contacts.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Contacts ({account.contacts.length})
                </h3>
                <div className="space-y-3">
                  {account.contacts.map(contact => (
                    <div key={contact.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {contact.name}
                          {contact.isPrimary && (
                            <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 h-4">
                              Primary
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{contact.title}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-foreground">{contact.touchCount}</p>
                        <p className="text-[10px] text-muted-foreground">touches</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rep Pattern Insight */}
            {repPattern && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  Rep Pattern
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Avg touches to meeting</span>
                    <span className="text-sm font-medium text-foreground">{repPattern.avgTouchesToMeeting}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Avg days to meeting</span>
                    <span className="text-sm font-medium text-foreground">{repPattern.avgDaysToMeeting}d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Conversion rate</span>
                    <span className="text-sm font-medium text-foreground">{repPattern.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Win rate</span>
                    <span className="text-sm font-medium text-green-600">{repPattern.winRate}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Link href={`/reps/${account.ownerId}`}>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5">
                      View {account.ownerName}&apos;s Profile
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{account.touchesLast7Days}</p>
                  <p className="text-[10px] text-muted-foreground">Last 7 days</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">{account.touchesLast30Days}</p>
                  <p className="text-[10px] text-muted-foreground">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
