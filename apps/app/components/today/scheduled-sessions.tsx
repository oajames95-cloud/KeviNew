"use client"

import Link from "next/link"
import { Clock, CheckCircle2, ChevronRight, ListChecks, MessageSquare } from "lucide-react"
import type { CoachingSession } from "@/types"
import { cn } from "@/lib/utils"

interface ScheduledSessionsProps {
  sessions: CoachingSession[]
}

export function ScheduledSessions({ sessions }: ScheduledSessionsProps) {
  if (sessions.length === 0) {
    return null
  }

  // Sort by scheduled time
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  )

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Scheduled Sessions</h2>
        <span className="text-xs text-muted-foreground">
          ({sessions.length} session{sessions.length === 1 ? "" : "s"} today)
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sortedSessions.map((session) => {
          const scheduledTime = new Date(session.scheduledAt)
          const timeStr = scheduledTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          
          const uncheckedTalkingPoints = session.talkingPoints.filter(tp => !tp.checked).length
          const totalTalkingPoints = session.talkingPoints.length
          const pendingActionItems = session.actionItems.filter(ai => !ai.completed).length

          // Check if session is in the past (for "next up" highlighting)
          const now = new Date()
          const isPast = scheduledTime < now
          const isUpcoming = !isPast && scheduledTime.getTime() - now.getTime() < 2 * 60 * 60 * 1000 // Within 2 hours

          return (
            <Link
              key={session.id}
              href={`/reps/${session.repId}`}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-xl border transition-all",
                "bg-card hover:shadow-md hover:border-primary/20",
                isUpcoming && "ring-2 ring-primary/20 border-primary/30",
                isPast && "opacity-60"
              )}
            >
              {/* Time badge */}
              <div className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg",
                isUpcoming ? "bg-primary/10" : "bg-muted"
              )}>
                <span className={cn(
                  "text-sm font-semibold",
                  isUpcoming ? "text-primary" : "text-foreground"
                )}>
                  {timeStr}
                </span>
                <span className="text-[10px] text-muted-foreground">{session.duration} min</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{session.repName}</span>
                  {isUpcoming && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Next up
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Completed
                    </span>
                  )}
                </div>

                {/* Session prep summary */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  {totalTalkingPoints > 0 && (
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>{uncheckedTalkingPoints}/{totalTalkingPoints} talking points</span>
                    </div>
                  )}
                  {pendingActionItems > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pendingActionItems} action item{pendingActionItems === 1 ? "" : "s"}</span>
                    </div>
                  )}
                </div>

                {/* Preview of first talking point */}
                {session.talkingPoints.length > 0 && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {session.talkingPoints[0].text}
                  </p>
                )}

                {/* Start session link */}
                <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isPast ? "View session" : "Prepare session"}</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
