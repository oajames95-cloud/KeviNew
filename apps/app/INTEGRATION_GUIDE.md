# Integration Guide: Using the Connected Coaching System

## Quick Start

### 1. Overview Page - Show Top Performer Patterns

```tsx
import { TopPerformerPatterns } from "@/components/overview/top-performer-patterns"
import { analyzeTopPerformerPatterns } from "@/lib/performance-patterns"

export default function OverviewPage() {
  // Fetch all reps from API/DB
  const patterns = analyzeTopPerformerPatterns(reps)
  
  return (
    <div>
      {/* ... other sections ... */}
      <TopPerformerPatterns patterns={patterns} />
    </div>
  )
}
```

### 2. Rep Detail Page - Show Comparison + Targets

```tsx
import { CoachingHub } from "@/components/rep-detail/coaching-hub"
import { compareRepToTeam } from "@/lib/performance-patterns"

export default function RepDetailPage() {
  // Fetch individual rep and all reps for comparison
  const rep = await fetchRep(id)
  const allReps = await fetchAllReps()
  const targets = await fetchRepTargets(id)
  
  return (
    <CoachingHub 
      rep={rep} 
      targets={targets}
      allReps={allReps}
    />
  )
}
```

### 3. Coaching Session - Show "Why This Matters"

```tsx
import { WhyThisMatters } from "@/components/coaching/why-this-matters"
import { compareRepToTeam, analyzeTopPerformerPatterns } from "@/lib/performance-patterns"

export default function CoachingSessionWorkspace() {
  const comparisons = compareRepToTeam(rep, allReps)
  const patterns = analyzeTopPerformerPatterns(allReps)
  
  return (
    <CoachingSessionWorkspace>
      <WhyThisMatters
        rep={rep}
        insight={coachingInsight}
        comparisons={comparisons}
        relatedPatterns={patterns}
      />
      {/* ... session content ... */}
    </CoachingSessionWorkspace>
  )
}
```

## Component Integration Patterns

### Pattern 1: Rep Detail Page Full Implementation

The `CoachingHub` component orchestrates multiple sub-components:

```tsx
<CoachingHub rep={rep} targets={targets} allReps={allReps}>
  {/* Internally renders */}
  ├─ Rep Hero (name, trend, scores)
  ├─ Week Deltas (meeting/SQL/activity changes)
  ├─ HourlyHeatmap (daily activity pattern)
  ├─ QualityMetrics (response/open rates)
  ├─ RepComparison (this rep vs team/top performers)
  ├─ TargetContext (active coaching targets)
  ├─ CRMAccountActivity (CRM integration)
  ├─ CoachingItemsList (related insights)
  ├─ RecentSessionsList (past sessions)
  └─ CoachingSessionPanel (session detail view)
</CoachingHub>
```

### Pattern 2: Data Passing for Comparisons

```tsx
// In page/parent component
const allReps = await db.reps.findMany()
const rep = allReps.find(r => r.id === targetRepId)

// Generate comparisons
const comparisons = compareRepToTeam(rep, allReps)
// → Returns array of RepVsTeamComparison objects

// Pass to component
<RepComparison comparisons={comparisons} compact={false} />

// Component renders comparison cards
// Each card shows: metric, rep value, team avg, top perf, variance status
```

### Pattern 3: Pattern-Driven Session Context

```tsx
// Before coaching session starts
const patterns = analyzeTopPerformerPatterns(allReps)
const comparisons = compareRepToTeam(rep, allReps)

// Find patterns relevant to this rep's coaching theme
const relatedPatterns = patterns.filter(p => 
  p.impactArea.includes(coachingInsight.theme)
)

// Generate narrative context
<WhyThisMatters
  rep={rep}
  insight={coachingInsight}
  comparisons={comparisons}
  relatedPatterns={relatedPatterns}
/>

// Output: "Why this matters" narrative + pattern cards + comparison context
```

## Target Override Workflow

### Setting a Rep-Specific Target

```tsx
// In Coaching Session Workspace
const setCoachingTarget = async (metric: RepTargetMetric, value: number) => {
  // Create target
  const target = await db.repTargets.create({
    repId: rep.id,
    createdFromSessionId: session.id,
    metric,
    targetValue: value,
    timeFrame: 'weekly',
    notes: 'Set during coaching session on Nov 5'
  })
  
  // TargetContext component will show:
  // - Blue highlight "Rep-specific target (overrides team default)"
  // - Playbook default: 8 (team default)
  // - Rep target: 10 (this override)
  // - Top performers: 12
}
```

### Displaying Target Override

```tsx
<TargetContext 
  targets={[
    {
      target: repTarget,
      playbookDefault: 8, // From playbook settings
      teamAverage: 8.3,
      topPerformerValue: 11.2,
      isOverride: true // Shows blue indicator
    }
  ]}
/>

// Renders:
// 🔵 Rep-specific target (overrides team default)
// Target: 10 meetings/week
// Team Default: 8 | Top Performers: 12
```

