"use client"

import { useState } from "react"
import { X, ChevronRight, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import type { Rep, RepTarget } from "@/types"
import { cn } from "@/lib/utils"

type WorkflowStage = "understand" | "focus" | "targets" | "actions" | "summary"

interface SessionPlan {
  repId: string
  sessionDate: string
  sessionType: "scheduled" | "ad-hoc" | "recurring"
  coachingObjective: string
  targets: SessionTarget[]
  actions: SessionAction[]
  notes: string
  followUpDate?: string
}

interface SessionTarget {
  id: string
  metric: string
  targetValue: number
  timeFrame: "daily" | "weekly" | "monthly"
  accountScope?: string
  note?: string
}

interface SessionAction {
  id: string
  text: string
  owner: "rep" | "manager"
  dueDate: string
  linkedTargetId?: string
  completed: boolean
}

interface CoachingWorkflowProps {
  rep: Rep
  isOpen: boolean
  onClose: () => void
  onSave?: (plan: SessionPlan) => Promise<void>
  sessionContext?: {
    whyItMatters: string
    currentMetrics: Record<string, number>
    targetPatterns: string[]
  }
}

export function CoachingWorkflow({
  rep,
  isOpen,
  onClose,
  onSave,
  sessionContext,
}: CoachingWorkflowProps) {
  const [stage, setStage] = useState<WorkflowStage>("understand")
  const [plan, setPlan] = useState<SessionPlan>({
    repId: rep.id,
    sessionDate: new Date().toISOString().split("T")[0],
    sessionType: "ad-hoc",
    coachingObjective: "",
    targets: [],
    actions: [],
    notes: "",
  })

  const [newTarget, setNewTarget] = useState<Partial<SessionTarget>>({})
  const [newAction, setNewAction] = useState<Partial<SessionAction>>({ owner: "rep", completed: false })

  const handleNext = () => {
    const stages: WorkflowStage[] = ["understand", "focus", "targets", "actions", "summary"]
    const currentIdx = stages.indexOf(stage)
    if (currentIdx < stages.length - 1) {
      setStage(stages[currentIdx + 1])
    }
  }

  const handlePrev = () => {
    const stages: WorkflowStage[] = ["understand", "focus", "targets", "actions", "summary"]
    const currentIdx = stages.indexOf(stage)
    if (currentIdx > 0) {
      setStage(stages[currentIdx - 1])
    }
  }

  const addTarget = () => {
    if (newTarget.metric && newTarget.targetValue && newTarget.timeFrame) {
      const target: SessionTarget = {
        id: `target_${Date.now()}`,
        metric: newTarget.metric,
        targetValue: newTarget.targetValue,
        timeFrame: newTarget.timeFrame,
        accountScope: newTarget.accountScope,
        note: newTarget.note,
      }
      setPlan({ ...plan, targets: [...plan.targets, target] })
      setNewTarget({})
    }
  }

  const removeTarget = (id: string) => {
    setPlan({ ...plan, targets: plan.targets.filter(t => t.id !== id) })
  }

  const addAction = () => {
    if (newAction.text && newAction.dueDate) {
      const action: SessionAction = {
        id: `action_${Date.now()}`,
        text: newAction.text,
        owner: newAction.owner || "rep",
        dueDate: newAction.dueDate,
        linkedTargetId: newAction.linkedTargetId,
        completed: false,
      }
      setPlan({ ...plan, actions: [...plan.actions, action] })
      setNewAction({ owner: "rep", completed: false })
    }
  }

  const removeAction = (id: string) => {
    setPlan({ ...plan, actions: plan.actions.filter(a => a.id !== id) })
  }

  const handleSave = async () => {
    console.log('[COACHING] Save button clicked, plan:', JSON.stringify(plan))
    if (!plan.coachingObjective) {
      alert("Please set a coaching objective")
      return
    }
    if (onSave) {
      await onSave(plan)
    }
  }

  const stageProgress = {
    understand: 20,
    focus: 40,
    targets: 60,
    actions: 80,
    summary: 100,
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader className="space-y-4 border-b pb-4 pr-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-foreground">{rep.name}</h2>
              <p className="text-sm text-muted-foreground">
                {rep.role} • Coaching Session • {new Date(plan.sessionDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Coaching Workflow</span>
              <span>{stageProgress[stage]}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${stageProgress[stage]}%` }}
              />
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6 px-2">
          {/* STAGE 1: UNDERSTAND */}
          {stage === "understand" && (
            <div className="space-y-4 max-w-3xl">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Why This Session Matters</h3>
                {sessionContext?.whyItMatters ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                    {sessionContext.whyItMatters}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-gray-700">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Add context about what triggered this session
                  </div>
                )}
              </div>

              {/* Current metrics snapshot */}
              {sessionContext?.currentMetrics && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Current Performance Snapshot</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(sessionContext.currentMetrics).map(([key, value]) => (
                      <div key={key} className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="text-lg font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern diagnosis */}
              {sessionContext?.targetPatterns && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Pattern Diagnosis</h4>
                  <ul className="space-y-2">
                    {sessionContext.targetPatterns.map((pattern, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: FOCUS - Set coaching objective */}
          {stage === "focus" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Set Coaching Objective</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose ONE clear focus for this coaching session. This should be the primary theme the rep leaves understanding they need to improve.
                </p>

                <div className="space-y-3">
                  {[
                    "Improve reply rate",
                    "Increase meetings booked",
                    "Rebuild pipeline pace",
                    "Increase activity in key accounts",
                    "Improve consistency of prospecting",
                    "Improve SQL conversion quality",
                    "Reduce account scatter",
                    "Custom objective",
                  ].map((option) => (
                    <label
                      key={option}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                        plan.coachingObjective === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-blue-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="objective"
                        value={option}
                        checked={plan.coachingObjective === option}
                        onChange={(e) => setPlan({ ...plan, coachingObjective: e.target.value })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  ))}
                </div>

                {plan.coachingObjective === "Custom objective" && (
                  <div className="mt-4">
                    <Input
                      placeholder="Describe the coaching objective..."
                      value={
                        !["Improve reply rate", "Increase meetings booked", "Rebuild pipeline pace", "Increase activity in key accounts", "Improve consistency of prospecting", "Improve SQL conversion quality", "Reduce account scatter"].includes(
                          plan.coachingObjective
                        )
                          ? plan.coachingObjective
                          : ""
                      }
                      onChange={(e) => setPlan({ ...plan, coachingObjective: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE 3: TARGETS - Create rep-specific targets */}
          {stage === "targets" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Create Rep-Specific Targets</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These targets are specific to {rep.name} and will override playbook defaults. They track progress toward the coaching objective.
                </p>

                {/* Existing targets */}
                {plan.targets.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {plan.targets.map((target) => (
                      <div
                        key={target.id}
                        className="flex items-center justify-between bg-muted p-3 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm text-foreground">{target.metric}</p>
                          <p className="text-xs text-muted-foreground">
                            {target.targetValue} per {target.timeFrame}
                            {target.accountScope && ` • Accounts: ${target.accountScope}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeTarget(target.id)}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new target */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Metric</Label>
                      <select
                        value={newTarget.metric || ""}
                        onChange={(e) => setNewTarget({ ...newTarget, metric: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      >
                        <option value="">Select metric...</option>
                        <option value="meetings_booked">Meetings Booked</option>
                        <option value="pipeline_created">Pipeline Created</option>
                        <option value="prospecting_time">Prospecting Time (hours)</option>
                        <option value="response_rate">Response Rate (%)</option>
                        <option value="account_activity">Active Accounts</option>
                        <option value="calls_dialed">Calls Dialed</option>
                        <option value="emails_sent">Emails Sent</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Target Value</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5"
                        value={newTarget.targetValue || ""}
                        onChange={(e) =>
                          setNewTarget({ ...newTarget, targetValue: parseInt(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Time Frame</Label>
                      <select
                        value={newTarget.timeFrame || ""}
                        onChange={(e) =>
                          setNewTarget({
                            ...newTarget,
                            timeFrame: e.target.value as "daily" | "weekly" | "monthly",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      >
                        <option value="">Select...</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Account Scope (optional)</Label>
                      <Input
                        placeholder="e.g. 5 key accounts"
                        value={newTarget.accountScope || ""}
                        onChange={(e) => setNewTarget({ ...newTarget, accountScope: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Note (optional)</Label>
                    <Input
                      placeholder="Add context or instructions..."
                      value={newTarget.note || ""}
                      onChange={(e) => setNewTarget({ ...newTarget, note: e.target.value })}
                    />
                  </div>

                  <Button onClick={addTarget} className="w-full" size="sm">
                    Add Target
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: ACTIONS - Assign action items */}
          {stage === "actions" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Assign Action Items</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create specific action items that translate the objective into day-to-day work.
                </p>

                {/* Existing actions */}
                {plan.actions.length > 0 && (
                  <div className="mb-6 space-y-2">
                    {plan.actions.map((action) => (
                      <div key={action.id} className="flex items-start justify-between bg-muted p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{action.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(action.dueDate).toLocaleDateString()} •{" "}
                            <span className="capitalize">{action.owner}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeAction(action.id)}
                          className="text-muted-foreground hover:text-destructive text-xs ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new action */}
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-xs">Action Item</Label>
                    <Textarea
                      placeholder="What should the rep do? e.g., 'Rebuild messaging for dormant enterprise accounts'"
                      value={newAction.text || ""}
                      onChange={(e) => setNewAction({ ...newAction, text: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Owner</Label>
                      <select
                        value={newAction.owner || "rep"}
                        onChange={(e) =>
                          setNewAction({ ...newAction, owner: e.target.value as "rep" | "manager" })
                        }
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                      >
                        <option value="rep">Rep</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Due Date</Label>
                      <Input
                        type="date"
                        value={newAction.dueDate || ""}
                        onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Link to Target (optional)</Label>
                    <select
                      value={newAction.linkedTargetId || ""}
                      onChange={(e) => setNewAction({ ...newAction, linkedTargetId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                    >
                      <option value="">Not linked</option>
                      {plan.targets.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.metric}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button onClick={addAction} className="w-full" size="sm">
                    Add Action
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: SUMMARY - Review and save */}
          {stage === "summary" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Session Summary & Follow-up</h3>

                {/* Session overview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Coaching Objective</p>
                    <p className="font-semibold text-foreground">{plan.coachingObjective}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Targets Created</p>
                      <p className="font-semibold">{plan.targets.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actions Assigned</p>
                      <p className="font-semibold">{plan.actions.length}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-sm font-medium">Session Notes & Commitments</Label>
                  <Textarea
                    placeholder="Any additional context, agreed commitments, blockers, or follow-up notes..."
                    value={plan.notes}
                    onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
                    className="text-sm mt-2"
                  />
                </div>

                {/* Follow-up */}
                <div>
                  <Label className="text-sm font-medium">Next Review Date</Label>
                  <Input
                    type="date"
                    value={plan.followUpDate || ""}
                    onChange={(e) => setPlan({ ...plan, followUpDate: e.target.value })}
                    className="text-sm mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    When should you check back on progress toward these targets?
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="border-t pt-4 flex gap-3 sticky bottom-0 bg-background px-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={stage === "understand"}
            size="sm"
          >
            Back
          </Button>
          {stage !== "summary" && (
            <Button onClick={handleNext} size="sm" className="flex-1">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {stage === "summary" && (
            <Button onClick={handleSave} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" />
              Save Coaching Plan
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
