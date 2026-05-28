'use server'

import { createClient } from '@/lib/supabase/server'
import type { SessionPlan, SessionTarget, SessionAction } from '@/components/rep-detail/coaching-workflow'

export interface SaveSessionResult {
  success: boolean
  sessionId?: string
  error?: string
  targetsCount?: number
  actionsCount?: number
}

export async function saveCoachingSession(
  repId: string,
  organizationId: string,
  plan: SessionPlan,
  coachingItemId?: string
): Promise<SaveSessionResult> {
  console.log('[COACHING] saveCoachingSession called with repId:', repId, 'orgId:', organizationId, 'plan:', JSON.stringify(plan))

  const supabase = await createClient()

  try {
    if (!plan.coachingObjective || !plan.coachingObjective.trim()) {
      return { success: false, error: 'Coaching objective is required' }
    }

    // 1. Insert coaching session
    const { data: sessionData, error: sessionError } = await supabase
      .from('coaching_sessions')
      .insert({
        organization_id: organizationId,
        rep_id: repId,
        coaching_item_id: coachingItemId || null,
        objective: plan.coachingObjective,
        notes: plan.notes || '',
        commitments: plan.actions.map(a => a.text).join('\n'),
        follow_up_date: plan.followUpDate ? new Date(plan.followUpDate).toISOString() : null,
        session_type: plan.sessionType === 'ad-hoc' ? 'ad_hoc' : plan.sessionType,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    console.log('[COACHING] Session insert result - data:', sessionData, 'error:', sessionError)

    if (sessionError || !sessionData) {
      return {
        success: false,
        error: sessionError?.message || 'Failed to create session',
      }
    }

    const sessionId = sessionData.id

    // 2. Insert coaching targets
    let targetInsertCount = 0
    if (plan.targets.length > 0) {
      const targetsToInsert = plan.targets.map(target => {
        const startDate = new Date()
        const endDate = new Date(startDate)

        switch (target.timeFrame) {
          case 'daily':
            endDate.setDate(endDate.getDate() + 1)
            break
          case 'weekly':
            endDate.setDate(endDate.getDate() + 7)
            break
          case 'monthly':
            endDate.setMonth(endDate.getMonth() + 1)
            break
        }

        return {
          organization_id: organizationId,
          rep_id: repId,
          session_id: sessionId,
          metric_type: target.metric,
          target_value: target.targetValue,
          current_value: 0,
          target_period: target.timeFrame,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
        }
      })

      const { error: targetsError, data: targetsData } = await supabase
        .from('coaching_targets')
        .insert(targetsToInsert)
        .select()

      console.log('[COACHING] Targets insert result - data:', targetsData, 'error:', targetsError)

      if (!targetsError) {
        targetInsertCount = (targetsData || []).length
      }
    }

    // 3. Insert coaching actions — only columns that exist: session_id, rep_id, description, due_date, completed
    let actionInsertCount = 0
    if (plan.actions.length > 0) {
      const actionsToInsert = plan.actions.map(action => ({
        session_id: sessionId,
        rep_id: repId,
        description: action.text,
        due_date: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : null,
        completed: false,
      }))

      const { error: actionsError, data: actionsData } = await supabase
        .from('coaching_actions')
        .insert(actionsToInsert)
        .select()

      console.log('[COACHING] Actions insert result - data:', actionsData, 'error:', actionsError)

      if (!actionsError) {
        actionInsertCount = (actionsData || []).length
      }
    }

    // 4. Update coaching_items status if linked
    if (coachingItemId) {
      await supabase
        .from('coaching_items')
        .update({ status: 'coached', updated_at: new Date().toISOString() })
        .eq('id', coachingItemId)
    }

    console.log('[COACHING] Save complete - sessionId:', sessionId, 'targets:', targetInsertCount, 'actions:', actionInsertCount)

    return {
      success: true,
      sessionId,
      targetsCount: targetInsertCount,
      actionsCount: actionInsertCount,
    }
  } catch (error) {
    console.error('[COACHING] Unexpected error saving session:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
