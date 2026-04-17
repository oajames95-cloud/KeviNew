"use client"

import { useState } from "react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { mockDataSources, mockTrustSetting } from "@/lib/mock-data"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Database, 
  Users, 
  FileText,
  Eye,
  EyeOff,
  Download,
  Settings2,
  RefreshCw,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  Workflow,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DataSourceStatus } from "@/types"

const statusConfig: Record<DataSourceStatus, { label: string; icon: React.ElementType; className: string; bgClass: string }> = {
  connected: { label: "Connected", icon: CheckCircle2, className: "text-success", bgClass: "bg-success/10" },
  disconnected: { label: "Disconnected", icon: XCircle, className: "text-muted-foreground", bgClass: "bg-muted" },
  error: { label: "Sync Error", icon: AlertTriangle, className: "text-destructive", bgClass: "bg-destructive/10" },
  pending: { label: "Pending Setup", icon: Clock, className: "text-warning", bgClass: "bg-warning/10" },
}

const sourceTypeIcons: Record<string, React.ElementType> = {
  crm: Database,
  calendar: Calendar,
  email: Mail,
  dialer: Phone,
  sequencer: Workflow,
  custom: Settings2,
}

export default function TrustPage() {
  const { toggle } = useMobileSidebar()
  const settings = mockTrustSetting
  const sources = mockDataSources
  const [expandedSource, setExpandedSource] = useState<string | null>(null)
  const [retentionDays, setRetentionDays] = useState(String(settings.retentionDays))

  const connectedCount = sources.filter(s => s.status === "connected").length
  const totalSources = sources.length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Trust Center"
        subtitle="Data collection, access, and retention"
        onMenuClick={toggle}
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Trust Overview Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground">
                  Coaching intelligence, not surveillance
                </h2>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                  Kevi analyzes work patterns to help managers coach effectively. We collect activity signals like call timing and sequence completion — never message content, recordings, or personal data. Reps see their own data. Managers see their direct reports. Admins manage settings.
                </p>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-muted-foreground">{connectedCount} of {totalSources} sources active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{retentionDays}-day retention</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-success" />
                    <span className="text-muted-foreground">Audit logging active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - 2 cols */}
          <div className="xl:col-span-2 space-y-6">

            {/* Connected Data Sources */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Connected Sources</h2>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                  Manage Integrations
                </Button>
              </div>

              <div className="space-y-2">
                {sources.map((source) => {
                  const { label, icon: StatusIcon, className, bgClass } = statusConfig[source.status]
                  const TypeIcon = sourceTypeIcons[source.type] || Database
                  const isExpanded = expandedSource === source.id

                  return (
                    <Collapsible 
                      key={source.id} 
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedSource(open ? source.id : null)}
                    >
                      <Card className={cn(
                        "transition-colors",
                        source.status === "error" && "border-destructive/30"
                      )}>
                        <CollapsibleTrigger asChild>
                          <CardContent className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bgClass)}>
                                  <TypeIcon className={cn("w-4 h-4", className)} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-foreground truncate">{source.name}</p>
                                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", className, bgClass)}>
                                      <StatusIcon className="w-2.5 h-2.5 mr-1" />
                                      {label}
                                    </Badge>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {source.provider} · {source.retentionDays}-day retention
                                    {source.lastSyncAt && source.status === "connected" && (
                                      <> · Synced {new Date(source.lastSyncAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {source.status === "error" && (
                                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Retry
                                  </Button>
                                )}
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-success mb-2 flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> What we collect
                                </p>
                                <ul className="space-y-1.5">
                                  {source.collectsFields.map((field) => (
                                    <li key={field} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-success mt-1.5 shrink-0" />
                                      {field}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" /> Never collected
                                </p>
                                <ul className="space-y-1.5">
                                  {source.doesNotCollect.map((field) => (
                                    <li key={field} className="text-xs text-muted-foreground flex items-start gap-2">
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                                      {field}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/50">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                View Sync History
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                <Settings2 className="w-3 h-3 mr-1.5" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  )
                })}
              </div>
            </section>

            {/* Role-based Access */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Who Sees What</h2>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-32">
                            Role
                          </th>
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex flex-col items-center gap-0.5">
                              <span>Own Data</span>
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex flex-col items-center gap-0.5">
                              <span>Team Scores</span>
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex flex-col items-center gap-0.5">
                              <span>Raw Activity</span>
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex flex-col items-center gap-0.5">
                              <span>Export</span>
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <div className="flex flex-col items-center gap-0.5">
                              <span>Settings</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.roleAccess.map((ra, idx) => {
                          const roleDescriptions: Record<string, string> = {
                            admin: "Full platform access",
                            manager: "Direct reports only",
                            viewer: "Aggregates only",
                            rep: "Own data only"
                          }
                          return (
                            <tr key={ra.role} className={cn(
                              "border-b border-border/50 last:border-0",
                              idx % 2 === 1 && "bg-muted/10"
                            )}>
                              <td className="px-4 py-3">
                                <p className="font-medium capitalize text-foreground">{ra.role}</p>
                                <p className="text-[10px] text-muted-foreground">{roleDescriptions[ra.role]}</p>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                              </td>
                              <td className="px-3 py-3 text-center">
                                {ra.canViewTeamAggregates || ra.canViewIndividualScores ? (
                                  <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                {ra.canViewRawActivity ? (
                                  <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                {ra.canExportData ? (
                                  <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                              <td className="px-3 py-3 text-center">
                                {ra.canManageSettings ? (
                                  <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-4">
            {/* Retention Control */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Data Retention
                </CardTitle>
                <CardDescription className="text-xs">
                  Activity data is automatically deleted after this period.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Select value={retentionDays} onValueChange={setRetentionDays}>
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Changes apply to new data. Existing data follows previous policy.
                </p>
              </CardContent>
            </Card>

            {/* Audit Log */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Audit Log
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-success/10 text-success border-success/20">
                    Active
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  All data access and exports are logged with user identity and timestamp.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Download className="w-3 h-3 mr-1.5" />
                  Export Audit Log
                </Button>
              </CardContent>
            </Card>

            {/* Last Review */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  Last Review
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Reviewed by</span>
                  <span className="font-medium text-foreground">{settings.reviewedBy}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{settings.lastReviewedAt}</span>
                </div>
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs mt-2">
                  Schedule Review
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Data Processing Agreement", href: "#" },
                  { label: "Security Whitepaper", href: "#" },
                  { label: "SOC 2 Report", href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
