'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import { AppHeader } from '@/components/shell/app-header'
import { useMobileSidebar } from '@/components/shell/app-shell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { TrendBadge } from '@/components/shared/trend-badge'
import { CoachingWorkflow } from '@/components/rep-detail/coaching-workflow'
import type { Rep, CoachingSession } from '@/types'

interface CoachingDashboardClientProps {
  rep: Rep
  sessions: CoachingSession[]
  activeTargets: any[]
}

export function CoachingDashboardClient({
  rep,
  sessions,
  activeTargets,
}: CoachingDashboardClientProps) {
  const { toggle } = useMobileSidebar()
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(false)

  const handleSaveSession = async (plan: any) => {
    setIsWorkflowOpen(false)
  }

  // Get most recent session objective for active plan
  const activePlan = sessions.length > 0 ? sessions[0] : null

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title={rep.name}
        subtitle={`${rep.role} • Coaching Dashboard`}
        onMenuClick={toggle}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Link
          href="/coaching"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Coaching
        </Link>

        {/* Header with buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm">
                {rep.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{rep.name}</h1>
              <p className="text-sm text-muted-foreground">{rep.role}</p>
            </div>
            <TrendBadge trend={rep.trend} />
          </div>
          <Button
            onClick={() => setIsWorkflowOpen(true)}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Start New Session
          </Button>
        </div>

        {/* Active Coaching Plan */}
        {activePlan && (
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Most Recent Session</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-base font-medium text-foreground">{new Date(activePlan.scheduledAt).toLocaleDateString()}</p>
            </div>
            {activePlan.notes && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground">{activePlan.notes}</p>
              </div>
            )}
            {activeTargets.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">Active Targets</p>
                <div className="space-y-2">
                  {activeTargets.map(target => (
                    <div key={target.id} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-foreground">{target.metric}</span>
                        <span className="text-muted-foreground">{target.current_value}/{target.target_value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (target.current_value / target.target_value) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session History */}
        {sessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Session History</h2>
            <div className="space-y-3">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">Coaching Session</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="text-sm text-muted-foreground">{session.notes}</p>
                  )}
                  {session.actionItems && session.actionItems.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">{session.actionItems.length} action items</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No coaching sessions yet. Start one to get started.</p>
          </div>
        )}
      </main>

      <CoachingWorkflow
        rep={rep}
        isOpen={isWorkflowOpen}
        onClose={() => setIsWorkflowOpen(false)}
        onSave={handleSaveSession}
      />
    </div>
  )
}
