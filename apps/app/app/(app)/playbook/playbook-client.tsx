"use client"

import { useState } from "react"
import {
  Target,
  Activity,
  Bell,
  TrendingDown,
  Mail,
  Save,
  RotateCcw,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PlaybookConfig {
  targets: {
    weeklyMeetings: number
    dailyProspectingHours: number
    dailyCalls: number
    connectRateTarget: number
    followUpRateTarget: number
  }
  activityExpectations: {
    minProspectingMinutesPerDay: number
    minCallsPerDay: number
    maxContextSwitchesPerDay: number
    minFocusBlocksMinutes: number
    maxEmailMinutesPerDay: number
  }
  inactivityAlerts: {
    noActivityThresholdHours: number
    lowProspectingThresholdMinutes: number
    alertOnMissedDays: boolean
    missedDayThreshold: number
  }
  dropDetection: {
    similarityDropThreshold: number
    activityDropThreshold: number
    lookbackDays: number
    triggerOnConsecutiveDays: number
  }
  managerRouting: {
    emailNotifications: boolean
    slackNotifications: boolean
    digestFrequency: "daily" | "weekly" | "realtime"
    criticalAlertsImmediate: boolean
    weeklyReportEnabled: boolean
  }
}

interface PlaybookClientProps {
  initialConfig: PlaybookConfig
}

export function PlaybookClient({ initialConfig }: PlaybookClientProps) {
  const [config, setConfig] = useState<PlaybookConfig>(initialConfig)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("targets")

  const updateConfig = <K extends keyof PlaybookConfig>(
    section: K,
    field: keyof PlaybookConfig[K],
    value: PlaybookConfig[K][keyof PlaybookConfig[K]]
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In production, this would save to the database
    setHasChanges(false)
  }

  const handleReset = () => {
    setConfig(initialConfig)
    setHasChanges(false)
  }

  const sections = [
    {
      id: "targets",
      label: "Targets",
      icon: Target,
      description: "Weekly and daily performance goals",
    },
    {
      id: "expectations",
      label: "Activity Expectations",
      icon: Activity,
      description: "Baseline activity thresholds",
    },
    {
      id: "inactivity",
      label: "Inactivity Alerts",
      icon: Bell,
      description: "When to flag inactive reps",
    },
    {
      id: "detection",
      label: "Drop Detection",
      icon: TrendingDown,
      description: "Pattern drift sensitivity",
    },
    {
      id: "routing",
      label: "Manager Routing",
      icon: Mail,
      description: "Notification preferences",
    },
  ]

  return (
    <TooltipProvider>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Playbook Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure coaching thresholds, alert rules, and notification preferences
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(!hasChanges && "opacity-50")}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Section Navigation */}
            <div className="w-56 shrink-0">
              <nav className="sticky top-8 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                      activeSection === section.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <section.icon
                      className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        activeSection === section.id ? "text-primary" : ""
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{section.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {section.description}
                      </p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Section Content */}
            <div className="flex-1">
              {activeSection === "targets" && (
                <SettingsSection
                  title="Performance Targets"
                  description="Set the goals your team should aim for. These are used to calculate attainment and identify underperformers."
                >
                  <div className="grid grid-cols-2 gap-6">
                    <SettingsField
                      label="Weekly Meetings Target"
                      hint="Number of meetings each rep should book per week"
                    >
                      <Input
                        type="number"
                        value={config.targets.weeklyMeetings}
                        onChange={(e) =>
                          updateConfig("targets", "weeklyMeetings", Number(e.target.value))
                        }
                        className="w-24"
                      />
                    </SettingsField>

                    <SettingsField
                      label="Daily Prospecting Hours"
                      hint="Target hours spent prospecting each day"
                    >
                      <Input
                        type="number"
                        step="0.5"
                        value={config.targets.dailyProspectingHours}
                        onChange={(e) =>
                          updateConfig(
                            "targets",
                            "dailyProspectingHours",
                            Number(e.target.value)
                          )
                        }
                        className="w-24"
                      />
                    </SettingsField>

                    <SettingsField
                      label="Daily Calls Target"
                      hint="Minimum calls per day"
                    >
                      <Input
                        type="number"
                        value={config.targets.dailyCalls}
                        onChange={(e) =>
                          updateConfig("targets", "dailyCalls", Number(e.target.value))
                        }
                        className="w-24"
                      />
                    </SettingsField>

                    <SettingsField
                      label="Connect Rate Target"
                      hint="Target connect rate percentage"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.targets.connectRateTarget}
                          onChange={(e) =>
                            updateConfig(
                              "targets",
                              "connectRateTarget",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Follow-up Rate Target"
                      hint="Target follow-up completion rate"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.targets.followUpRateTarget}
                          onChange={(e) =>
                            updateConfig(
                              "targets",
                              "followUpRateTarget",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </SettingsField>
                  </div>
                </SettingsSection>
              )}

              {activeSection === "expectations" && (
                <SettingsSection
                  title="Activity Expectations"
                  description="Define the baseline activity levels expected from reps. Below these thresholds triggers coaching flags."
                >
                  <div className="grid grid-cols-2 gap-6">
                    <SettingsField
                      label="Min Prospecting Minutes/Day"
                      hint="Minimum prospecting time before flagging"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.activityExpectations.minProspectingMinutesPerDay}
                          onChange={(e) =>
                            updateConfig(
                              "activityExpectations",
                              "minProspectingMinutesPerDay",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Min Calls/Day"
                      hint="Minimum calls before flagging"
                    >
                      <Input
                        type="number"
                        value={config.activityExpectations.minCallsPerDay}
                        onChange={(e) =>
                          updateConfig(
                            "activityExpectations",
                            "minCallsPerDay",
                            Number(e.target.value)
                          )
                        }
                        className="w-24"
                      />
                    </SettingsField>

                    <SettingsField
                      label="Max Context Switches/Day"
                      hint="Excessive switching indicates distraction"
                    >
                      <Input
                        type="number"
                        value={config.activityExpectations.maxContextSwitchesPerDay}
                        onChange={(e) =>
                          updateConfig(
                            "activityExpectations",
                            "maxContextSwitchesPerDay",
                            Number(e.target.value)
                          )
                        }
                        className="w-24"
                      />
                    </SettingsField>

                    <SettingsField
                      label="Min Focus Block Minutes"
                      hint="Uninterrupted prospecting time"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.activityExpectations.minFocusBlocksMinutes}
                          onChange={(e) =>
                            updateConfig(
                              "activityExpectations",
                              "minFocusBlocksMinutes",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Max Email Minutes/Day"
                      hint="Cap on email time to prevent over-indexing"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.activityExpectations.maxEmailMinutesPerDay}
                          onChange={(e) =>
                            updateConfig(
                              "activityExpectations",
                              "maxEmailMinutesPerDay",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">min</span>
                      </div>
                    </SettingsField>
                  </div>
                </SettingsSection>
              )}

              {activeSection === "inactivity" && (
                <SettingsSection
                  title="Inactivity Alerts"
                  description="Configure when to alert on low or missing activity."
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <SettingsField
                        label="No Activity Threshold"
                        hint="Hours of no activity before alerting"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={config.inactivityAlerts.noActivityThresholdHours}
                            onChange={(e) =>
                              updateConfig(
                                "inactivityAlerts",
                                "noActivityThresholdHours",
                                Number(e.target.value)
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                      </SettingsField>

                      <SettingsField
                        label="Low Prospecting Threshold"
                        hint="Minutes below which is considered low"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={config.inactivityAlerts.lowProspectingThresholdMinutes}
                            onChange={(e) =>
                              updateConfig(
                                "inactivityAlerts",
                                "lowProspectingThresholdMinutes",
                                Number(e.target.value)
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </SettingsField>

                      <SettingsField
                        label="Missed Day Threshold"
                        hint="Consecutive missed days before alerting"
                      >
                        <Input
                          type="number"
                          value={config.inactivityAlerts.missedDayThreshold}
                          onChange={(e) =>
                            updateConfig(
                              "inactivityAlerts",
                              "missedDayThreshold",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                          disabled={!config.inactivityAlerts.alertOnMissedDays}
                        />
                      </SettingsField>
                    </div>

                    <div className="flex items-center justify-between py-4 border-t border-border">
                      <div>
                        <Label className="text-sm font-medium">Alert on Missed Days</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Flag reps who miss consecutive workdays
                        </p>
                      </div>
                      <Switch
                        checked={config.inactivityAlerts.alertOnMissedDays}
                        onCheckedChange={(checked) =>
                          updateConfig("inactivityAlerts", "alertOnMissedDays", checked)
                        }
                      />
                    </div>
                  </div>
                </SettingsSection>
              )}

              {activeSection === "detection" && (
                <SettingsSection
                  title="Drop Detection Rules"
                  description="Configure sensitivity for detecting performance and pattern drops."
                >
                  <div className="grid grid-cols-2 gap-6">
                    <SettingsField
                      label="Similarity Drop Threshold"
                      hint="% drop in Top Rep Similarity to flag"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.dropDetection.similarityDropThreshold}
                          onChange={(e) =>
                            updateConfig(
                              "dropDetection",
                              "similarityDropThreshold",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Activity Drop Threshold"
                      hint="% drop in activity metrics to flag"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.dropDetection.activityDropThreshold}
                          onChange={(e) =>
                            updateConfig(
                              "dropDetection",
                              "activityDropThreshold",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Lookback Period"
                      hint="Days to compare against"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.dropDetection.lookbackDays}
                          onChange={(e) =>
                            updateConfig(
                              "dropDetection",
                              "lookbackDays",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                    </SettingsField>

                    <SettingsField
                      label="Consecutive Days to Trigger"
                      hint="Days of drop before flagging"
                    >
                      <Input
                        type="number"
                        value={config.dropDetection.triggerOnConsecutiveDays}
                        onChange={(e) =>
                          updateConfig(
                            "dropDetection",
                            "triggerOnConsecutiveDays",
                            Number(e.target.value)
                          )
                        }
                        className="w-24"
                      />
                    </SettingsField>
                  </div>
                </SettingsSection>
              )}

              {activeSection === "routing" && (
                <SettingsSection
                  title="Manager Notification Routing"
                  description="Configure how and when you receive alerts about your team."
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Receive coaching alerts via email
                        </p>
                      </div>
                      <Switch
                        checked={config.managerRouting.emailNotifications}
                        onCheckedChange={(checked) =>
                          updateConfig("managerRouting", "emailNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">Slack Notifications</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Receive coaching alerts via Slack
                        </p>
                      </div>
                      <Switch
                        checked={config.managerRouting.slackNotifications}
                        onCheckedChange={(checked) =>
                          updateConfig("managerRouting", "slackNotifications", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">
                          Critical Alerts Immediate
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Send critical severity alerts immediately
                        </p>
                      </div>
                      <Switch
                        checked={config.managerRouting.criticalAlertsImmediate}
                        onCheckedChange={(checked) =>
                          updateConfig(
                            "managerRouting",
                            "criticalAlertsImmediate",
                            checked
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <div>
                        <Label className="text-sm font-medium">Weekly Report</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Receive a weekly team performance summary
                        </p>
                      </div>
                      <Switch
                        checked={config.managerRouting.weeklyReportEnabled}
                        onCheckedChange={(checked) =>
                          updateConfig(
                            "managerRouting",
                            "weeklyReportEnabled",
                            checked
                          )
                        }
                      />
                    </div>

                    <SettingsField
                      label="Digest Frequency"
                      hint="How often to receive non-critical alerts"
                    >
                      <Select
                        value={config.managerRouting.digestFrequency}
                        onValueChange={(value: "daily" | "weekly" | "realtime") =>
                          updateConfig("managerRouting", "digestFrequency", value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>
                </SettingsSection>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

// Section wrapper component
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

// Field wrapper component
function SettingsField({
  label,
  hint,
  children,
}: {
  label: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {children}
    </div>
  )
}
