// ============================================================
// lib/targets/flagging.ts
// Server-only. Closes the loop: track -> flag. For each rep, resolve effective
// targets (override -> team -> org default), compute real actuals for the
// current window, and turn target breaches into coaching_items.
//
// detectBreaches()    -> pure-ish read: returns the current breach list.
// syncCoachingItems() -> reconciles coaching_items with the breach list:
//                          - open item exists for rep+metric  -> refresh it
//                          - no open item                     -> insert 'new'
//                          - open item but breach cleared      -> mark 'coached'
//
// "Open" = status in ('new','reviewing','watchlist'). 'coached' is terminal.
// One open item per (rep, metric) is enforced by the coaching_theme tag
// `target:<metric>` we write and match on, so reruns don't duplicate.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type { MetricType, TargetStatus } from './types'
import { METRIC_META } from './types'
import { formatTargetValue } from './pace'
import { resolveEffectiveTargetsForReps, toStatus } from './resolver'
import { calculateActualsForReps } from './metrics'
import { getWindowForPeriod } from './pace'

const OPEN_STATUSES = ['new', 'reviewing', 'watchlist']
const THEME_PREFIX = 'target:' // coaching_theme = `target:meetings_booked` etc.

export interface Breach {
  repId: string
  metric: MetricType
  status: TargetStatus
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  reason: string
  suggestedAction: string
}

// Map pace shortfall to severity. behind + far below = worse.
function severityFor(s: TargetStatus): Breach['severity'] {
  if (s.paceStatus === 'at_risk') return 'low'
  // behind: grade by how far under expected pace
  if (s.pacePercent < 40) return 'critical'
  if (s.pacePercent < 60) return 'high'
  return 'medium'
}

function buildCopy(metric: MetricType, s: TargetStatus): Pick<Breach, 'title' | 'reason' | 'suggestedAction'> {
  const label = METRIC_META[metric].label
  const target = formatTargetValue(metric, s.value ?? 0)
  const actual = formatTargetValue(metric, s.actual)
  const srcLabel =
    s.source === 'override'
      ? 'individual target'
      : s.source === 'team_playbook'
        ? 'team target'
        : 'team default'
  return {
    title: `${label} below ${srcLabel}`,
    reason: `Tracking ${actual} against a ${s.period} target of ${target} (${s.pacePercent}% of expected pace).`,
    suggestedAction: `Discuss ${label.toLowerCase()} in the next 1:1 — review what changed this ${s.period} and agree one concrete action.`,
  }
}

// ---- Detection: returns the current breaches across all reps in an org -----
export async function detectBreaches(orgId: string): Promise<Breach[]> {
  if (!orgId) return []
  const supabase = await createClient()

  const { data: reps, error } = await supabase
    .from('reps')
    .select('id')
    .eq('organization_id', orgId)
  if (error || !reps || reps.length === 0) return []

  const repIds = reps.map((r: any) => r.id)

  // Resolve every rep's effective targets (3 queries total inside).
  const targetsByRep = await resolveEffectiveTargetsForReps(repIds)

  // Actuals: most targets share a weekly window; prospecting is daily. Pull the
  // widest window (weekly) once for outcome metrics and a daily window for
  // prospecting, then compare each metric against its own resolved window.
  const weekly = getWindowForPeriod('weekly')
  const actualsWeekly = await calculateActualsForReps(repIds, weekly.startDate, weekly.endDate)
  const daily = getWindowForPeriod('daily')
  const actualsDaily = await calculateActualsForReps(repIds, daily.startDate, daily.endDate)

  const breaches: Breach[] = []
  for (const repId of repIds) {
    const perMetric = targetsByRep.get(repId)
    if (!perMetric) continue
    for (const metric of Object.keys(perMetric) as MetricType[]) {
      const eff = perMetric[metric]
      if (eff.value == null || eff.source === 'none') continue // no target set -> nothing to flag

      const actual =
        eff.period === 'daily'
          ? actualsDaily.get(repId)?.[metric] ?? 0
          : actualsWeekly.get(repId)?.[metric] ?? 0

      const s = toStatus(eff, actual)
      if (s.paceStatus === 'behind' || s.paceStatus === 'at_risk') {
        breaches.push({
          repId,
          metric,
          status: s,
          severity: severityFor(s),
          ...buildCopy(metric, s),
        })
      }
    }
  }
  return breaches
}

// ---- Reconcile coaching_items with the breach list ------------------------
export async function syncCoachingItems(
  orgId: string
): Promise<{ created: number; refreshed: number; closed: number }> {
  const result = { created: 0, refreshed: 0, closed: 0 }
  if (!orgId) return result

  const supabase = await createClient()
  const breaches = await detectBreaches(orgId)

  // Current open, system-generated target items for this org.
  const { data: openItems } = await supabase
    .from('coaching_items')
    .select('id, rep_id, coaching_theme, status')
    .eq('organization_id', orgId)
    .like('coaching_theme', `${THEME_PREFIX}%`)
    .in('status', OPEN_STATUSES)

  // Index existing open items by rep+theme.
  const openByKey = new Map<string, { id: string }>()
  for (const it of openItems || []) {
    openByKey.set(`${it.rep_id}::${it.coaching_theme}`, { id: it.id })
  }

  const breachKeys = new Set<string>()

  for (const b of breaches) {
    const theme = `${THEME_PREFIX}${b.metric}`
    const key = `${b.repId}::${theme}`
    breachKeys.add(key)
    const existing = openByKey.get(key)

    if (existing) {
      const { error } = await supabase
        .from('coaching_items')
        .update({
          title: b.title,
          reason: b.reason,
          suggested_action: b.suggestedAction,
          severity: b.severity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (!error) result.refreshed++
    } else {
      const { error } = await supabase.from('coaching_items').insert({
        organization_id: orgId,
        rep_id: b.repId,
        coaching_theme: theme,
        title: b.title,
        reason: b.reason,
        suggested_action: b.suggestedAction,
        severity: b.severity,
        status: 'new',
        opened_at: new Date().toISOString(),
      })
      if (!error) result.created++
    }
  }

  // Close open target-items whose breach has cleared.
  for (const [key, item] of openByKey) {
    if (!breachKeys.has(key)) {
      const { error } = await supabase
        .from('coaching_items')
        .update({
          status: 'coached',
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)
      if (!error) result.closed++
    }
  }

  return result
}
