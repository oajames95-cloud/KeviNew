import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { detectBreaches, syncCoachingItems } from "@/lib/targets/flagging"

export const dynamic = "force-dynamic"

// TEMPORARY debug endpoint. Hit /api/debug-flags in the browser to run the
// flagging engine directly and see exactly what it computes and writes — no
// swallowed errors, no mock fallback. Delete after debugging.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single()

    if (orgErr) {
      return NextResponse.json({ step: "org-lookup", error: orgErr.message }, { status: 200 })
    }
    const orgId = (org as { id?: string } | null)?.id
    if (!orgId) {
      return NextResponse.json({ step: "org-lookup", error: "no org id" }, { status: 200 })
    }

    const breaches = await detectBreaches(orgId)
    const syncResult = await syncCoachingItems(orgId)

    return NextResponse.json(
      {
        orgId,
        breachCount: breaches.length,
        breaches: breaches.map((b) => ({
          repId: b.repId,
          metric: b.metric,
          severity: b.severity,
          actual: b.status.actual,
          target: b.status.value,
          pace: b.status.pacePercent,
          paceStatus: b.status.paceStatus,
          source: b.status.source,
        })),
        syncResult,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { step: "exception", error: e?.message || String(e), stack: e?.stack },
      { status: 200 }
    )
  }
}
