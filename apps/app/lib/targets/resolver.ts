// ============================================================
// lib/targets/resolver.ts
// Server-only. THE SPINE. Answers: "what is this rep's effective target for this
// metric, right now, and where did it come from?" Resolution order:
//   1. active per-rep override   (coaching_targets, set in a coaching session)
//   2. team playbook default     (playbook_targets where team_id = rep.team_id)
//   3. org playbook default      (playbook_targets where team_id is null)
//   4. none
// Every surface (flagging, Targets tab, rep page, overview) reads through this so
// "default vs override" is authoritative, not inferred by comparing values.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import type {
  MetricType,
  TargetPeriod,
  Comparison,
  EffectiveTarget,
  TargetStatus,
} from './types'
import { METRIC_TYPES, METRIC_META } from './types'
import { getWindowForPeriod, calculatePaceStatus, pacePercent } from './pace'

function noneTarget(metric: MetricType): EffectiveTarget {
  return {
    metric,
    value: null,
    period: 'weekly',
    comparison: METRIC_META[metric].defaultComparison,
    source: 'none',
    window: getWindowForPeriod('weekly'),
  }
}

function overrideToEffective(row: any): EffectiveTarget {
  const period = (row.target_period || 'weekly') as TargetPeriod
  return {
    metric: row.metric_type as MetricType,
    value: Number(row.target_value),
    period,
    comparison: (row.comparison as Comparison) || METRIC_META[row.metric_type as MetricType].defaultComparison,
    source: 'override',
    sessionId: row.session_id ?? null,
    targetId: row.id,
    // Overrides carry their own explicit window from the coaching session.
    window:
      row.start_date && row.end_date
        ? { startDate: row.start_date, endDate: row.end_date }
        : getWindowForPeriod(period),
  }
}

function playbookToEffective(row: any): EffectiveTarget {
  const period = (row.target_period || 'weekly') as TargetPeriod
  return {
    metric: row.metric_type as MetricType,
    value: Number(row.target_value),
    period,
    comparison: (row.comparison as Comparison) || 'gte',
    source: row.team_id ? 'team_playbook' : 'org_playbook',
    targetId: row.id,
    window: getWindowForPeriod(period),
  }
}

// ---- Single rep, all metrics (rep page) ----------------------------------
export async function resolveEffectiveTargetsForRep(
  repId: string,
  metrics: MetricType[] = METRIC_TYPES
): Promise<Record<MetricType, EffectiveTarget>> {
  const map = await resolveEffectiveTargetsForReps([repId], metrics)
  return map.get(repId) ?? defaultsFor(metrics)
}

function defaultsFor(metrics: MetricType[]): Record<MetricType, EffectiveTarget> {
  const out = {} as Record<MetricType, EffectiveTarget>
  for (const m of metrics) out[m] = noneTarget(m)
  return out
}

// ---- Many reps, all metrics (Targets tab matrix) -------------------------
// Three queries total regardless of team size: reps, overrides, playbook.
export async function resolveEffectiveTargetsForReps(
  repIds: string[],
  metrics: MetricType[] = METRIC_TYPES
): Promise<Map<string, Record<MetricType, EffectiveTarget>>> {
  const result = new Map<string, Record<MetricType, EffectiveTarget>>()
  if (repIds.length === 0) return result

  const supabase = await createClient()

  const [{ data: reps }, { data: overrides }] = await Promise.all([
    supabase.from('reps').select('id, organization_id, team_id').in('id', repIds),
    // Note: coaching_targets has no `comparison` or `created_at` column in this
    // DB. comparison falls back to the metric default in overrideToEffective;
    // recency is approximated by start_date desc.
    supabase
      .from('coaching_targets')
      .select('id, rep_id, session_id, metric_type, target_value, target_period, start_date, end_date, status')
      .in('rep_id', repIds)
      .eq('status', 'active')
      .order('start_date', { ascending: false }),
  ])

  const orgIds = Array.from(new Set((reps || []).map((r: any) => r.organization_id).filter(Boolean)))
  const { data: playbook } = orgIds.length
    ? await supabase
        .from('playbook_targets')
        .select('id, organization_id, team_id, metric_type, target_value, target_period, comparison, active')
        .in('organization_id', orgIds)
        .eq('active', true)
    : { data: [] as any[] }

  // Index playbook defaults: org-level and team-level, keyed by metric.
  const orgDefaults = new Map<string, Map<MetricType, any>>() // orgId -> metric -> row
  const teamDefaults = new Map<string, Map<MetricType, any>>() // teamId -> metric -> row
  for (const row of playbook || []) {
    const metric = row.metric_type as MetricType
    if (row.team_id) {
      if (!teamDefaults.has(row.team_id)) teamDefaults.set(row.team_id, new Map())
      teamDefaults.get(row.team_id)!.set(metric, row)
    } else {
      if (!orgDefaults.has(row.organization_id)) orgDefaults.set(row.organization_id, new Map())
      orgDefaults.get(row.organization_id)!.set(metric, row)
    }
  }

  // Index overrides: most recent active per (rep, metric) — query is already
  // ordered start_date desc, so first seen wins.
  const overrideByRep = new Map<string, Map<MetricType, any>>()
  for (const row of overrides || []) {
    if (!overrideByRep.has(row.rep_id)) overrideByRep.set(row.rep_id, new Map())
    const m = overrideByRep.get(row.rep_id)!
    const metric = row.metric_type as MetricType
    if (!m.has(metric)) m.set(metric, row)
  }

  for (const rep of reps || []) {
    const perMetric = {} as Record<MetricType, EffectiveTarget>
    for (const metric of metrics) {
      const ovr = overrideByRep.get(rep.id)?.get(metric)
      if (ovr) {
        perMetric[metric] = overrideToEffective(ovr)
        continue
      }
      const team = rep.team_id ? teamDefaults.get(rep.team_id)?.get(metric) : undefined
      if (team) {
        perMetric[metric] = playbookToEffective(team)
        continue
      }
      const org = orgDefaults.get(rep.organization_id)?.get(metric)
      if (org) {
        perMetric[metric] = playbookToEffective(org)
        continue
      }
      perMetric[metric] = noneTarget(metric)
    }
    result.set(rep.id, perMetric)
  }

  // Reps not returned (bad id) still get defaults so callers never get undefined.
  for (const id of repIds) if (!result.has(id)) result.set(id, defaultsFor(metrics))

  return result
}

// ---- Combine an effective target with an actual into a status ------------
// Pure given inputs — keep the actuals lookup in the caller (it owns the window).
export function toStatus(target: EffectiveTarget, actual: number): TargetStatus {
  if (target.value == null || target.source === 'none') {
    return { ...target, actual, paceStatus: 'no_target', pacePercent: 0 }
  }
  return {
    ...target,
    actual,
    paceStatus: calculatePaceStatus(
      actual,
      target.value,
      target.window.startDate,
      target.window.endDate,
      target.comparison
    ),
    pacePercent: pacePercent(actual, target.value, target.window.startDate, target.window.endDate),
  }
}
