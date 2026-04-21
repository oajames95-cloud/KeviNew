# Quick Integration Reference

## Key Imports

```typescript
// Types
import type { RepTarget, TargetPaceStatus } from "@/types"

// Components
import { CoachingSessionWorkspace } from "@/components/coaching/coaching-session-workspace"
import { TimeFilter, type TimeRange } from "@/components/shared/time-filter"
import { HourlyHeatmap } from "@/components/rep-detail/hourly-heatmap"
import { QualityMetrics } from "@/components/rep-detail/quality-metrics"
import { CRMAccountActivity } from "@/components/rep-detail/crm-account-activity"
import { TargetPacing } from "@/components/shared/target-pacing"
import { QuickTargetCheck } from "@/components/shared/quick-target-check"

// Data
import { mockRepTargets, mockCoachingSessions } from "@/lib/mock-data"
```

## Component Props

### CoachingSessionWorkspace
```typescript
{
  session: CoachingSession
  rep: Rep
  insight?: CoachingInsight
  targets?: RepTarget[]
  onClose?: () => void
}
```

### TargetPacing
```typescript
{
  targets: RepTarget[]
  compact?: boolean  // true for sidebar, false for full view
}
```

### HourlyHeatmap
```typescript
{
  activities: DailyActivity[]
  workingHours?: { start: number; end: number }  // defaults to 9-17
}
```

### QualityMetrics
```typescript
{
  responseRate: number       // 0-100
  openRate: number          // 0-100
  weeklyTrend?: {
    responseRate: number    // percentage change
    openRate: number        // percentage change
  }
}
```

## Common Queries

### Get rep targets
```typescript
// From mock data
const targets = mockRepTargets.filter(t => t.repId === repId)

// From Supabase (future)
const { data: targets } = await supabase
  .from("rep_targets")
  .select("*")
  .eq("rep_id", repId)
  .eq("status", "active")
```

### Calculate target progress
```typescript
const progress = {
  target,
  currentValue: Math.random() * target.targetValue * 0.75,
  paceStatus: Math.random() > 0.5 ? "on-track" : "watch",
  progress: Math.random() * 100,
  daysRemaining: target.timeFrame === "daily" ? 1 : 
                  target.timeFrame === "weekly" ? 5 : 20,
  projectedAtCompletion: target.targetValue
}
```

## Session Status Logic

```typescript
type SessionStatus = "needs-scheduling" | "scheduled" | "due-today" | "overdue" | "completed-recently"

const getSessionStatus = (session: CoachingSession): SessionStatus => {
  const scheduledDate = new Date(session.scheduledAt)
  const now = new Date()
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
```

## Severity Color Mapping

```typescript
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
```

## Target Metrics Enum

```typescript
type RepTargetMetric = 
  | "emails_sent"        // number
  | "prospecting_time"   // minutes
  | "meetings_booked"    // count
  | "pipeline_created"   // $
  | "response_rate"      // %
  | "open_rate"          // %
  | "account_activity"   // activity score
  | "calls_dialed"       // count
```

## Time Ranges

```typescript
type TimeRange = "today" | "week" | "month" | "custom"

const timeRangeConfig = {
  today: { label: "Today", days: 1 },
  week: { label: "This Week", days: 7 },
  month: { label: "This Month", days: 30 },
  custom: { label: "Custom Range", days: null }
}
```

## Progress Color Thresholds

```typescript
const getProgressColor = (progress: number) => {
  if (progress < 25) return "bg-slate-300"   // Needs attention
  if (progress < 50) return "bg-amber-500"   // Watch
  if (progress < 75) return "bg-blue-500"    // On track
  return "bg-green-500"                       // Strong
}

const getProgressBg = (progress: number) => {
  if (progress < 25) return "bg-slate-100"
  if (progress < 50) return "bg-amber-100"
  if (progress < 75) return "bg-blue-100"
  return "bg-green-100"
}
```

## Supabase Table Setup

```sql
-- Run in Supabase SQL Editor

CREATE TABLE rep_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES organizations(id),
  rep_id uuid NOT NULL REFERENCES reps(id),
  created_from_session_id uuid REFERENCES coaching_sessions(id),
  metric varchar NOT NULL,
  target_value numeric NOT NULL,
  time_frame varchar NOT NULL,
  account_scope varchar,
  notes text,
  status varchar DEFAULT 'active',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  completed_at timestamp
);

CREATE INDEX rep_targets_rep_id ON rep_targets(rep_id);
CREATE INDEX rep_targets_status ON rep_targets(status);
CREATE INDEX rep_targets_timeframe ON rep_targets(time_frame);

-- Enable RLS
ALTER TABLE rep_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Managers can see their team's targets
CREATE POLICY "Managers see team targets"
  ON rep_targets FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM organizations 
      WHERE id = auth.jwt() ->> 'tenant_id'
    )
  );
```

## Environment Setup (if needed)

No additional environment variables required. The implementation uses:
- Existing Supabase client (`@/lib/supabase/server`)
- Mock data for demo (`@/lib/mock-data`)
- Existing authentication context

## Troubleshooting

**Issue: Components not rendering**
- Check that all imports are from correct paths
- Verify types are exported from `packages/types/src/index.ts`
- Check mock data is imported in parent pages

**Issue: Targets not showing**
- Verify targets prop is passed to CoachingHub
- Check targets have correct repId
- Ensure targets.length > 0 before rendering TargetPacing

**Issue: Time filter not working**
- Check onChange handler updates parent state
- Verify component is client component ("use client")
- Check TimeRange type is imported

**Issue: Heatmap colors not showing**
- Verify activities array has data
- Check activity objects have timeProspecting field
- Try setting manual data in browser DevTools

---

**Version:** 1.0  
**Last Updated:** January 2025
