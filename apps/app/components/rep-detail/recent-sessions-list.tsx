"use client"

import { format } from "date-fns"
import { MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecentSessionsListProps {
  onEditSession: (session: any) => void
}

const mockSessions = [
  {
    id: "s1",
    date: new Date(2025, 0, 15),
    title: "Call Connect Rate Coaching",
    notes: "Discussed active listening techniques and rapport building. Will practice with mock calls.",
    actionItems: 2,
  },
  {
    id: "s2",
    date: new Date(2025, 0, 8),
    title: "Discovery Questions Review",
    notes: "Reviewed discovery questions structure. Rep will update template before next week.",
    actionItems: 1,
  },
  {
    id: "s3",
    date: new Date(2024, 11, 29),
    title: "Pipeline Conversion Discussion",
    notes: "Analyzed lost deals. Pattern shows qualification issues in discovery phase.",
    actionItems: 0,
  },
]

export function RecentSessionsList({ onEditSession }: RecentSessionsListProps) {
  return (
    <div className="space-y-2">
      {mockSessions.map((session) => (
        <div
          key={session.id}
          className="rounded-lg border border-border bg-card p-3.5 hover:border-border-light hover:shadow-sm transition-all group cursor-pointer"
          onClick={() => onEditSession(session)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {session.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(session.date, "MMM d, yyyy")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {session.notes}
          </p>

          {session.actionItems > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              <MessageSquare className="w-2.5 h-2.5" />
              {session.actionItems} action{session.actionItems > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}
