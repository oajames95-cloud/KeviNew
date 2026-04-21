"use client"

import { X, Plus, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Rep } from "@/types"

interface CoachingSessionPanelProps {
  rep: Rep
  session?: any
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
}

export function CoachingSessionPanel({
  rep,
  session,
  isOpen,
  onClose,
}: CoachingSessionPanelProps) {
  const [sessionDate, setSessionDate] = useState(session?.date?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState(session?.notes || "")
  const [actionItems, setActionItems] = useState<ActionItem[]>(session?.actionItems?.map((item: any, idx: number) => ({
    id: `action-${idx}`,
    text: typeof item === "string" ? item : item.text,
    completed: typeof item === "string" ? false : item.completed,
    dueDate: typeof item === "string" ? "" : item.dueDate,
  })) || [])
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>(session?.talkingPoints || [])
  const [coachingItemId, setCoachingItemId] = useState(session?.coachingItemId || "")
  const [newActionText, setNewActionText] = useState("")
  const [newTalkingPointText, setNewTalkingPointText] = useState("")

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

  const removeActionItem = (id: string) => {
    setActionItems(actionItems.filter((item) => item.id !== id))
  }

  const removeTalkingPoint = (id: string) => {
    setTalkingPoints(talkingPoints.filter((point) => point.id !== id))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-background border-l border-border shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {session ? "Edit Session" : "New Coaching Session"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{rep.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Session Date */}
          <div className="space-y-2">
            <Label htmlFor="session-date" className="text-sm font-medium">
              Session Date
            </Label>
            <Input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Coaching Item Link */}
          <div className="space-y-2">
            <Label htmlFor="coaching-item" className="text-sm font-medium">
              Linked Coaching Item
            </Label>
            <Select value={coachingItemId} onValueChange={setCoachingItemId}>
              <SelectTrigger id="coaching-item" className="h-9">
                <SelectValue placeholder="Select a coaching item..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Link</SelectItem>
                <SelectItem value="call-connect">Call Connect Rate</SelectItem>
                <SelectItem value="pipeline">Meeting-to-Pipeline Ratio</SelectItem>
                <SelectItem value="followup">Email Follow-Up Discipline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Session Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="What did you discuss? Key insights and takeaways..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Talking Points */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Talking Points</Label>
            <div className="space-y-2">
              {talkingPoints.map((point) => (
                <div
                  key={point.id}
                  className="flex items-start gap-2 bg-secondary/50 p-3 rounded-lg group"
                >
                  <p className="text-sm text-foreground flex-1">{point.text}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTalkingPoint(point.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a talking point..."
                value={newTalkingPointText}
                onChange={(e) => setNewTalkingPointText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTalkingPoint()}
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addTalkingPoint}
                className="h-9 w-9 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Items */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Action Items</Label>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 bg-secondary/50 p-3 rounded-lg group"
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={() => toggleActionItem(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
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
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeActionItem(item.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an action item..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addActionItem()}
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addActionItem}
                className="h-9 w-9 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 flex gap-2 justify-end bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 text-sm px-4"
          >
            Cancel
          </Button>
          <Button
            className="h-9 text-sm px-4 gap-1.5"
            onClick={() => {
              console.log("[v0] Saving session", { sessionDate, notes, actionItems, talkingPoints, coachingItemId })
              onClose()
            }}
          >
            <Check className="w-4 h-4" />
            Save Session
          </Button>
        </div>
      </div>
    </div>
  )
}
