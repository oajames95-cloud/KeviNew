import { createClient } from "@/lib/supabase/server"

/**
 * Fetch all reps for a team with their recent daily metrics and outcomes
 */
export async function getTeamReps(teamId: string) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
  const supabase = await createClient()

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
 * Fetch all accounts for an org with their 7-day touches grouped by account_id
 */
export async function getAccountsWithTouches(organizationId: string) {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: accounts }, { data: touches }] = await Promise.all([
    supabase
      .from("accounts")
      .select(
        "id, organization_id, name, domain, industry, employee_count, source, external_id, assigned_rep_id, status, heat_score, progress_score, first_touched_at, last_touched_at, last_response_at, stage_entered_at, created_at, updated_at"
      )
      .eq("organization_id", organizationId)
      .order("heat_score", { ascending: false }),
    supabase
      .from("account_touches")
      .select("account_id, channel, direction, touched_at")
      .eq("organization_id", organizationId)
      .gte("touched_at", sevenDaysAgo)
      .order("touched_at", { ascending: false }),
  ])

  const touchesByAccount: Record<string, { channel: string; direction: string; touched_at: string }[]> = {}
  for (const t of touches ?? []) {
    if (!touchesByAccount[t.account_id]) touchesByAccount[t.account_id] = []
    touchesByAccount[t.account_id].push({
      channel: t.channel,
      direction: t.direction,
      touched_at: t.touched_at,
    })
  }

  return { accounts: accounts ?? [], touchesByAccount }
}

/**
 * Fetch accounts assigned to a specific rep with their 7-day touches
 */
export async function getRepAccounts(repId: string) {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: accounts } = await supabase
    .from("accounts")
    .select(
      "id, name, domain, industry, status, heat_score, progress_score, last_touched_at, assigned_rep_id"
    )
    .eq("assigned_rep_id", repId)
    .order("heat_score", { ascending: false })

  const accountIds = (accounts ?? []).map((a: any) => a.id)
  const touchesByAccount: Record<string, { channel: string; direction: string; touched_at: string }[]> = {}

  if (accountIds.length > 0) {
    const { data: touches } = await supabase
      .from("account_touches")
      .select("account_id, channel, direction, touched_at")
      .in("account_id", accountIds)
      .gte("touched_at", sevenDaysAgo)
      .order("touched_at", { ascending: false })

    for (const t of touches ?? []) {
      if (!touchesByAccount[t.account_id]) touchesByAccount[t.account_id] = []
      touchesByAccount[t.account_id].push({
        channel: t.channel,
        direction: t.direction,
        touched_at: t.touched_at,
      })
    }
  }

  return { accounts: accounts ?? [], touchesByAccount }
}

/**
 * Fetch coaching items for dashboard queue
 */
export async function getCoachingQueue(teamId: string, limit = 10) {
  const supabase = await createClient()

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
