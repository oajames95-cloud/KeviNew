import { createClient } from "@/lib/supabase/server"
import { PlaybookClient } from "./playbook-client"
import { getPlaybookTargets } from "@/lib/targets/playbook-actions"

export const metadata = {
  title: "Playbook | Kevi",
  description: "Configure coaching targets, activity expectations, and alert rules",
}

export const dynamic = "force-dynamic"

// Non-target sections remain local UI config for now (alerting/routing — a
// separate concern from targets). Only the Targets section persists, via
// playbook_targets.
const defaultConfig = {
  targets: {
    weeklyMeetings: 5,
    dailyProspectingHours: 3,
    dailyCalls: 25,
    connectRateTarget: 35,
    followUpRateTarget: 80,
  },
  activityExpectations: {
    minProspectingMinutesPerDay: 120,
    minCallsPerDay: 15,
    maxContextSwitchesPerDay: 30,
    minFocusBlocksMinutes: 60,
    maxEmailMinutesPerDay: 60,
  },
  inactivityAlerts: {
    noActivityThresholdHours: 4,
    lowProspectingThresholdMinutes: 30,
    alertOnMissedDays: true,
    missedDayThreshold: 2,
  },
  dropDetection: {
    similarityDropThreshold: 15,
    activityDropThreshold: 25,
    lookbackDays: 7,
    triggerOnConsecutiveDays: 3,
  },
  managerRouting: {
    emailNotifications: true,
    slackNotifications: false,
    digestFrequency: "daily" as const,
    criticalAlertsImmediate: true,
    weeklyReportEnabled: true,
  },
}

export default async function PlaybookPage() {
  // Org-level config. Single-tenant for now: use the first organization.
  // In multi-tenant, derive this from the authenticated user's organization_id.
  let orgId = ""
  try {
    const supabase = await createClient()
    const { data: org } = await supabase.from("organizations").select("id").limit(1).single()
    orgId = (org as { id?: string } | null)?.id ?? ""
  } catch {
    orgId = ""
  }

  const initialTargets = await getPlaybookTargets(orgId)

  return (
    <PlaybookClient
      initialConfig={defaultConfig}
      orgId={orgId}
      initialTargets={initialTargets}
    />
  )
}
