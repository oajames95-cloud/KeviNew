"use client"

import { useState } from "react"
import { Calendar, Clock, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Rep, CoachingInsight } from "@/types"

interface ScheduleSessionDialogProps {
  reps: Rep[]
  coachingItems: CoachingInsight[]
  onSchedule?: (session: {
    repId: string
    date: string
    time: string
    duration: number
    coachingItemId?: string
    notes?: string
  }) => void
}

export function ScheduleSessionDialog({ reps, coachingItems, onSchedule }: ScheduleSessionDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedRepId, setSelectedRepId] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("10:00")
  const [duration, setDuration] = useState<number>(30)
  const [linkedItemId, setLinkedItemId] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  // Filter coaching items for the selected rep
  const repCoachingItems = coachingItems.filter(item => item.repId === selectedRepId)

  const handleSchedule = () => {
    if (!selectedRepId || !date || !time) return

    onSchedule?.({
      repId: selectedRepId,
      date,
      time,
      duration,
      coachingItemId: linkedItemId || undefined,
      notes: notes || undefined,
    })

    // Reset form
    setSelectedRepId("")
    setDate("")
    setTime("10:00")
    setDuration(30)
    setLinkedItemId("")
    setNotes("")
    setOpen(false)
  }

  const selectedRep = reps.find(r => r.id === selectedRepId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Schedule Coaching Session</DialogTitle>
          <DialogDescription>
            Book a 1:1 coaching session with a rep. You can link it to an existing coaching item for context.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Rep Selection */}
          <div className="grid gap-2">
            <Label htmlFor="rep" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Rep
            </Label>
            <Select value={selectedRepId} onValueChange={setSelectedRepId}>
              <SelectTrigger id="rep">
                <SelectValue placeholder="Select a rep" />
              </SelectTrigger>
              <SelectContent>
                {reps.map((rep) => (
                  <SelectItem key={rep.id} value={rep.id}>
                    <div className="flex items-center gap-2">
                      <span>{rep.name}</span>
                      <span className="text-xs text-muted-foreground">({rep.role})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link to Coaching Item (optional) */}
          {selectedRepId && repCoachingItems.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="coaching-item">Link to Coaching Item (optional)</Label>
              <Select value={linkedItemId} onValueChange={setLinkedItemId}>
                <SelectTrigger id="coaching-item">
                  <SelectValue placeholder="Select a coaching item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {repCoachingItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          item.severity === 'critical' ? 'bg-red-500' :
                          item.severity === 'high' ? 'bg-amber-500' :
                          item.severity === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        <span className="truncate max-w-[280px]">{item.theme}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pre-session Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Pre-session Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any context or topics you want to cover..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={!selectedRepId || !date || !time}
          >
            Schedule Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
