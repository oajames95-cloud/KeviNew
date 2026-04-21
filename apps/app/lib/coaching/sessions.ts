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

/**
 * Save a complete coaching session with targets and actions to Supabase
 */
export async function saveCoachingSession(
  repId: string,
  organizationId: string,
  plan: SessionPlan,
  coachingItemId?: string
): Promise<SaveSessionResult> {
  const supabase = await createClient()

  try {
    // Validate objective is provided
    if (!plan.coachingObjective || !plan.coachingObjective.trim()) {
      return {
        success: false,
        error: 'Coaching objective is required',
      }
    }

    // 1. Create coaching session
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

    if (sessionError || !sessionData) {
      console.error('[v0] Error saving session:', sessionError)
      return {
        success: false,
        error: sessionError?.message || 'Failed to create session',
      }
    }

    const sessionId = sessionData.id

    // 2. Create coaching targets
    let targetInsertCount = 0
    if (plan.targets.length > 0) {
      const targetsToInsert = plan.targets.map(target => {
        const startDate = new Date()
        const endDate = new Date(startDate)

        // Calculate end date based on period
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
          current_value: 0, // Will be calculated on first refresh
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

      if (targetsError) {
        console.error('[v0] Error saving targets:', targetsError)
      } else {
        targetInsertCount = (targetsData || []).length
      }
    }

    // 3. Create coaching actions
    let actionInsertCount = 0
    if (plan.actions.length > 0) {
      const actionsToInsert = plan.actions.map(action => ({
        organization_id: organizationId,
        session_id: sessionId,
        rep_id: repId,
        description: action.text,
        owner: action.owner === 'rep' ? 'rep' : 'manager',
        due_date: action.dueDate ? new Date(action.dueDate).toISOString().split('T')[0] : null,
        status: 'open',
      }))

      const { error: actionsError, data: actionsData } = await supabase
        .from('coaching_actions')
        .insert(actionsToInsert)
        .select()

      if (actionsError) {
        console.error('[v0] Error saving actions:', actionsError)
      } else {
        actionInsertCount = (actionsData || []).length
      }
    }

    // 4. Update coaching_items status if linked
    if (coachingItemId) {
      await supabase
        .from('coaching_items')
        .update({
          status: 'coached',
          updated_at: new Date().toISOString(),
        })
        .eq('id', coachingItemId)
    }

    return {
      success: true,
      sessionId,
      targetsCount: targetInsertCount,
      actionsCount: actionInsertCount,
    }
  } catch (error) {
    console.error('[v0] Unexpected error saving session:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
