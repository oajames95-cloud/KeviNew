"use client"

import { CalendarDays, ChevronRight, CheckCircle2 } from "lucide-react"

interface RecentSessionsListProps {
  onEditSession: (session: any) => void
}

const mockSessions = [
  {
    id: "s1",
    date: "2025-01-15",
    title: "Follow-up Discipline",
    notes: "Discussed sequencer setup. Found email templates weren't loading correctly. Set up workaround.",
    actionItems: [
      { text: "Fix email template sync", completed: true },
      { text: "Review call recordings", completed: false },
    ],
  },
  {
    id: "s2",
    date: "2025-01-08",
    title: "Weekly Check-in",
    notes: "Good progress on focus blocks. Morning routine is working well.",
    actionItems: [
      { text: "Set up DND during focus time", completed: true },
    ],
  },
  {
    id: "s3",
    date: "2024-12-18",
    title: "Q4 Review",
    notes: "Celebrated hitting 85% of target. Discussed Q1 goals.",
    actionItems: [],
  },
]

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function RecentSessionsList({ onEditSession }: RecentSessionsListProps) {
  if (mockSessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">No sessions yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Start your first coaching session to track progress.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {mockSessions.map((session) => {
        const completedCount = session.actionItems.filter((a) => a.completed).length
        const totalCount = session.actionItems.length

        return (
          <button
            key={session.id}
            onClick={() => onEditSession(session)}
            className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all text-left w-full"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted shrink-0">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {session.title}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatRelativeDate(session.date)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                {session.notes}
              </p>
              {totalCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3" />
                  {completedCount}/{totalCount} completed
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )
      })}
    </div>
  )
}
