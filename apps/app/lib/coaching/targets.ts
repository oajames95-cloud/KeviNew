'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type TargetMetricType = 'meetings_booked' | 'pipeline_created' | 'prospecting_minutes' | 'reply_rate' | 'sqls_booked'

/**
 * Calculate current value for a coaching target based on actual metrics data
 */
export async function calculateTargetProgress(
  repId: string,
  metricType: TargetMetricType,
  startDate: string,
  endDate: string
): Promise<number> {
  const supabase = await createClient()

  try {
    switch (metricType) {
      case 'meetings_booked': {
        const { data, error } = await supabase
          .from('rep_outcomes')
          .select('meetings_booked')
          .eq('rep_id', repId)
          .gte('date', startDate)
          .lte('date', endDate)

        if (error) throw error
        return (data || []).reduce((sum, row) => sum + (row.meetings_booked || 0), 0)
      }

      case 'pipeline_created': {
        const { data, error } = await supabase
          .from('rep_outcomes')
          .select('pipeline_created')
          .eq('rep_id', repId)
          .gte('date', startDate)
          .lte('date', endDate)

        if (error) throw error
        return (data || []).reduce((sum, row) => sum + (row.pipeline_created || 0), 0)
      }

      case 'prospecting_minutes': {
        const { data, error } = await supabase
          .from('rep_daily_metrics')
          .select('time_prospecting')
          .eq('rep_id', repId)
          .gte('date', startDate)
          .lte('date', endDate)

        if (error) throw error
        const days = (data || []).length
        if (days === 0) return 0
        const total = (data || []).reduce((sum, row) => sum + (row.time_prospecting || 0), 0)
        return Math.round(total / days) // Return average
      }

      case 'reply_rate': {
        const { data, error } = await supabase
          .from('rep_outcomes')
          .select('follow_up_rate')
          .eq('rep_id', repId)
          .gte('date', startDate)
          .lte('date', endDate)

        if (error) throw error
        if ((data || []).length === 0) return 0
        const avg = (data || []).reduce((sum, row) => sum + (row.follow_up_rate || 0), 0) / (data || []).length
        return Math.round(avg * 100) // Convert to percentage
      }

      case 'sqls_booked': {
        const { data, error } = await supabase
          .from('rep_outcomes')
          .select('qualified_meetings')
          .eq('rep_id', repId)
          .gte('date', startDate)
          .lte('date', endDate)

        if (error) throw error
        return (data || []).reduce((sum, row) => sum + (row.qualified_meetings || 0), 0)
      }

      default:
        return 0
    }
  } catch (error) {
    console.error('[v0] Error calculating target progress:', error)
    return 0
  }
}

/**
 * Update coaching_targets with current progress values
 */
export async function refreshTargetProgress(targetIds: string[]): Promise<void> {
  const supabase = await createClient()

  try {
    // Fetch all targets
    const { data: targets, error: fetchError } = await supabase
      .from('coaching_targets')
      .select('*')
      .in('id', targetIds)

    if (fetchError) throw fetchError

    // Calculate and update each target
    for (const target of targets || []) {
      const currentValue = await calculateTargetProgress(
        target.rep_id,
        target.metric_type as TargetMetricType,
        target.start_date,
        target.end_date
      )

      await supabase
        .from('coaching_targets')
        .update({ current_value: currentValue })
        .eq('id', target.id)
    }
  } catch (error) {
    console.error('[v0] Error refreshing target progress:', error)
  }
}

/**
 * Get pace status for a target based on elapsed time and progress
 */
export function calculatePaceStatus(
  currentValue: number,
  targetValue: number,
  startDate: string,
  endDate: string,
  period: 'daily' | 'weekly' | 'monthly'
): 'on_track' | 'at_risk' | 'behind' {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const percentElapsed = Math.max(0, Math.min(1, elapsedMs / totalMs))

  // Don't alert if less than 20% of period has elapsed
  if (percentElapsed < 0.2) return 'on_track'

  const expectedValue = targetValue * percentElapsed
  const percentOfTarget = currentValue / expectedValue

  if (percentOfTarget >= 0.9) return 'on_track'
  if (percentOfTarget >= 0.7) return 'at_risk'
  return 'behind'
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

  const name = names[metricType] || metricType
  return period ? `${name} ${period}` : name
}
