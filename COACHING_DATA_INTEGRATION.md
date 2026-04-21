## Coaching Data Integration - Implementation Complete

### What Was Built

I've implemented a complete data flow for coaching sessions, targets, and actions across the entire app, with everything persisting to Supabase.

### 5 Key Components

#### 1. **Target Progress Calculation** (`lib/coaching/targets.ts`)
- `calculateTargetProgress()` - Queries rep_outcomes and rep_daily_metrics to get actual current values for each target
- `calculatePaceStatus()` - Determines if rep is on_track, at_risk, or behind based on elapsed time and progress
- `formatMetricName()` - Converts metric type to readable labels
- Supports: meetings_booked, pipeline_created, prospecting_minutes, reply_rate, sqls_booked

#### 2. **Session Persistence** (`lib/coaching/sessions.ts`)
- `saveCoachingSession()` - Server action that:
  - **Validates** that objective is required (fails if missing)
  - **Creates** coaching_sessions row with objective, notes, commitments, follow_up_date
  - **Creates** coaching_targets rows (one per target with calculated end date)
  - **Creates** coaching_actions rows (one per action item)
  - **Updates** coaching_items to status='coached' if linked
  - **Returns** success/error with count of targets and actions created
  - **Shows** toast: "Session saved. X targets set for [Rep Name]."

#### 3. **Active Coaching Plan Component** (`components/rep-detail/active-coaching-plan.tsx`)
- Displays all active coaching targets with:
  - Metric name in plain English ("Meetings booked this week")
  - Progress bar showing current vs target
  - Pacing badge (On track/At risk/Behind) with color coding
  - End date
  - Source ("Set in coaching session — [date]")
- Shows quiet empty state if no active targets
- **Positioned prominently** on rep detail page below DecisionCard

#### 4. **Rep Page Integration**
- Rep detail page now:
  - Fetches active coaching_targets where status='active'
  - Passes targets to RepDetailClient
  - Displays ActiveCoachingPlan component

#### 5. **Coaching Workflow Save Handler**
- Updated coaching-hub.tsx with:
  - Imports for saveCoachingSession and toast
  - handleSaveSession() async function that calls server action
  - Success/error toast feedback
  - Closes workflow on success

### Database Schema Expected

```sql
coaching_sessions:
  - id, organization_id, rep_id, coaching_item_id (nullable)
  - objective (required), notes, commitments
  - follow_up_date, session_type, completed_at

coaching_targets:
  - id, organization_id, rep_id, session_id
  - metric_type, target_value, current_value
  - target_period ('daily'|'weekly'|'monthly')
  - start_date, end_date, status ('active'|'completed'|'missed')
  - created_at

coaching_actions:
  - id, organization_id, session_id, rep_id
  - description, owner ('rep'|'manager')
  - due_date, status ('open'|'completed'), created_at
```

### Data Flow

1. Manager opens coaching session → sees "Why This Session Matters" context
2. Manager sets ONE objective, creates targets, assigns actions
3. **Click "Save Coaching Plan"** → calls saveCoachingSession()
4. ✅ Session saved, targets created in coaching_targets table
5. Rep page reloads → fetches active targets → displays in ActiveCoachingPlan
6. Progress bars update as rep_outcomes records come in
7. Pacing status calculated dynamically based on days elapsed

### Next Steps to Complete the Loop

1. **Today Page** - Query coaching_targets and surface pacing alerts for behind-pace targets
2. **Coaching Page** - Add three tabs: Open items, Upcoming follow-ups, History
3. **Refresh endpoint** - Call refreshTargetProgress() periodically to update current_value
4. **Coaching history** - Query coaching_sessions on rep page to show past sessions with outcomes

### Key Design Decisions

✅ Objective is **required** - prevents empty coaching sessions  
✅ Targets auto-calculate end date based on period (daily/weekly/monthly)  
✅ Pacing only alerts if 20%+ of period elapsed  
✅ Progress bars use indigo (consistent with design system)  
✅ All UI uses existing components (Progress, Badge) for consistency  

The system is now ready for the Today page alerts and Coaching page history implementation.
