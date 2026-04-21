# Kevi Connected Coaching System Architecture

## Core Principle
Kevi is designed as ONE CONNECTED COACHING SYSTEM where data flows seamlessly across pages, giving managers a unified understanding of team performance from multiple angles.

## Data Flow Architecture

### 1. Foundation Layer: Performance Analysis
**File:** `lib/performance-patterns.ts`

This layer generates actionable insights by analyzing team performance:

- **`analyzeTopPerformerPatterns(reps)`** - Identifies what top performers do differently
  - Account depth vs breadth
  - Response rate drivers
  - Activity consistency patterns
  - SQL conversion efficiency
  
- **`compareRepToTeam(rep, allReps)`** - Shows individual rep vs team/top performers
  - Generates 6 key comparisons
  - Variance status (leading/above-avg/average/below-avg/lagging)
  - Plain English insights for each metric
  
- **`generateSessionContext(rep, theme, comparisons)`** - Creates "Why this matters" narratives
  - Contextualizes coaching session based on performance data
  - Links session to broader team patterns

### 2. Component Layer: Display & Interaction
Components render performance data and enable action:

#### Pattern Visualization
- **`TopPerformerPatterns`** - Shows on Overview page
  - 4 key patterns from team analysis
  - Plain English descriptions of behaviors
  - Coaching focus recommendations

#### Comparison Display
- **`RepComparison`** - Shows on Rep detail page (compact & full)
  - How this rep compares to team average
  - How this rep compares to top performers
  - Visual variance indicators

#### Target Management
- **`TargetContext`** - Shows on Rep detail page & Coaching sessions
  - Rep-specific targets clearly marked as overrides
  - Playbook defaults vs rep overrides
  - Progress toward targets

#### Session Context
- **`WhyThisMatters`** - Shows in coaching workspace
  - Performance context
  - Related patterns
  - Actionable focus areas

### 3. Data Flow Across Pages

#### Today Page
Receives: Coaching sessions, signals from pattern analysis
Displays: Scheduled sessions, activity alerts, rep targets in progress
Action: Book sessions, start coaching, view rep detail

```
Performance Patterns → Signal Generation → Today Alerts
                           ↓
                    Rep Targets Progress
```

#### Overview Page
Receives: All reps, top performer patterns, team averages
Displays: Team attainment, activity comparison, top performer patterns, target progress
Action: Drill into rep detail, see team-wide trends

```
All Reps Data → Analyze Patterns → TopPerformerPatterns Component
    ↓                                    ↓
Team Metrics                    Pattern Cards Display
```

#### Rep Detail Page
Receives: Individual rep data, all reps for comparison, active targets
Displays: Hero insight, week deltas, hourly heatmap, quality metrics, rep vs team comparison, active targets, CRM activity
Action: Prepare session, set targets, view session history

```
Rep Data + All Reps → Compare Rep to Team
    ↓                    ↓
Performance Context   Comparison Component
    ↓
RepComparison Cards + TargetContext Display
```

#### Coaching Session Workspace
Receives: Rep data, comparison context, related patterns, active targets
Displays: "Why this matters" context, talking points, action items, target setting
Action: Create targets, log session, track progress

```
Comparison Data → generateSessionContext() → WhyThisMatters Component
Pattern Data → Related Patterns Display
Active Targets → TargetContext Component
```

## Key Concepts

### 1. Rep Targets Override Playbook Defaults
Hierarchy:
1. **Playbook** = Team-wide defaults (set in Playbook page)
2. **Rep Target** = Coaching commitment (set in session)
3. **Override Clear** = UI explicitly shows when rep target differs from default

Example:
```
Playbook: "All reps book 8 meetings/month"
Coach: "During session, set rep-specific target: 10 meetings this month"
Result: This rep tracked against 10, not 8
Display: TargetContext shows "Rep-specific target (overrides team default)"
```

### 2. Pattern-Driven Coaching
Top performer patterns inform:
- Session priorities ("Why this matters")
- Rep comparisons ("Where you differ from leaders")
- Coaching focus ("What to change")

Example Flow:
```
Team Analysis Finds: "Top performers work 3-4 accounts deeply"
Rep Comparison Shows: "Marcus works 8 accounts with sporadic follow-up"
Session Context Suggests: "Focus on account consolidation & consistent follow-up"
Coaching Target Sets: "5 core accounts with weekly touches"
Rep Page Displays: Target progress, account activity, consistency metrics
```

### 3. Progress Tracking Across Pages
When a target is set:
- Today shows pacing risk (if enough time has passed)
- Overview shows target in team progress section
- Rep page shows granular progress
- Coaching tab shows target in active coaching plan

## Implementation Files

### Core Logic
- `lib/performance-patterns.ts` - Analysis functions
- `lib/signal-generator.ts` - Daily signal generation

### Components
- `components/overview/top-performer-patterns.tsx` - Pattern display
- `components/rep-detail/rep-comparison.tsx` - Comparison display
- `components/shared/target-context.tsx` - Target display
- `components/coaching/why-this-matters.tsx` - Session context
- `components/shared/target-pacing.tsx` - Progress display
- `components/shared/quick-target-check.tsx` - Sidebar summary

### Pages
- `app/(app)/today/page.tsx` - Daily actions
- `app/(app)/overview/page.tsx` - Team analysis
- `app/(app)/reps/[id]/page.tsx` - Rep detail
- `app/(app)/coaching/page.tsx` - Session management

## Data Models

### Rep Target (in session workflow)
```typescript
interface RepTarget {
  id: string
  repId: string
  metric: "meetings_booked" | "prospecting_time" | ... // 8 metrics
  targetValue: number
  timeFrame: "daily" | "weekly" | "monthly"
  createdFromSessionId?: string // Links back to coaching session
  status: "active" | "completed" | "cancelled"
}
```

### Performance Pattern (from analysis)
```typescript
interface PerformancePattern {
  title: string
  plainEnglishInsight: string
  impactArea: "pipeline" | "meetings" | "response" | ...
  repsMatching: string[] // Rep IDs
  topPerformersCount: number
  actionableCoachingFocus?: string
}
```

### Rep Comparison (individual analysis)
```typescript
interface RepVsTeamComparison {
  metric: string
  repValue: number
  teamAverage: number
  topPerformerValue: number
  variance: "leading" | "above-average" | "average" | "below-average" | "lagging"
  insight: string // Plain English
}
```

## UX Principles

### 1. Everything Connects
- No isolated features
- Data from one page informs another
- Manager sees one continuous workflow

### 2. Plain English > Vague AI
All insights use concrete metrics:
- "Lena creates more pipeline from similar outreach" (not "Lena is stronger")
- "Tom's response rate leads team despite lower volume" (not "Tom's outreach is better")
- "Asha's morning activity weak but afternoon follow-up strong" (not "Asha has inconsistent activity")

### 3. Clear Override Hierarchy
When rep target differs from playbook default, the UI must make it obvious:
- Color coding
- Explicit labels ("Rep-specific target override")
- Side-by-side comparison
- Change history

### 4. One Click from Insight to Action
- See pattern → Click to rep page
- See comparison → Click to coaching session
- See target → Click to set/edit in session
- See alert → Click to schedule coaching

## Success Metrics

Product feels connected when:
1. Manager can trace signal from Today → to pattern in Overview → to comparison on Rep page → to coaching session context
2. Target set in coaching session immediately visible in Today pacing
3. All pages tell the same story from different angles
4. Manager never feels context switching between screens

The app should feel like opening different pages of one continuous document, not switching between separate apps.
