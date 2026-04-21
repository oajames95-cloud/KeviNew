'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Calendar, AlertCircle } from 'lucide-react'
import { AppHeader } from '@/components/shell/app-header'
import { useMobileSidebar } from '@/components/shell/app-shell'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TrendBadge } from '@/components/shared/trend-badge'
import { CoachingWorkflow } from '@/components/rep-detail/coaching-workflow'
import type { CoachingSession, Rep } from '@/types'

interface CoachingIndexClientProps {
  sessions: CoachingSession[]
  reps: Rep[]
}

export function CoachingIndexClient({ sessions, reps }: CoachingIndexClientProps) {
  const { toggle } = useMobileSidebar()
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false)
  const [selectedRep, setSelectedRep] = useState<Rep | null>(null)

  const handleOpenSession = (rep: Rep) => {
    setSelectedRep(rep)
    setIsWorkflowOpen(true)
  }

  const handleSaveSession = async (plan: any) => {
    setIsWorkflowOpen(false)
    setSelectedRep(null)
  }

  const overdueCount = sessions.filter(
    s => s.followUpDate && new Date(s.followUpDate) < new Date()
  ).length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Coaching"
        subtitle="Manage coaching sessions and follow-ups"
        onMenuClick={toggle}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Sessions Due */}
        {sessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Sessions Due</h2>
              {overdueCount > 0 && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-700">
                  {overdueCount} overdue
                </span>
              )}
            </div>
            <div className="space-y-3">
              {sessions.map(session => {
                const rep = reps.find(r => r.id === session.repId)
                const isOverdue = session.followUpDate && new Date(session.followUpDate) < new Date()
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {rep?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{rep?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.objective}</p>
                    </div>
                    {isOverdue && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {session.followUpDate ? new Date(session.followUpDate).toLocaleDateString() : 'Pending'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reps List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">All Reps</h2>
          <div className="space-y-2 border rounded-lg divide-y">
            {reps.map(rep => (
              <Link
                key={rep.id}
                href={`/coaching/${rep.id}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs text-foreground">
                    {rep.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{rep.name}</p>
                  <p className="text-xs text-muted-foreground">{rep.role}</p>
                </div>
                <TrendBadge trend={rep.trend} className="flex-shrink-0" />
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      {selectedRep && (
        <CoachingWorkflow
          rep={selectedRep}
          isOpen={isWorkflowOpen}
          onClose={() => {
            setIsWorkflowOpen(false)
            setSelectedRep(null)
          }}
          onSave={handleSaveSession}
        />
      )}
    </div>
  )
}
