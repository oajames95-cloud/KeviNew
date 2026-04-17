"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { mockManager } from "@/lib/mock-data"
import type { CoachingNote } from "@/types"

const SAMPLE_NOTES: CoachingNote[] = [
  {
    id: "n_sample_01",
    authorId: "m_01",
    authorName: "Jordan Rivera",
    content: "Great call today — discussed the importance of consistent morning blocks for outreach. Rep agreed to try the 9–11am structure this week.",
    createdAt: "2025-01-06T14:30:00Z",
  },
  {
    id: "n_sample_02",
    authorId: "m_01",
    authorName: "Jordan Rivera",
    content: "Follow-up review: sequence timing improved. Still seeing some drop-off on Day 4 of the cadence — will revisit next week.",
    createdAt: "2025-01-08T10:00:00Z",
  },
]

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

export function CoachingNotes() {
  const [notes, setNotes] = useState<CoachingNote[]>(SAMPLE_NOTES)
  const [draft, setDraft] = useState("")

  function handleSubmit() {
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
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Coaching Notes</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manager notes and coaching history — visible to managers only
        </p>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-border/50">
        {notes.map((note) => (
          <div key={note.id} className="px-5 py-3.5 flex gap-3">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                {initials(note.authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-foreground">{note.authorName}</span>
                <span className="text-[10px] text-muted-foreground">{formatTs(note.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{note.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add note */}
      <div className="px-5 py-4 border-t border-border flex gap-3">
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
            {initials(mockManager.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a coaching note..."
            className="text-xs resize-none h-16 bg-muted border-transparent focus-visible:border-border focus-visible:ring-0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Press Cmd+Enter to save
            </span>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleSubmit}
              disabled={!draft.trim()}
            >
              <Send className="w-3 h-3" />
              Add note
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
