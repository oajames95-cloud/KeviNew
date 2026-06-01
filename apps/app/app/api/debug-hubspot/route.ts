import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { syncRecentDays } from "@/lib/hubspot/sync"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// TEMPORARY debug endpoint. Hit /api/debug-hubspot in the browser to run the
// HubSpot sync for the last 7 days and see exactly what it pulled and wrote.
// No swallowed errors. Delete (and replace with a cron) once verified.
export async function GET() {
  try {
    if (!process.env.HUBSPOT_TOKEN) {
      return NextResponse.json({ error: "HUBSPOT_TOKEN env var not set" }, { status: 200 })
    }

    const supabase = await createClient()
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single()
    if (orgErr || !org) {
      return NextResponse.json({ step: "org-lookup", error: orgErr?.message || "no org" }, { status: 200 })
    }
    const orgId = (org as { id: string }).id

    const results = await syncRecentDays(orgId, 7)
    const totals = results.reduce(
      (acc, r) => {
        acc.rowsWritten += r.rowsWritten
        acc.repsProcessed = Math.max(acc.repsProcessed, r.repsProcessed)
        return acc
      },
      { rowsWritten: 0, repsProcessed: 0 }
    )

    return NextResponse.json({ orgId, totals, days: results }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ step: "exception", error: e?.message, stack: e?.stack }, { status: 200 })
  }
}
