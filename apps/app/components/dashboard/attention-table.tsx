"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { TrendBadge } from "@/components/shared/trend-badge"
import { ScoreBadge } from "@/components/shared/score-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Rep } from "@/types"

interface AttentionTableProps {
  reps: Rep[]
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
}

export function AttentionTable({ reps }: AttentionTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Reps Needing Attention</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Sorted by drift severity
          </p>
        </div>
        <Link
          href="/reps"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rep
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Trend
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rep Sim
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Drift
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Prospect
              </th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Follow-up
              </th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {reps.map((rep) => (
              <tr
                key={rep.id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                        {initials(rep.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{rep.name}</p>
                      <p className="text-[10px] text-muted-foreground">{rep.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <TrendBadge trend={rep.trend} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={rep.scores.topRepSimilarity} size="sm" />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={rep.scores.workflowDrift} size="sm" isDrift={true} />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={rep.scores.prospectingFocusTime} size="sm" />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <ScoreBadge score={rep.scores.followUpDiscipline} size="sm" />
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/reps/${rep.id}`}
                    className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors ml-auto"
                    aria-label={`View ${rep.name}`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
