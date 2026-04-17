"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Send, ExternalLink } from "lucide-react"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockManager } from "@/lib/mock-data"
import type { CoachingInsight, CoachingNote, CoachingStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { label: string; value: CoachingStatus }[] = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Coached", value: "coached" },
  { label: "Watchlist", value: "watchlist" },
]

const statusClass: Record<CoachingStatus, string> = {
  new: "border-primary text-primary",
  reviewing: "border-warning text-warning",
  coached: "border-success text-success",
  watchlist: "border-muted-foreground text-muted-foreground",
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
}

function formatTs(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface CoachingDrawerProps {
  insight: CoachingInsight
  onClose: () => void
  onStatusChange: (id: string, status: CoachingStatus) => void
}

export function CoachingDrawer({ insight, onClose, onStatusChange }: CoachingDrawerProps) {
  const [notes, setNotes] = useState<CoachingNote[]>(insight.notes ?? [])
  const [draft, setDraft] = useState("")

  function handleAddNote() {
    if (!draft.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        id: `n_${Date.now()}`,
        authorId: mockManager.id,
        authorName: mockManager.name,
        content: draft.trim(),
        createdAt: new Date().toISOString(),
      },
    ])
    setDraft("")
  }

  return (
    <aside className="w-80 xl:w-96 flex flex-col border-l border-border bg-card overflow-hidden shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
              {initials(insight.repName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{insight.repName}</p>
            <p className="text-[10px] text-muted-foreground">{insight.teamName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Overview */}
        <div className="px-5 py-4 space-y-3 border-b border-border">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge severity={insight.severity} />
            <span className="text-[11px] font-medium text-muted-foreground capitalize px-2 py-0.5 rounded bg-muted">
              {insight.theme}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insight.reason}</p>

          {/* Metrics */}
          {insight.metrics && Object.keys(insight.metrics).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(insight.metrics).map(([key, val]) => {
                const labels: Record<string, string> = {
                  topRepSimilarity: "Rep Similarity",
                  workflowDrift: "Workflow Drift",
                  prospectingFocusTime: "Prospecting Focus",
                  followUpDiscipline: "Follow-up",
                  prepQuality: "Pre-call Prep",
                  signalConfidence: "Data Coverage",
                }
                return (
                  <div key={key} className="rounded bg-muted px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">{labels[key] ?? key}</p>
                    <p className="text-sm font-mono font-bold text-foreground">{val}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recommended action */}
        <div className="px-5 py-4 border-b border-border space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recommended action
          </p>
          <p className="text-xs text-foreground leading-relaxed">{insight.recommendedAction}</p>
        </div>

        {/* Status */}
        <div className="px-5 py-4 border-b border-border space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(insight.id, opt.value)}
                className={cn(
                  "px-2 py-1.5 rounded text-xs font-medium border transition-colors",
                  insight.status === opt.value
                    ? statusClass[opt.value] + " bg-muted"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Notes
          </p>
          {notes.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No notes yet</p>
          )}
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-2">
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                    {initials(note.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-foreground">{note.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTs(note.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add note */}
          <div className="space-y-2 pt-2">
            <Textarea
              placeholder="Add a note..."
              className="text-xs resize-none h-14 bg-muted border-transparent focus-visible:border-border focus-visible:ring-0"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddNote()
              }}
            />
            <Button
              size="sm"
              className="w-full h-7 text-xs gap-1.5"
              onClick={handleAddNote}
              disabled={!draft.trim()}
            >
              <Send className="w-3 h-3" />
              Save note
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border shrink-0">
        <Link
          href={`/reps/${insight.repId}`}
          className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline"
        >
          Open rep profile <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  )
}
