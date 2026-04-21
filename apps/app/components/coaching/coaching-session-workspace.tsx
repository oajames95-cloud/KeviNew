"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import type { Rep, CoachingSession, RepTarget, CoachingInsight } from "@/types"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface CoachingSessionWorkspaceProps {
  session: CoachingSession
  rep: Rep
  insight?: CoachingInsight
  targets?: RepTarget[]
  onClose?: () => void
}

export function CoachingSessionWorkspace({
  session,
  rep,
  insight,
  targets = [],
  onClose,
}: CoachingSessionWorkspaceProps) {
  const [newTarget, setNewTarget] = useState("")
  const [showAddTarget, setShowAddTarget] = useState(false)
  const sessionTime = new Date(session.scheduledAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const handleCompleteSession = async () => {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error: sessionError } = await supabase
      .from("coaching_sessions")
      .update({ status: "completed", completed_at: now })
      .eq("id", session.id)

    if (sessionError) {
      console.error("[coaching] update coaching_sessions failed", sessionError)
      toast.error("Failed to complete session")
      return
    }

    if (session.coachingItemId) {
      await supabase
        .from("coaching_items")
        .update({ status: "coached", updated_at: now })
        .eq("id", session.coachingItemId)
    }

    toast.success("Session completed")
    onClose?.()
  }

  const generateWhyMatters = () => {
    if (insight?.reason) {
      return insight.reason
    }
    if (rep.scores.workflowDrift > 50) {
      return "Workflow is fragmented with excessive context switching. This session should focus on building a structured daily time-blocking routine."
    }
    if (rep.scores.followUpDiscipline < 40) {
      return "Follow-up discipline is declining, affecting pipeline velocity. This session should clarify follow-up cadence and remove tooling friction."
    }
    return "Rep is showing performance gaps in prospecting activity. This session should identify root cause and build a coaching plan."
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="font-semibold text-foreground">{rep.name}</h2>
            <p className="text-sm text-muted-foreground">{sessionTime} - {session.duration} min</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Why this session matters</p>
              <p className="text-sm text-blue-800 leading-relaxed">{generateWhyMatters()}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Rep Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Rep Similarity</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.topRepSimilarity}%</p>
                <p className={cn(
                  "text-xs mt-1",
                  rep.scores.topRepSimilarity > 75 ? "text-green-600" : "text-amber-600"
                )}>
                  {rep.scores.topRepSimilarity > 75 ? "Strong" : "Needs focus"}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Workflow Drift</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.workflowDrift}%</p>
                <p className={cn(
                  "text-xs mt-1",
                  rep.scores.workflowDrift < 30 ? "text-green-600" : "text-amber-600"
                )}>
                  {rep.scores.workflowDrift < 30 ? "Aligned" : "Drifting"}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Focus Time</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.prospectingFocusTime}%</p>
              </div>
              <div className="bg-card border rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Follow-up</p>
                <p className="text-lg font-semibold text-foreground">{rep.scores.followUpDiscipline}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Talking Points</h3>
            <div className="space-y-2">
              {session.talkingPoints.map((point) => (
                <label key={point.id} className="flex items-start gap-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={point.checked}
                    className="mt-1 w-4 h-4 rounded border border-input cursor-pointer"
                    readOnly
                  />
                  <span className={cn(
                    "text-sm flex-1",
                    point.checked ? "text-muted-foreground line-through" : "text-foreground"
                  )}>
                    {point.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {session.actionItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Action Items</h3>
              <div className="space-y-2">
                {session.actionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-2 rounded bg-card border">
                    <CheckCircle2 className={cn(
                      "w-4 h-4 mt-1 flex-shrink-0",
                      item.completed ? "text-green-600" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        item.completed ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        {item.text}
                      </p>
                      {item.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {targets.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Active Coaching Targets</h3>
              <div className="space-y-2">
                {targets.map((target) => (
                  <div key={target.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {target.metric.replace(/_/g, " ")}
                      </p>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {target.timeFrame}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{target.notes}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{target.targetValue}</span>
                      <span className="text-xs text-muted-foreground">Created {new Date(target.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAddTarget && (
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Create Coaching Target</p>
                <button
                  onClick={() => setShowAddTarget(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                placeholder="Target description"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full h-24 p-2 border rounded-md text-sm font-sans bg-background text-foreground resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">Set Target</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddTarget(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {!showAddTarget && (
            <button
              onClick={() => setShowAddTarget(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Coaching Target
            </button>
          )}
        </div>
      </div>

      <div className="border-t px-6 py-4 flex gap-2">
        <Button variant="outline" className="flex-1">Save Notes</Button>
        <Button className="flex-1" onClick={handleCompleteSession}>Complete Session</Button>
      </div>
    </div>
  )
}
