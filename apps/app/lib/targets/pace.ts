// ============================================================
// lib/targets/pace.ts
// Pure functions — no Supabase, safe in client components. Consolidates the two
// copies of calculatePaceStatus (target-progress.ts used 0.9/0.7, target-utils.ts
// used 0.95/0.7) onto ONE definition: 0.9 / 0.7, with a 20%-elapsed grace period.
// Also the single home for window derivation and metric formatting.
// ============================================================

import type { MetricType, TargetPeriod, Comparison, PaceStatus } from './types'
import { METRIC_META } from './types'

function iso(d: Date): string {
  return d.toISOString().split('T')[0]
}

// The current calendar window for a recurring playbook period, relative to `now`.
// daily   = today
// weekly  = Monday 00:00 → now (ISO week)
// monthly = 1st of month → now
export function getWindowForPeriod(period: TargetPeriod, now: Date = new Date()): {
  startDate: string
  endDate: string
} {
  const end = new Date(now)
  const start = new Date(now)

  if (period === 'daily') {
    // start = today
  } else if (period === 'weekly') {
    const day = (start.getDay() + 6) % 7 // Mon=0 … Sun=6
    start.setDate(start.getDate() - day)
  } else {
    start.setDate(1)
  }
  start.setHours(0, 0, 0, 0)

  return { startDate: iso(start), endDate: iso(end) }
}

// Total days in a full period — used to project pace.
export function daysInPeriod(period: TargetPeriod): number {
  return period === 'daily' ? 1 : period === 'weekly' ? 7 : 30
}

// On-track / at-risk / behind, accounting for how far through the window we are.
// `comparison` flips the meaning for "at most" targets.
export function calculatePaceStatus(
  actual: number,
  target: number,
  startDate: string,
  endDate: string,
  comparison: Comparison = 'gte'
): PaceStatus {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const fractionElapsed = totalMs <= 0 ? 1 : Math.max(0, Math.min(1, elapsedMs / totalMs))

  // For "at most" targets, lower actual is better — invert the ratio.
  if (comparison === 'lte') {
    if (target <= 0) return actual <= 0 ? 'on_track' : 'behind'
    const usage = actual / target
    if (usage <= 0.9) return 'on_track'
    if (usage <= 1.0) return 'at_risk'
    return 'behind'
  }

  // Grace: don't alarm before 20% of the window has elapsed.
  if (fractionElapsed < 0.2) return 'on_track'

  const expected = target * fractionElapsed
  const pace = actual / Math.max(expected, 0.0001)

  if (pace >= 0.9) return 'on_track'
  if (pace >= 0.7) return 'at_risk'
  return 'behind'
}

// 0..100+ — actual as a percent of where they should be by now.
export function pacePercent(
  actual: number,
  target: number,
  startDate: string,
  endDate: string
): number {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const fractionElapsed = totalMs <= 0 ? 1 : Math.max(0.0001, Math.min(1, elapsedMs / totalMs))
  const expected = Math.max(target * fractionElapsed, 0.0001)
  return Math.round((actual / expected) * 100)
}

export function formatMetricName(metric: MetricType, period?: TargetPeriod): string {
  const name = METRIC_META[metric]?.label ?? metric
  return period ? `${name} (${period})` : name
}

export function formatTargetValue(metric: MetricType, value: number): string {
  const unit = METRIC_META[metric]?.unit
  switch (unit) {
    case 'currency':
      return `£${Math.round(value).toLocaleString()}`
    case 'percent':
      return `${Math.round(value)}%`
    case 'minutes':
      return `${Math.round(value)} min`
    default:
      return `${Math.round(value)}`
  }
}
