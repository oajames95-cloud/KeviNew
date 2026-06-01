// ============================================================
// lib/hubspot/sync.ts
// Server-only. Pulls real outcomes from HubSpot and writes them into rep_outcomes,
// which the flagging engine already reads. The owner->rep link is the
// reps.hubspot_owner_id column (per-client config — no hardcoding).
//
// Writes ONE row per (rep, day) so the flagging engine's weekly SUM stays correct.
// syncOutcomesForDay(orgId, date) is the primitive; the debug route / cron loops it.
//
// Metric mapping (against the live default pipeline):
//   meetings_booked       = meetings created in-window (hs_createdate)
//   pipeline_created      = sum of deal `amount` for deals created in-window
//   opportunities_created = count of deals created in-window
//   qualified_meetings    = of those deals, count currently at a qualified+ stage
//   positive_replies      = inbound email engagements in-window (best-effort)
//
// Known limitation: qualified_meetings counts deals CREATED in-window that are
// currently at a qualified stage — true "entered stage on day X" needs deal stage
// history (a v2). Documented honestly rather than silently approximated.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { searchObjects } from './client'

// Stages counted as "qualified" (probability >= 0.4 in the default pipeline).
// Per-client configurable later; hardcoded to the standard pipeline for now.
const QUALIFIED_STAGES = new Set([
  'qualifiedtobuy',
  'presentationscheduled',
  'decisionmakerboughtin',
  'contractsent',
  'closedwon',
])

function dayWindowMs(date: Date): { startMs: string; endMs: string; dateStr: string } {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return {
    startMs: String(start.getTime()),
    endMs: String(end.getTime()),
    dateStr: start.toISOString().split('T')[0],
  }
}

interface DayOutcome {
  meetings_booked: number
  pipeline_created: number
  opportunities_created: number
  qualified_meetings: number
  positive_replies: number
}

async function outcomesForOwnerDay(ownerId: string, startMs: string, endMs: string): Promise<DayOutcome> {
  const o: DayOutcome = {
    meetings_booked: 0,
    pipeline_created: 0,
    opportunities_created: 0,
    qualified_meetings: 0,
    positive_replies: 0,
  }

  // Deals created in-window for this owner.
  try {
    const deals = await searchObjects(
      'deals',
      [
        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: ownerId },
        { propertyName: 'createdate', operator: 'GTE', value: startMs },
        { propertyName: 'createdate', operator: 'LT', value: endMs },
      ],
      ['amount', 'dealstage', 'createdate', 'hubspot_owner_id']
    )
    o.opportunities_created = deals.length
    for (const d of deals) {
      o.pipeline_created += Number(d.properties.amount) || 0
      if (d.properties.dealstage && QUALIFIED_STAGES.has(d.properties.dealstage)) {
        o.qualified_meetings += 1
      }
    }
  } catch (e) {
    console.error('[hubspot] deals search failed:', (e as Error).message)
  }

  // Meetings created in-window for this owner.
  try {
    const meetings = await searchObjects(
      'meetings',
      [
        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: ownerId },
        { propertyName: 'hs_createdate', operator: 'GTE', value: startMs },
        { propertyName: 'hs_createdate', operator: 'LT', value: endMs },
      ],
      ['hs_createdate', 'hubspot_owner_id']
    )
    o.meetings_booked = meetings.length
  } catch (e) {
    console.error('[hubspot] meetings search failed:', (e as Error).message)
  }

  // Inbound emails in-window (best-effort — needs crm.objects.emails.read scope;
  // if missing it 403s, we log and leave positive_replies at 0 rather than fail).
  try {
    const emails = await searchObjects(
      'emails',
      [
        { propertyName: 'hubspot_owner_id', operator: 'EQ', value: ownerId },
        { propertyName: 'hs_email_direction', operator: 'EQ', value: 'INCOMING_EMAIL' },
        { propertyName: 'hs_createdate', operator: 'GTE', value: startMs },
        { propertyName: 'hs_createdate', operator: 'LT', value: endMs },
      ],
      ['hs_createdate', 'hs_email_direction']
    )
    o.positive_replies = emails.length
  } catch (e) {
    console.error('[hubspot] emails search failed (scope?):', (e as Error).message)
  }

  return o
}

export interface DaySyncResult {
  date: string
  repsProcessed: number
  rowsWritten: number
  perRep: Array<{ repId: string; ownerId: string; outcome: DayOutcome }>
}

// Sync one calendar day for every rep in the org that has a hubspot_owner_id.
export async function syncOutcomesForDay(orgId: string, date: Date): Promise<DaySyncResult> {
  const supabase = await createClient()
  const { startMs, endMs, dateStr } = dayWindowMs(date)

  const { data: reps, error } = await supabase
    .from('reps')
    .select('id, hubspot_owner_id')
    .eq('organization_id', orgId)
    .not('hubspot_owner_id', 'is', null)

  const result: DaySyncResult = { date: dateStr, repsProcessed: 0, rowsWritten: 0, perRep: [] }
  if (error || !reps || reps.length === 0) return result

  for (const rep of reps) {
    const ownerId = rep.hubspot_owner_id as string
    const outcome = await outcomesForOwnerDay(ownerId, startMs, endMs)
    result.perRep.push({ repId: rep.id, ownerId, outcome })
    result.repsProcessed++

    // Manual upsert on (rep_id, outcome_date) — no reliance on a unique constraint.
    const { data: existing } = await supabase
      .from('rep_outcomes')
      .select('id')
      .eq('rep_id', rep.id)
      .eq('outcome_date', dateStr)
      .maybeSingle()

    const row = {
      organization_id: orgId,
      rep_id: rep.id,
      outcome_date: dateStr,
      meetings_booked: outcome.meetings_booked,
      qualified_meetings: outcome.qualified_meetings,
      pipeline_created: outcome.pipeline_created,
      opportunities_created: outcome.opportunities_created,
      positive_replies: outcome.positive_replies,
      updated_at: new Date().toISOString(),
    }

    if (existing?.id) {
      const { error: upErr } = await supabase.from('rep_outcomes').update(row).eq('id', existing.id)
      if (!upErr) result.rowsWritten++
    } else {
      const { error: insErr } = await supabase.from('rep_outcomes').insert(row)
      if (!insErr) result.rowsWritten++
    }
  }

  return result
}

// Sync the last N days (inclusive of today) — used to backfill the current week
// so the flagging engine has a full week to sum.
export async function syncRecentDays(orgId: string, days = 7): Promise<DaySyncResult[]> {
  const out: DaySyncResult[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - i)
    out.push(await syncOutcomesForDay(orgId, d))
  }
  return out
}
