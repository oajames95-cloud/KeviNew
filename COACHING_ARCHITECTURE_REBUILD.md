# Kevi Coaching Architecture Rebuild

## Overview

This rebuild separates performance viewing from coaching management into distinct sections with clear data flow:

- **Reps** (`/reps`) - Performance dashboard: metrics, activity, outcomes
- **Coaching** (`/coaching`) - Coaching management: sessions, history, follow-ups

## Pages Structure

### Rep Performance Page (`/reps/[id]`)

**Purpose**: "Individual rep performance and metrics"

**Components**:
- Header with avatar, name, role, trend badge
- Buttons: Email, Open Coaching Dashboard (routes to `/coaching/[id]`)
- Decision Card (no workflow, display only)
- One-on-One Prep
- Active Coaching Targets (progress bars only, links to coaching dashboard)
- Outcomes metrics (last 5 days)
- Pattern scores vs top cohort
- Rep insight panels
- Workflow timeline
- Coaching notes section

**Data read**:
- Rep activity and metrics
- Active coaching targets (display progress, no editing)
- Recent activity

### Coaching Index Page (`/coaching`)

**Purpose**: "Coaching sessions and rep list"

**Sections**:
1. **Sessions Due** - Upcoming/overdue coaching sessions
   - Rep name, session objective, due date
   - Overdue count badge
   - Each row clickable to coach dashboard

2. **All Reps** - Complete rep list
   - Name, role, trend badge
   - Routes to `/coaching/[id]` on click

### Rep Coaching Dashboard (`/coaching/[id]`)

**Purpose**: "Coaching relationship and history for this rep"

**Sections**:
1. **Header** - Rep name, role, "Start New Session" button
2. **Active Coaching Plan** - Most recent session objective and active targets with progress bars
3. **Session History** - Timeline of all past sessions (date, objective, targets outcome, actions completion, notes)
4. **Pattern Context** - Rep behavior vs top performers (future)

**Actions**:
- "Start New Session" button opens `CoachingWorkflow` slide-over
- Session save persists to `coaching_sessions`, `coaching_targets`, `coaching_actions`

## Data Flow

```
Coaching Session Creation
├─ Manager clicks "Start New Session" at /coaching/[id]
├─ CoachingWorkflow slide-over opens (on current page)
├─ Required: Objective
├─ Optional: Targets, Actions, Notes, Follow-up date
└─ On save:
   ├─ coaching_sessions row created (objective, notes, follow_up_date, rep_id)
   ├─ coaching_targets rows created (one per target)
   ├─ coaching_actions rows created (one per action)
   └─ Success toast with target count

Target Progress Display
├─ /coaching/[id] reads active targets and queries current values
├─ /reps/[id] reads active targets with progress bars
├─ /today reads active targets with pacing calculations
└─ target-progress.ts utility calculates:
   ├─ Current value from rep_outcomes or rep_daily_metrics
   ├─ Pace status (on_track/at_risk/behind)
   └─ Formatted metric names

Navigation Rules
├─ /reps links - rep name, row click → /reps/[id]
├─ /reps/[id] buttons:
   ├─ "Open Coaching Dashboard" → /coaching/[id]
   ├─ "Email" / "Schedule 1:1" → external actions
├─ /coaching index:
   ├─ Sessions due row → /coaching/[id]
   ├─ Reps list row → /coaching/[id]
├─ /coaching/[id] buttons:
   ├─ "Start New Session" → slide-over (same page)
   ├─ Back link → /coaching
```

## Utilities Created

### `lib/coaching/target-progress.ts`

Server-only utilities for target calculations:

- `calculateCurrentValue(target, repId)` - Queries real metrics based on metric type
- `calculatePaceStatus(current, target, startDate, endDate)` - Returns on_track/at_risk/behind
- `formatMetricName(metric)` - Human-readable metric names

## Key Differences from Previous Version

| Previous | New |
|----------|-----|
| Coaching workflow on `/reps/[id]` | Coaching workflow only on `/coaching/[id]` |
| "Start coaching" button navigates | "Open Coaching Dashboard" links to `/coaching/[id]` |
| Mixed performance + coaching view | Separate pages: performance vs coaching |
| Unclear data separation | Clear: targets display on perf page, managed on coaching page |

## Next Steps

1. Implement Today page with three sections (due sessions, signals, pacing alerts)
2. Wire up target progress calculations with real data
3. Add session history expandable cards
4. Implement pattern comparison (this rep vs top performers)
5. Add coaching items to Today dashboard
