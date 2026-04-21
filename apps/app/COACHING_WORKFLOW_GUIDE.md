# Coaching Workflow Implementation Guide

## Overview
The coaching workflow has been completely redesigned as a structured, multi-stage process that guides managers through creating a complete coaching plan with outputs that propagate through the entire app.

## Architecture

### Components

#### 1. `CoachingWorkflow` (apps/app/components/rep-detail/coaching-workflow.tsx)
The main workflow component—a Sheet-based modal with 5 sequential stages:

- **Understand**: Shows "Why This Session Matters" with current metrics and pattern diagnosis
- **Focus**: Manager selects a single coaching objective
- **Targets**: Manager creates rep-specific targets that override playbook defaults
- **Actions**: Manager assigns action items with owners and due dates
- **Summary**: Review the plan, add notes, set follow-up date, then save

**Key Features:**
- Progress bar showing workflow completion
- Visual state management for each stage
- Built-in validation (requires objective and targets/actions)
- Generates `SessionPlan` output with all coaching data

#### 2. `generateSessionContext()` (apps/app/lib/coaching-context.ts)
Utility that generates the "why this matters" narrative and session context:

```typescript
const context = generateSessionContext(rep, allReps)
// Returns:
{
  whyItMatters: "Plain English explanation of the performance issue",
  currentMetrics: { "Meetings booked": 5, ... },
  targetPatterns: ["Pattern 1", "Pattern 2", ...]
}
```

**What It Does:**
- Analyzes recent vs previous activity trends
- Compares to team and top performer benchmarks
- Generates concrete, actionable patterns
- Provides suggested coaching objectives

### Data Flow

```
CoachingHub (rep detail page)
  ↓
generateSessionContext(rep, allReps) → SessionContext
  ↓
CoachingWorkflow receives context
  ↓
Manager goes through 5 stages
  ↓
Saves SessionPlan
  ↓
onSave callback (TODO: save to database)
```

## Integration Points

### 1. Rep Detail Page (`apps/app/app/(app)/reps/[id]/page.tsx`)

The page already:
- Fetches `rep` and `allReps` data
- Passes both to `CoachingHub`

No changes needed—the workflow receives this automatically.

### 2. Targets Propagation (NEXT)

When a SessionPlan is saved, it should:

1. Create `RepTarget` records in the database:
```typescript
{
  tenantId,
  repId,
  createdFromSessionId: sessionPlan.id,
  metric,
  targetValue,
  timeFrame,
  accountScope,
  notes,
  status: "active"
}
```

2. These targets immediately appear:
   - **Rep page**: In "Active Coaching Targets" section
   - **Today page**: In pacing signals (if behind pace, trigger alert)
   - **Overview page**: In team targets rollup

### 3. Action Items Tracking (NEXT)

When saved, action items should:
- Create tasks in a tracking system
- Appear in rep's action item feed
- Show due dates and completion status
- Link back to targets and sessions

### 4. Follow-up State Management (NEXT)

Sessions should have states:
- `in-progress`: Session is open, plan in draft
- `completed`: Plan saved, targets and actions created
- `review_scheduled`: Follow-up date set, waiting for review
- `archived`: Session closed

## Usage Example

### In CoachingHub (already implemented)

```tsx
const [isWorkflowOpen, setIsWorkflowOpen] = useState(false)
const sessionContext = allReps.length > 0 ? generateSessionContext(rep, allReps) : undefined

const handleOpenSession = () => {
  setIsWorkflowOpen(true)
}

const handleSaveSession = (plan: SessionPlan) => {
  // TODO: Save to database
  // 1. Create coaching_sessions record
  // 2. Create rep_targets from plan.targets
  // 3. Create action_items from plan.actions
  console.log("[v0] Coaching plan saved:", plan)
}

return (
  <>
    <button onClick={handleOpenSession}>Open Coaching Session</button>
    <CoachingWorkflow
      rep={rep}
      isOpen={isWorkflowOpen}
      onClose={() => setIsWorkflowOpen(false)}
      onSave={handleSaveSession}
      sessionContext={sessionContext}
    />
  </>
)
```

## Stage Details

### Stage 1: Understand
Shows context generated from performance analysis:
- Actionable narrative about the performance issue
- Current metrics snapshot
- Pattern diagnosis (behavioral insights)

Manager should leave understanding:
- What the performance issue is
- Why it matters
- What patterns they're seeing

### Stage 2: Focus
Manager selects ONE coaching objective from preset options:
- Improve reply rate
- Increase meetings booked
- Rebuild pipeline pace
- Increase activity in key accounts
- Improve consistency of prospecting
- Improve SQL conversion quality
- Reduce account scatter
- Custom objective

**Why single focus?** Multiple competing priorities dilute coaching impact.

### Stage 3: Targets
Manager creates 1+ rep-specific targets:
- Metric (meetings_booked, pipeline_created, prospecting_time, etc.)
- Target value (e.g., 5)
- Time frame (daily, weekly, monthly)
- Account scope (optional)
- Note (optional)

**Key Concept:** These targets override playbook defaults for this rep specifically. They are coaching commitments created during this session.

### Stage 4: Actions
Manager assigns concrete actions:
- Action description (what the rep will do)
- Owner (rep or manager)
- Due date
- Optional link to a target

Actions translate the objective into day-to-day work.

### Stage 5: Summary
- Review complete plan
- Add session notes and commitments
- Set follow-up review date
- Save the plan

## Key Design Principles

1. **Single Focus**: One coaching objective per session
2. **Measurable Outputs**: Targets and actions must be specific
3. **Data Propagation**: Targets created here flow through the entire app
4. **Context-Driven**: The workflow is informed by actual performance data
5. **Actionable**: Sessions produce work, not just notes
6. **Follow-up Tracking**: Next review point is set at save time

## SessionPlan Data Structure

```typescript
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
```

## Next Steps (Implementation Checklist)

- [ ] Create `coaching_sessions` database table
- [ ] Create `session_targets` database table (links to `rep_targets`)
- [ ] Implement `handleSaveSession` to persist plan to database
- [ ] Display targets on Rep page with "Created from coaching session" label
- [ ] Display targets on Overview page in team progress rollup
- [ ] Create pacing signals on Today page for active coaching targets
- [ ] Create action item tracking UI
- [ ] Implement follow-up scheduling and review reminders
- [ ] Add session history view showing past sessions and their outcomes

## Plain English Example

### Manager opens session for Sarah (SDR)
1. **Understand**: "Sarah's reply rate is down to 8% despite 2x the outreach volume. Quality issue, not volume."
2. **Focus**: Selects "Improve reply rate"
3. **Targets**: 
   - Creates: "12% reply rate by Friday"
   - Creates: "Focus on 5 named accounts"
4. **Actions**:
   - "Rework messaging for top 5 accounts" (Sarah, due tomorrow)
   - "Review Sarah's last 20 emails for pattern" (Manager, due today)
5. **Save**: Sets follow-up for Friday afternoon to review results

### Immediately after save:
- Rep page shows "Active Coaching Targets: 12% reply rate (1 week), 5 named accounts"
- Today page shows pacing alerts if Sarah falls behind
- Manager sees action items appear in action feed
- Session appears in "Coaching History"

---

**Status**: Core workflow complete. Database persistence, targets propagation, and follow-up tracking are next phases.
