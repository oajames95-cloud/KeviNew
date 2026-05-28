// ============================================================
// lib/targets/playbook-actions.ts
// Server actions for the Playbook UI to read and persist org-level default
// targets into playbook_targets. These are the org-wide defaults the resolver
// falls back to when a rep has no per-rep override. Team-level defaults are a
// later addition (pass a teamId); this covers the org level the playbook page edits.
// ============================================================

'use server'

import { createClient } from '@/lib/supabase/server'
import type { MetricType, TargetPeriod } from './types'
import { METRIC_TYPES } from './types'

export interface PlaybookTargetInput {
  metric: MetricType
  value: number
  period: TargetPeriod
}

export type PlaybookTargets = Record<
  MetricType,
  { value: number; period: TargetPeriod } | null
>

// Read the org's active org-level (team_id null) defaults, keyed by metric.
// Metrics with no row come back null so the UI can show "not set".
export async function getPlaybookTargets(orgId: string): Promise<PlaybookTargets> {
  const out = Object.fromEntries(METRIC_TYPES.map((m) => [m, null])) as PlaybookTargets
  if (!orgId) return out

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('playbook_targets')
    .select('metric_type, target_value, target_period')
    .eq('organization_id', orgId)
    .is('team_id', null)
    .eq('active', true)

  if (error) {
    console.error('[playbook] getPlaybookTargets error:', error)
    return out
  }

  for (const row of data || []) {
    out[row.metric_type as MetricType] = {
      value: Number(row.target_value),
      period: row.target_period as TargetPeriod,
    }
  }
  return out
}

// Upsert the org's defaults. For each provided metric: update the existing
// active org-level row, or insert one if none exists. Idempotent and safe to
// call on every Save. Returns { success, error } so the UI can toast.
export async function savePlaybookTargets(
  orgId: string,
  targets: PlaybookTargetInput[]
): Promise<{ success: boolean; error?: string }> {
  if (!orgId) return { success: false, error: 'Missing organization id' }

  const supabase = await createClient()
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('playbook_targets')
      .select('id, metric_type')
      .eq('organization_id', orgId)
      .is('team_id', null)
      .eq('active', true)
    if (fetchErr) throw fetchErr

    const idByMetric = new Map((existing || []).map((r: any) => [r.metric_type as MetricType, r.id]))

    for (const t of targets) {
      const existingId = idByMetric.get(t.metric)
      if (existingId) {
        const { error } = await supabase
          .from('playbook_targets')
          .update({
            target_value: t.value,
            target_period: t.period,
            active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('playbook_targets').insert({
          organization_id: orgId,
          team_id: null,
          metric_type: t.metric,
          target_value: t.value,
          target_period: t.period,
          active: true,
        })
        if (error) throw error
      }
    }

    return { success: true }
  } catch (e: any) {
    console.error('[playbook] savePlaybookTargets error:', e)
    return { success: false, error: e?.message || 'Failed to save playbook targets' }
  }
}