## Data Flow Example: A Complete Session

### Step 1: Manager views Overview
```
analyzeTopPerformerPatterns(allReps)
→ Returns 4 key patterns
→ Renders in TopPerformerPatterns component
→ Shows: "Top pipeline creators work 3-4 accounts deeply"
```

### Step 2: Manager clicks rep to view detail
```
compareRepToTeam(rep, allReps)
→ Returns 6 comparisons
→ Renders in RepComparison component
→ Shows: "Marcus works 8 accounts (vs top perf 3.2) - BELOW AVERAGE"
```

### Step 3: Manager schedules coaching session
```
generateSessionContext(rep, 'account-strategy', comparisons)
→ Returns narrative: "Marcus is working too many accounts with low focus"
→ Renders in WhyThisMatters component
→ Shows coaching focus: "Consolidate account list & increase follow-up"
```

### Step 4: During session, manager sets target
```
Create RepTarget:
  metric: 'account_activity'
  targetValue: 5 (down from 8)
  createdFromSessionId: session.id

TargetContext renders:
  "Rep-specific target override"
  "5 core accounts (was default 8)"
```

### Step 5: After session, progress visible everywhere
```
Today page: Shows "Marcus - 5 accounts pacing" in daily view
Overview: Adds "Marcus" to "Targets in progress" section
Rep page: Displays target in ActiveCoachingTargets
Coaching tab: Shows target in "Active coaching plan"
```

## Common Integration Mistakes to Avoid

### ❌ Wrong: Passing comparisons to multiple pages independently
```tsx
// Each page calculates differently, inconsistent results
function OverviewPage() {
  const comparisons = generateComparisonsLocally() // Different logic
}

function RepPage() {
  const comparisons = generateComparisonsLocally() // Different logic
}
```

### ✅ Right: Calculate once at data layer, share everywhere
```tsx
// Calculate at page/API level
const comparisons = compareRepToTeam(rep, allReps)

// Pass to all components
<TopPerformerPatterns patterns={patterns} />
<RepComparison comparisons={comparisons} />
<WhyThisMatters comparisons={comparisons} />
```

### ❌ Wrong: Hiding target override status
```tsx
// Just shows "Target: 10" with no context
<div>{target.targetValue} meetings</div>
```

### ✅ Right: Make override obvious
```tsx
<TargetContext 
  targets={[{ target, isOverride: true, playbookDefault: 8 }]}
/>
// Shows: "Rep-specific target (overrides team default)"
```

### ❌ Wrong: Disconnected insights
```tsx
// Pattern analysis never links to rep comparisons
const patterns = analyzeTopPerformerPatterns(reps)
const comparisons = compareRepToTeam(rep, allReps)
// No connection between them
```

### ✅ Right: Connect insights throughout workflow
```tsx
// Pattern informs session context
const relatedPatterns = patterns.filter(p => 
  p.actionableCoachingFocus?.includes(rep's weakness)
)

// Session context drives target setting
// Target appears in overview and today
// Creates one continuous narrative
```

## Testing the Integration

### Verify Data Flows Correctly
1. Go to Overview → See top performer patterns
2. Click a rep → See their comparison vs patterns
3. Schedule coaching session → See "Why this matters" context
4. Set target during session → See target in Today pacing + Rep page
5. Go back to Overview → See rep in target progress section

### Check for Consistency
- Same rep always shows same comparison values across pages
- Patterns stay consistent (top performers don't change mid-session)
- Targets visible immediately after creation
- Override status always clear (never hidden)

### Validate Plain English
- All insights use concrete metrics, not AI jargon
- Manager can trace insight to specific behavior
- Coaching focus is actionable (not abstract)
- Comparisons map to real performance drivers

## Performance Considerations

### Caching Patterns
```tsx
// Patterns don't change frequently - cache for session
const patterns = useMemo(
  () => analyzeTopPerformerPatterns(allReps),
  [allReps]
)
```

### Lazy Loading Comparisons
```tsx
// Only load when viewing rep detail
if (isDetailViewOpen) {
  const comparisons = compareRepToTeam(rep, allReps)
}
```

### Batch Updates
```tsx
// Set multiple targets in one session
const targets = await Promise.all([
  createTarget(metric1),
  createTarget(metric2),
  createTarget(metric3)
])
// All visible in TargetContext immediately
```

## Architecture Validation Checklist

Before shipping:
- [ ] All reps data passed to CoachingHub
- [ ] Comparisons generated from full dataset
- [ ] Patterns analyzed once and passed to components
- [ ] Target overrides clearly marked with playbookDefault
- [ ] Session context uses pattern + comparison data
- [ ] Today/Overview/Rep pages all receive updated targets
- [ ] "Why this matters" uses concrete metrics
- [ ] One narrative thread connects all pages
