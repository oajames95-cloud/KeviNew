/**
 * Client-side utility functions for coaching targets
 * These cannot be imported from the server-only targets.ts file
 */

export type TargetMetricType = 'meetings_booked' | 'pipeline_created' | 'prospecting_minutes' | 'reply_rate' | 'sqls_booked'

type PaceStatus = 'on_track' | 'at_risk' | 'behind'

/**
 * Calculate pacing status based on current value, target, and elapsed time
 */
export function calculatePaceStatus(
  currentValue: number,
  targetValue: number,
  startDate: string,
  endDate: string,
  period: 'daily' | 'weekly' | 'monthly'
): PaceStatus {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate fraction of period elapsed
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const fractionElapsed = Math.min(1, Math.max(0, elapsedMs / totalMs))

  // Expected value at this point
  const expectedValue = targetValue * fractionElapsed

  // Only show pacing alerts after 20% of period has elapsed
  if (fractionElapsed < 0.2) {
    return 'on_track'
  }

  // Calculate current pace
  const currentPace = currentValue / Math.max(expectedValue, 0.1)

  if (currentPace >= 0.95) {
    return 'on_track'
  } else if (currentPace >= 0.7) {
    return 'at_risk'
  } else {
    return 'behind'
  }
}

/**
 * Format metric name for display
 */
export function formatMetricName(metricType: TargetMetricType, period?: string): string {
  const names: Record<TargetMetricType, string> = {
    meetings_booked: 'Meetings booked',
    pipeline_created: 'Pipeline created',
    prospecting_minutes: 'Prospecting time',
    reply_rate: 'Reply rate',
    sqls_booked: 'SQLs booked',
  }

  const name = names[metricType] || 'Target'

  if (period === 'daily') {
    return `${name} (daily)`
  } else if (period === 'weekly') {
    return `${name} (weekly)`
  } else if (period === 'monthly') {
    return `${name} (monthly)`
  }

  return name
}
