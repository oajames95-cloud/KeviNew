"use client"

import { Mail, Calendar, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { TrendBadge } from "@/components/shared/trend-badge"
import type { Rep } from "@/types"

interface RepHeaderCardProps {
  rep: Rep
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

export function RepHeaderCard({ rep }: RepHeaderCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Rep Info */}
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
              {initials(rep.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground">{rep.name}</h3>
              <TrendBadge trend={rep.trend} />
            </div>
            <p className="text-sm text-muted-foreground">{rep.role}</p>
            <p className="text-xs text-muted-foreground mt-1">{rep.email}</p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex flex-col gap-2 md:justify-start">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs gap-1.5">
              <Mail className="w-4 h-4" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs gap-1.5">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="w-full h-9 text-xs gap-1.5">
            <Briefcase className="w-4 h-4" />
            View Profile
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div>
          <p className="text-2xl font-bold text-foreground">{rep.scores.topRepSimilarity}</p>
          <p className="text-xs text-muted-foreground mt-1">Rep Similarity</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-warning">{rep.scores.workflowDrift}</p>
          <p className="text-xs text-muted-foreground mt-1">Workflow Drift</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{rep.scores.signalConfidence}</p>
          <p className="text-xs text-muted-foreground mt-1">Data Coverage</p>
        </div>
      </div>
    </div>
  )
}
