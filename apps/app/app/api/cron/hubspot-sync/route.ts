import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncRecentDays } from "@/lib/hubspot/sync"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Scheduled daily by vercel.json. Vercel sends `Authorization: Bearer <CRON_SECRET>`
// on each invocation; we reject anything without the matching secret so the
// endpoint can't be hit by randoms. Set CRON_SECRET in Vercel env vars.
export async function GET(request: Request) {
  const auth = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.HUBSPOT_TOKEN) {
    return NextResponse.json({ error: "HUBSPOT_TOKEN not set" }, { status: 500 })
  }

  try {
    const supabase = await createClient()
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single()
    if (orgErr || !org) {
      return NextResponse.json({ error: orgErr?.message || "no org" }, { status: 500 })
    }

    // Sync the last 2 days each run — covers today plus late-arriving updates to
    // yesterday, without re-pulling the whole week every day.
    const results = await syncRecentDays((org as { id: string }).id, 2)
    const rowsWritten = results.reduce((n, r) => n + r.rowsWritten, 0)

    return NextResponse.json({ ok: true, rowsWritten, days: results.map((r) => r.date) })
  } catch (e: any) {
    console.error("[cron/hubspot-sync] error:", e)
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
