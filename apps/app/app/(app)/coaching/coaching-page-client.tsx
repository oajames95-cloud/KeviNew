"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Clock, AlertCircle, ChevronRight, Calendar, BookOpen } from "lucide-react"
import type { CoachingSession, CoachingInsight } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CoachingPageClientProps {
  sessions: CoachingSession[]
  insights: CoachingInsight[]
}

type SessionStatus = "needs-scheduling" | "scheduled" | "due-today" | "overdue" | "completed-recently"

export function CoachingPageClient({ sessions, insights }: CoachingPageClientProps) {
  const [showBooking, setShowBooking] = useState(false)
  const now = new Date()
  
  const getSessionStatus = (session: CoachingSession): SessionStatus => {
    const scheduledDate = new Date(session.scheduledAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDate = new Date(scheduledDate)
    sessionDate.setHours(0, 0, 0, 0)
    
    if (session.status === "completed") {
      const daysAgo = Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo <= 7) return "completed-recently"
    }
    
    if (scheduledDate < now && session.status === "scheduled") return "overdue"
    if (sessionDate.getTime() === today.getTime()) return "due-today"
    if (session.status === "scheduled") return "scheduled"
    return "needs-scheduling"
  }

  const groupedSessions = {
    dueToday: sessions.filter(s => getSessionStatus(s) === "due-today"),
    upcoming: sessions.filter(s => getSessionStatus(s) === "scheduled" && new Date(s.scheduledAt) > now),
    overdue: sessions.filter(s => getSessionStatus(s) === "overdue"),
    needsScheduling: sessions.filter(s => getSessionStatus(s) === "needs-scheduling"),
    completed: sessions.filter(s => getSessionStatus(s) === "completed-recently"),
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-50 border-red-200"
      case "high": return "bg-orange-50 border-orange-200"
      case "medium": return "bg-amber-50 border-amber-200"
      default: return "bg-blue-50 border-blue-200"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700"
      case "high": return "bg-orange-100 text-orange-700"
      case "medium": return "bg-amber-100 text-amber-700"
      default: return "bg-blue-100 text-blue-700"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Coaching Hub</h1>
            <Button onClick={() => setShowBooking(!showBooking)} className="gap-2">
              <Plus className="w-4 h-4" />
              Book Session
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage coaching sessions and track rep development across your team.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Sessions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Due Today */}
            {groupedSessions.dueToday.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Due Today ({groupedSessions.dueToday.length})
                </h2>
                <div className="space-y-3">
                  {groupedSessions.dueToday.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>
            )}

            {/* Overdue */}
            {groupedSessions.overdue.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Overdue ({groupedSessions.overdue.length})
                </h2>
                <div className="space-y-3">
                  {groupedSessions.overdue.map((session) => (
                    <SessionCard key={session.id} session={session} overdue />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {groupedSessions.upcoming.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Sessions ({groupedSessions.upcoming.length})</h2>
                <div className="space-y-3">
                  {groupedSessions.upcoming.map((session) => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </section>
            )}

            {/* Needs Scheduling */}
            {groupedSessions.needsScheduling.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Needs Scheduling ({groupedSessions.needsScheduling.length})
                </h2>
                <div className="space-y-3">
                  {groupedSessions.needsScheduling.map((session) => (
                    <div
                      key={session.id}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                    >
                      <p className="text-sm font-medium text-amber-900">{session.repName}</p>
                      <p className="text-sm text-amber-800 mt-1">Coaching session pending schedule</p>
                      <Button variant="outline" size="sm" className="mt-3">Schedule Now</Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Recently */}
            {groupedSessions.completed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Completed Recently ({groupedSessions.completed.length})</h2>
                <div className="space-y-3">
                  {groupedSessions.completed.map((session) => (
                    <div key={session.id} className="bg-card border rounded-lg p-4 opacity-60">
                      <p className="text-sm font-medium text-foreground">{session.repName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed {new Date(session.completedAt || session.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sessions.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-foreground font-medium mb-2">No coaching sessions yet</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Book your first coaching session to get started.
                </p>
                <Button onClick={() => setShowBooking(true)}>Book Session</Button>
              </div>
            )}
          </div>

          {/* Right: Coaching Priorities */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Coaching Priorities</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {insights.slice(0, 8).map((insight) => (
                <Link
                  key={insight.id}
                  href={`/reps/${insight.repId}`}
                  className={cn(
                    "block p-4 rounded-lg border transition-all hover:shadow-md",
                    getSeverityColor(insight.severity)
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm text-foreground">{insight.repName}</p>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded whitespace-nowrap",
                      getSeverityBadge(insight.severity)
                    )}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed line-clamp-2 mb-3">
                    {insight.reason}
                  </p>
                  <div className="flex items-center text-primary text-xs font-medium">
                    View rep
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </Link>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No coaching priorities at this time.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionCard({ session, overdue = false }: { session: CoachingSession; overdue?: boolean }) {
  const sessionTime = new Date(session.scheduledAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const uncheckedPoints = session.talkingPoints.filter(tp => !tp.checked).length
  const pendingActions = session.actionItems.filter(ai => !ai.completed).length

  return (
    <Link
      href={`/reps/${session.repId}`}
      className={cn(
        "group block rounded-lg p-4 transition-all hover:shadow-md",
        overdue 
          ? "bg-red-50 border border-red-200 hover:border-red-300"
          : "bg-card border hover:border-primary/20"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn("font-semibold", overdue && "text-red-900")}>{session.repName}</p>
          <p className={cn("text-sm", overdue ? "text-red-700" : "text-muted-foreground")}>{sessionTime}</p>
        </div>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded",
          overdue ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
        )}>
          {session.duration} min
        </span>
      </div>
      
      {session.talkingPoints.length > 0 && (
        <p className={cn("text-sm mb-3 line-clamp-1", overdue ? "text-red-800" : "text-muted-foreground")}>
          {session.talkingPoints[0].text}
        </p>
      )}

      {(uncheckedPoints > 0 || pendingActions > 0) && (
        <div className={cn("flex items-center gap-4 text-xs mb-3", overdue ? "text-red-600" : "text-muted-foreground")}>
          {uncheckedPoints > 0 && (
            <span>{uncheckedPoints}/{session.talkingPoints.length} talking points</span>
          )}
          {pendingActions > 0 && (
            <span>{pendingActions} action items</span>
          )}
        </div>
      )}

      <div className={cn("flex items-center text-xs font-medium", overdue ? "text-red-600" : "text-primary")}>
        Open session
        <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}

