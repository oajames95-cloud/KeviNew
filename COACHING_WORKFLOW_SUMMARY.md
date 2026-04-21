# Coaching Workflow - Complete Implementation

## What Was Built

A complete, structured coaching workflow that transforms "Open session" from a read-only dashboard into an **active, guided planning experience**.

### Core Components

1. **CoachingWorkflow** (`coaching-workflow.tsx`)
   - 5-stage guided flow: Understand → Focus → Set Targets → Assign Actions → Save Plan
   - Progress tracking with visual bar
   - Generates complete `SessionPlan` with all coaching outputs

2. **Session Context Generator** (`coaching-context.ts`)
   - Analyzes rep performance vs team and top performers
   - Generates plain-English "Why This Session Matters" narrative
   - Suggests coaching objectives based on performance patterns

3. **Integration into CoachingHub**
   - Button to open workflow replaces old panel
   - Receives session context automatically
   - Callback ready for database persistence

## The Workflow Experience

### Stage 1: Understand (Information)
- Shows why this session is happening
- Current metrics snapshot
- Pattern diagnosis (behavioral insights)
- Rep leaves understanding: "Here's what I'm seeing and why it matters"

### Stage 2: Focus (Decision)
- Manager selects ONE coaching objective
- Single focus ensures clarity
- Options: Improve reply rate, increase meetings, rebuild pipeline, etc.

### Stage 3: Targets (Commitment)
- Create rep-specific targets that override playbook defaults
- Examples: "5 meetings weekly", "12% reply rate", "4 core accounts"
- Each target is measurable and time-bound

### Stage 4: Actions (Work)
- Assign concrete action items
- Owner (rep or manager)
- Due date
- Links to targets where relevant
- Examples: "Rework messaging", "Block 9-11am daily for prospecting"

### Stage 5: Summary (Closure)
- Review the complete plan
- Add notes and commitments
- Set follow-up review date
- Save plan to database

## Key Design Decisions

### 1. Single Objective
One coaching focus per session. This isn't because there's only one issue—it's because coaching is most effective when concentrated.

### 2. Rep-Specific Targets
Targets created in coaching **override** playbook defaults for that rep. They're coaching commitments, not generic quotas. This makes the target hierarchy explicit:
- Playbook = team defaults
- Coaching targets = rep-specific overrides

### 3. Plain English Narratives
Every insight uses concrete metrics and language: "Replies are down 40% while outreach is stable" not "engagement is suboptimal."

### 4. Data Propagation
Coaching outputs immediately flow through the system:
- Targets appear on rep page
- Targets feed into Today's pacing signals
- Targets roll up into Overview
- Sessions tracked in Coaching tab

### 5. Actionable Output
Sessions must produce work. If a manager saves with no targets or actions, the workflow failed. Every session leaves behind measurable commitments.

## SessionPlan Output

Every completed session generates:

```typescript
{
  repId: "rep_123",
  sessionDate: "2025-01-10",
  sessionType: "ad-hoc",
  coachingObjective: "Improve reply rate",
  targets: [
    { metric: "response_rate", targetValue: 12, timeFrame: "weekly", note: "Up from 8%" }
  ],
  actions: [
    { 
      text: "Rework messaging for top 5 accounts",
      owner: "rep",
      dueDate: "2025-01-11",
      linkedTargetId: "target_1"
    }
  ],
  notes: "Sarah needs to focus on message quality, not volume...",
  followUpDate: "2025-01-17"
}
```

This output is the source of truth for:
- What targets to track
- What pacing signals to generate
- What follow-up conversations to schedule
- What actions to monitor

## Integration Ready

### Database Schema Needed

```sql
-- Coaching Sessions
CREATE TABLE coaching_sessions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  rep_id uuid NOT NULL,
  session_date date NOT NULL,
  session_type text NOT NULL, -- 'ad-hoc', 'scheduled', 'recurring'
  coaching_objective text NOT NULL,
  notes text,
  follow_up_date date,
  status text NOT NULL, -- 'completed', 'review_scheduled', 'archived'
  created_at timestamp DEFAULT now(),
  created_by uuid NOT NULL
);

-- Session Targets (links coaching session to rep targets)
CREATE TABLE session_targets (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL,
  rep_target_id uuid NOT NULL, -- links to rep_targets table
  created_at timestamp DEFAULT now()
);

-- Session Actions
CREATE TABLE session_actions (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL,
  text text NOT NULL,
  owner text NOT NULL, -- 'rep' or 'manager'
  due_date date NOT NULL,
  target_id uuid,
  completed boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

### Implementation Checklist

- [ ] Create database tables above
- [ ] Implement `handleSaveSession` to persist `SessionPlan`
- [ ] Display rep targets on Rep detail page with "From coaching session" label
- [ ] Add targets to Today page pacing signals
- [ ] Add targets to Overview team targets rollup
- [ ] Create action item tracking UI
- [ ] Implement follow-up reminder system
- [ ] Add session history view

## Example Flow

**Manager opens coaching for Marcus:**

1. **Understand**: "Marcus works 12 accounts (vs top performers' 3.2). His meetings are stable but SQL output is falling. This session should focus on account concentration and qualification quality."

2. **Focus**: Manager selects "Improve SQL conversion quality"

3. **Targets**: 
   - Creates: "Reduce active accounts from 12 to 5"
   - Creates: "80% of meetings from top 5 accounts only"
   - Creates: "SQL output: 3 per week"

4. **Actions**:
   - "Focus this week on only 5 named accounts" (Marcus, due Friday)
   - "Review Marcus's SQL pipeline for quality" (Manager, due Wednesday)

5. **Save**: Sets follow-up for Friday, adds note: "Marcus is capable but scattered. Constraint on accounts should unlock better selection."

**Immediately after save:**
- Rep page shows "Active Targets: Reduce accounts to 5, 80% top 5 meetings, 3 SQL weekly"
- Today shows pacing alerts if Marcus is off-track
- Follow-up reminder scheduled for Friday
- Actions appear in workflow feed

---

## Files Created

- `apps/app/components/rep-detail/coaching-workflow.tsx` - Main workflow component (579 lines)
- `apps/app/lib/coaching-context.ts` - Session context generator (158 lines)
- `apps/app/COACHING_WORKFLOW_GUIDE.md` - Implementation guide
- Updated `apps/app/components/rep-detail/coaching-hub.tsx` - Integrated workflow

## Status

✅ Complete workflow component
✅ Context generation logic
✅ Integration into CoachingHub
✅ UI/UX fully designed
🔄 Database persistence (next phase)
🔄 Targets propagation through app (next phase)
🔄 Follow-up tracking (next phase)

The coaching workflow is production-ready from a UI/UX perspective. It now needs to be wired to the database and have its outputs propagated through the rest of the app.
