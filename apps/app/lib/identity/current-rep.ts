// ============================================================
// lib/identity/current-rep.ts
// THE KEYSTONE. Resolves the logged-in Supabase Auth user to a Kevi rep by email.
// Every page calls getCurrentRep() instead of "first organization" so data is
// scoped to who is actually signed in.
//
// Model (per product decisions):
//   - manager logs in -> sees the whole org's reps
//   - rep logs in     -> sees only themselves
//   - email is the universal key: login email = reps.email = CRM owner email
// ============================================================

import { createClient } from '@/lib/supabase/server'

export type Role = 'manager' | 'rep'

export interface CurrentRep {
  authUserId: string
  email: string
  repId: string
  organizationId: string
  role: Role
  fullName: string
  hubspotOwnerId: string | null
}

// Returns the resolved rep for the signed-in user, or null if:
//   - nobody is signed in, or
//   - the signed-in email has no matching rep row (not yet onboarded).
// Pages use null to redirect to login or show an "ask your manager to add you"
// state — never to silently fall back to a default org.
export async function getCurrentRep(): Promise<CurrentRep | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null

  const email = user.email.toLowerCase()

  const { data: rep, error } = await supabase
    .from('reps')
    .select('id, organization_id, role, full_name, email, hubspot_owner_id')
    .ilike('email', email)
    .maybeSingle()

  if (error || !rep) return null

  return {
    authUserId: user.id,
    email: user.email,
    repId: rep.id,
    organizationId: rep.organization_id,
    role: (rep.role as Role) ?? 'rep',
    fullName: rep.full_name,
    hubspotOwnerId: rep.hubspot_owner_id ?? null,
  }
}

// Convenience: the set of rep ids this user is allowed to see.
//   manager -> all reps in their org
//   rep     -> just themselves
// Pages filter queries with this instead of hardcoding org or showing everyone.
export async function getVisibleRepIds(current: CurrentRep): Promise<string[]> {
  if (current.role !== 'manager') return [current.repId]

  const supabase = await createClient()
  const { data } = await supabase
    .from('reps')
    .select('id')
    .eq('organization_id', current.organizationId)
  return (data ?? []).map((r: { id: string }) => r.id)
}
