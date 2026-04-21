"use client"

import { X, Plus, Check, Calendar, MessageSquare, ListTodo, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import type { Rep } from "@/types"
import { cn } from "@/lib/utils"

interface CoachingSessionPanelProps {
  rep: Rep
  session?: any
  coachingItemId?: string
  isOpen: boolean
  onClose: () => void
}

interface ActionItem {
  id: string
  text: string
  completed: boolean
  dueDate?: string
}

interface TalkingPoint {
  id: string
  text: string
  checked: boolean
}

export function CoachingSessionPanel({
  rep,
  session,
  coachingItemId,
  isOpen,
  onClose,
}: CoachingSessionPanelProps) {
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([
    { id: "tp-1", text: "Review current workflow and identify friction points", checked: false },
    { id: "tp-2", text: "Check tool adoption and setup issues", checked: false },
    { id: "tp-3", text: "Discuss time-blocking strategies", checked: false },
  ])
  const [newActionText, setNewActionText] = useState("")
  const [newTalkingPointText, setNewTalkingPointText] = useState("")

  // Reset state when session changes
  useEffect(() => {
    if (session) {
      setSessionDate(session.date || new Date().toISOString().split("T")[0])
      setNotes(session.notes || "")
      setActionItems(session.actionItems?.map((item: any, idx: number) => ({
        id: `action-${idx}`,
        text: typeof item === "string" ? item : item.text,
        completed: typeof item === "string" ? false : item.completed,
        dueDate: typeof item === "string" ? "" : item.dueDate,
      })) || [])
    } else {
      setSessionDate(new Date().toISOString().split("T")[0])
      setNotes("")
      setActionItems([])
    }
  }, [session])

  const addActionItem = () => {
    if (newActionText.trim()) {
      setActionItems([
        ...actionItems,
        {
          id: `action-${Date.now()}`,
          text: newActionText,
          completed: false,
          dueDate: "",
        },
      ])
      setNewActionText("")
    }
  }

  const addTalkingPoint = () => {
    if (newTalkingPointText.trim()) {
      setTalkingPoints([
        ...talkingPoints,
        {
          id: `point-${Date.now()}`,
          text: newTalkingPointText,
          checked: false,
        },
      ])
      setNewTalkingPointText("")
    }
  }

  const toggleActionItem = (id: string) => {
    setActionItems(actionItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const toggleTalkingPoint = (id: string) => {
    setTalkingPoints(talkingPoints.map((point) =>
      point.id === id ? { ...point, checked: !point.checked } : point
    ))
  }

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter((item) => item.id !== id))
  }

  const removeTalkingPoint = (id: string) => {
    setTalkingPoints(talkingPoints.filter((point) => point.id !== id))
  }

  const objective = talkingPoints.find((p) => p.checked)?.text || notes

  const handleSave = async () => {
    const supabase = createClient()

    const { data: sessionData, error: sessionError } = await supabase
      .from("coaching_sessions")
      .insert({
        organization_id: rep.tenantId,
        rep_id: rep.id,
        coaching_item_id: coachingItemId ?? null,
        objective,
        notes,
        follow_up_date: sessionDate,
        session_type: "ad_hoc",
      })
      .select("id")
      .single()

    if (sessionError) {
      console.error("[coaching] insert coaching_sessions failed", sessionError)
      toast.error("Failed to save session")
      return
    }

    if (actionItems.length > 0) {
      const { error: actionsError } = await supabase
        .from("coaching_actions")
        .insert(
          actionItems.map((item) => ({
            session_id: sessionData.id,
            rep_id: rep.id,
            description: item.text,
            due_date: item.dueDate || null,
          }))
        )

      if (actionsError) {
        console.error("[coaching] insert coaching_actions failed", actionsError)
        toast.error("Session saved but action items failed to save")
        onClose()
        return
      }
    }

    if (coachingItemId) {
      await supabase
        .from("coaching_items")
        .update({ status: "coached", updated_at: new Date().toISOString() })
        .eq("id", coachingItemId)
    }

    toast.success("Session saved")
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold">
            {session ? "Edit Session" : "New Coaching Session"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {rep.name} · {rep.role}
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Session Date */}
          <div className="space-y-2">
            <Label htmlFor="session-date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Session Date
            </Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Talking Points */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Talking Points
            </Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Check off topics as you discuss them
            </p>
            <div className="space-y-2">
              {talkingPoints.map((point) => (
                <div
                  key={point.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors group",
                    point.checked 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-card border-border hover:border-primary/20"
                  )}
                >
                  <Checkbox
                    checked={point.checked}
                    onCheckedChange={() => toggleTalkingPoint(point.id)}
                    className="mt-0.5"
                  />
                  <p className={cn(
                    "text-sm flex-1",
                    point.checked ? "text-emerald-700" : "text-foreground"
                  )}>
                    {point.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTalkingPoint(point.id)}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a talking point..."
                value={newTalkingPointText}
                onChange={(e) => setNewTalkingPointText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTalkingPoint()}
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTalkingPoint}
                className="h-9 w-9 p-0 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Session Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Key insights, observations, and follow-up items..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] text-sm"
            />
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-muted-foreground" />
              Action Items
            </Label>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors group",
                    item.completed 
                      ? "bg-muted/50 border-border" 
                      : "bg-card border-border hover:border-primary/20"
                  )}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleActionItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      item.completed ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {item.text}
                    </p>
                    {item.dueDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeActionItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an action item..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addActionItem()}
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addActionItem}
                className="h-9 w-9 p-0 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex gap-3 justify-end bg-muted/30 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!objective.trim()}
            className="h-10 gap-2"
          >
            <Check className="w-4 h-4" />
            Complete Session
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
