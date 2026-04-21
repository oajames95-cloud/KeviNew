import { PlaybookClient } from "./playbook-client"

export const metadata = {
  title: "Playbook | Kevi",
  description: "Configure coaching targets, activity expectations, and alert rules",
}

// Default playbook configuration
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

export default function PlaybookPage() {
  return <PlaybookClient initialConfig={defaultConfig} />
}
