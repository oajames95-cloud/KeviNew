"use client"

import Link from "next/link"
import { ChevronLeft, Plus } from "lucide-react"
import { useState } from "react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { TrendBadge } from "@/components/shared/trend-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { RepHeaderCard } from "./coaching-hub-header"
import { CoachingItemsList } from "./coaching-items-list"
import { RecentSessionsList } from "./recent-sessions-list"
import { CoachingSessionPanel } from "./coaching-session-panel"
import { mockTeams } from "@/lib/mock-data"
import type { Rep } from "@/types"

interface CoachingHubProps {
  rep: Rep
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
}

function teamName(teamId: string) {
  return mockTeams.find((t) => t.id === teamId)?.name ?? "—"
}

export function CoachingHub({ rep }: CoachingHubProps) {
  const { toggle } = useMobileSidebar()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)

  const handleNewSession = () => {
    setSelectedSession(null)
    setIsPanelOpen(true)
  }

  const handleEditSession = (session: any) => {
    setSelectedSession(session)
    setIsPanelOpen(true)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={`${rep.name} · Coaching Hub`}
        subtitle="Manage coaching priorities and track 1:1 sessions"
        onMenuClick={toggle}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Link
          href="/reps"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Reps
        </Link>

        {/* Rep Header */}
        <RepHeaderCard rep={rep} />

        {/* Main Grid: Coaching Items + Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Coaching Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Coaching Items</h2>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">3 active</span>
            </div>
            <CoachingItemsList rep={rep} />
          </div>

          {/* Right: Recent Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
              <Button
                size="sm"
                onClick={handleNewSession}
                className="h-8 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </Button>
            </div>
            <RecentSessionsList onEditSession={handleEditSession} />
          </div>
        </div>

        {/* Coaching Session Panel */}
        {isPanelOpen && (
          <CoachingSessionPanel
            rep={rep}
            session={selectedSession}
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        )}
      </main>
    </div>
  )
}
