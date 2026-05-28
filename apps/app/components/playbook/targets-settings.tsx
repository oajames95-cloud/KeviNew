"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { METRIC_TYPES, METRIC_META } from "@/lib/targets/types"
import type { MetricType, TargetPeriod } from "@/lib/targets/types"
import type { PlaybookTargets, PlaybookTargetInput } from "@/lib/targets/playbook-actions"
import { savePlaybookTargets } from "@/lib/targets/playbook-actions"

interface Row {
  value: string
  period: TargetPeriod
}

const DEFAULT_PERIOD: Record<MetricType, TargetPeriod> = {
  meetings_booked: "weekly",
  pipeline_created: "weekly",
  prospecting_minutes: "daily",
  positive_replies: "weekly",
  sqls_booked: "weekly",
}

function suffix(metric: MetricType): string {
  const u = METRIC_META[metric].unit
  return u === "minutes" ? "min" : u === "percent" ? "%" : ""
}
function isCurrency(metric: MetricType): boolean {
  return METRIC_META[metric].unit === "currency"
}

export function TargetsSettings({
  orgId,
  initial,
}: {
  orgId: string
  initial: PlaybookTargets
}) {
  const [rows, setRows] = useState<Record<MetricType, Row>>(() => {
    const r = {} as Record<MetricType, Row>
    for (const m of METRIC_TYPES) {
      r[m] = {
        value: initial[m] ? String(initial[m]!.value) : "",
        period: initial[m]?.period ?? DEFAULT_PERIOD[m],
      }
    }
    return r
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  const update = (m: MetricType, patch: Partial<Row>) => {
    setRows((prev) => ({ ...prev, [m]: { ...prev[m], ...patch } }))
    setStatus(null)
  }

  const onSave = async () => {
    const payload: PlaybookTargetInput[] = METRIC_TYPES.filter(
      (m) => rows[m].value !== "" && !Number.isNaN(Number(rows[m].value))
    ).map((m) => ({ metric: m, value: Number(rows[m].value), period: rows[m].period }))

    setSaving(true)
    try {
      const res = await savePlaybookTargets(orgId, payload)
      setStatus(
        res.success
          ? { ok: true, msg: "Targets saved" }
          : { ok: false, msg: res.error || "Save failed" }
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-1 text-base font-semibold text-foreground">Performance Targets</div>
      <p className="mb-6 text-sm text-muted-foreground">
        The default goals every rep is measured against. A coaching session can override any of
        these for an individual rep.
      </p>

      <div className="space-y-4">
        {METRIC_TYPES.map((m) => (
          <div
            key={m}
            className="flex items-center justify-between gap-4 border-b border-border/60 pb-4 last:border-0 last:pb-0"
          >
            <Label className="text-sm font-medium text-foreground">{METRIC_META[m].label}</Label>
            <div className="flex items-center gap-2">
              {isCurrency(m) && <span className="text-sm text-muted-foreground">£</span>}
              <Input
                type="number"
                value={rows[m].value}
                onChange={(e) => update(m, { value: e.target.value })}
                placeholder="—"
                className="w-24"
              />
              {suffix(m) && <span className="text-sm text-muted-foreground">{suffix(m)}</span>}
              <Select
                value={rows[m].period}
                onValueChange={(v) => update(m, { period: v as TargetPeriod })}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">daily</SelectItem>
                  <SelectItem value="weekly">weekly</SelectItem>
                  <SelectItem value="monthly">monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button size="sm" onClick={onSave} disabled={saving || !orgId}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save targets"}
        </Button>
        {!orgId && (
          <span className="text-sm text-amber-600">No organization found — cannot save.</span>
        )}
        {status && (
          <span className={status.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  )
}
