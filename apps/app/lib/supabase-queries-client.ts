import { createClient } from "@/lib/supabase/client"

/**
 * Client-side Supabase queries for use in client components
 */

/**
 * Fetch all reps for a team with their recent daily metrics and outcomes
 */
export async function getTeamReps(teamId: string) {
  const supabase = createClient()

  const { data: reps, error } = await supabase
    .from("reps")
    .select(
      `
      id,
      team_id,
      name,
      email,
      avatar_url,
      role,
      hire_date,
      trend,
      score_top_rep_similarity,
      score_follow_up_discipline,
      score_prospecting_focus_time,
      score_prep_quality,
      rep_daily_metrics(
        date,
        calls_dialed,
        meetings_booked,
        time_prospecting,
        time_researching,
        time_in_apollo,
        time_in_crm,
        time_in_email,
        context_switches,
        focus_blocks_min
      ),
      rep_outcomes(
        date,
        calls_dialed,
        meetings_booked,
        connect_rate,
        follow_up_rate
      )
    `
    )
    .eq("team_id", teamId)
    .order("id")

  if (error) {
    console.error("[v0] Error fetching team reps:", error)
    throw error
  }

  return reps || []
}

/**
 * Fetch a single rep with full details
 */
export async function getRepDetail(repId: string) {
  const supabase = createClient()

  const { data: rep, error } = await supabase
    .from("reps")
    .select(
      `
      id,
      team_id,
      name,
      email,
      avatar_url,
      role,
      hire_date,
      trend,
      score_top_rep_similarity,
      score_follow_up_discipline,
      score_prospecting_focus_time,
      score_prep_quality,
      rep_daily_metrics(
        date,
        calls_dialed,
        meetings_booked,
        time_prospecting,
        time_researching,
        time_in_apollo,
        time_in_crm,
        time_in_email,
        context_switches,
        focus_blocks_min
      ),
      rep_outcomes(
        date,
        calls_dialed,
        meetings_booked,
        connect_rate,
        follow_up_rate
      ),
      coaching_items(
        id,
        theme,
        reason,
        recommended_action,
        severity,
        status,
        flagged_at
      )
    `
    )
    .eq("id", repId)
    .single()

  if (error) {
    console.error("[v0] Error fetching rep detail:", error)
    throw error
  }

  return rep
}

/**
 * Fetch team outcomes summary for dashboard
 */
export async function getTeamOutcomesSummary(teamId: string) {
  const supabase = createClient()

  const { data: summary, error } = await supabase
    .from("reps")
    .select(
      `
      id,
      name,
      rep_daily_metrics(
        time_prospecting,
        meetings_booked
      ),
      rep_outcomes(
        meetings_booked,
        connect_rate,
        follow_up_rate
      )
    `
    )
    .eq("team_id", teamId)

  if (error) {
    console.error("[v0] Error fetching team outcomes:", error)
    throw error
  }

  return summary || []
}

/**
 * Fetch coaching items for dashboard queue
 */
export async function getCoachingQueue(teamId: string, limit = 10) {
  const supabase = createClient()

  // First get all reps on the team
  const { data: teamReps } = await supabase
    .from("reps")
    .select("id")
    .eq("team_id", teamId)

  const repIds = teamReps?.map(r => r.id) || []

  // Then get coaching items for those reps
  const { data: items, error } = await supabase
    .from("coaching_items")
    .select(
      `
      id,
      rep:reps(id, name),
      theme,
      reason,
      severity,
      status,
      flagged_at
    `
    )
    .in("rep_id", repIds)
    .eq("status", "new")
    .order("severity", { ascending: false })
    .order("flagged_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching coaching queue:", error)
    throw error
  }

  return items || []
}
