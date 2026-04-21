'use server'

import { createClient } from "@/lib/supabase/server"
import type { RepTarget } from "@/types"

export type TargetMetricType = 'meetings_booked' | 'pipeline_created' | 'sqls_booked' | 'prospecting_minutes' | 'reply_rate'

/**
 * Calculate current progress for a target based on real metrics
 */
export async function calculateCurrentValue(
  target: RepTarget,
  repId: string
): Promise<number> {
  const supabase = await createClient()

  try {
    const startDate = new Date(target.startDate)
    const endDate = new Date(target.endDate)

    const { data: outcomes } = await supabase
      .from('rep_outcomes')
      .select('*')
      .eq('rep_id', repId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    const { data: dailyMetrics } = await supabase
      .from('rep_daily_metrics')
      .select('*')
      .eq('rep_id', repId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    let currentValue = 0

    switch (target.metric) {
      case 'meetings_booked':
        currentValue = (outcomes || []).reduce((sum: number, o: any) => sum + (o.meetings_booked || 0), 0)
        break
      case 'pipeline_created':
        currentValue = (outcomes || []).reduce((sum: number, o: any) => sum + (o.pipeline_created || 0), 0)
        break
      case 'sqls_booked':
        currentValue = (outcomes || []).reduce((sum: number, o: any) => sum + (o.qualified_meetings || 0), 0)
        break
      case 'prospecting_minutes':
        const totalMinutes = (dailyMetrics || []).reduce((sum: number, m: any) => sum + (m.prospecting_minutes || 0), 0)
        currentValue = Math.round(totalMinutes / Math.max(1, (dailyMetrics || []).length))
        break
      case 'reply_rate':
        if (outcomes && outcomes.length > 0) {
          const avgReplyRate = (outcomes || []).reduce((sum: number, o: any) => sum + (o.follow_up_rate || 0), 0) / outcomes.length
          currentValue = Math.round(avgReplyRate * 100)
        }
        break
    }

    return currentValue
  } catch (error) {
    console.error('[v0] Error calculating target progress:', error)
    return 0
  }
}

/**
 * Calculate pacing status for a target
 */
export function calculatePaceStatus(
  currentValue: number,
  targetValue: number,
  startDate: string,
  endDate: string
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
  const percentOfTarget = currentValue / Math.max(1, expectedValue)

  if (percentOfTarget >= 0.9) return 'on_track'
  if (percentOfTarget >= 0.7) return 'at_risk'
  return 'behind'
}

/**
 * Format metric name for display
 */
export function formatMetricName(metric: TargetMetricType): string {
  const names: Record<TargetMetricType, string> = {
    meetings_booked: 'Meetings booked',
    pipeline_created: 'Pipeline created',
    sqls_booked: 'SQLs booked',
    prospecting_minutes: 'Prospecting time',
    reply_rate: 'Reply rate',
  }
  return names[metric] || metric
}
