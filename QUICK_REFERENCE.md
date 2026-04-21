# Quick Reference: Connected Coaching System

## 🎯 What Was Built

A **complete data layer + core components** for Kevi's connected coaching system. Everything you need to turn isolated pages into one continuous workflow.

---

## 📦 What You Get

### Core Engines (lib/)
- **`performance-patterns.ts`** - Analyzes top performers + compares reps + generates coaching context
- **`signal-generator.ts`** - Enhanced to include target pacing + coaching readiness signals

### UI Components (components/)
- **`top-performer-patterns.tsx`** - Displays what leaders do differently
- **`rep-comparison.tsx`** - Shows rep vs team/leaders
- **`target-context.tsx`** - Displays targets with override status  
- **`why-this-matters.tsx`** - Coaching session narrative

### Integration
- **`coaching-hub.tsx`** - Updated to include comparisons + targets
- **`reps/[id]/page.tsx`** - Updated to fetch all reps for analysis

### Documentation
- **`CONNECTED_SYSTEM_ARCHITECTURE.md`** - System design
- **`INTEGRATION_GUIDE.md`** - How to use components
- **`IMPLEMENTATION_CHECKLIST.md`** - Remaining tasks
- **`COMPONENT_CONNECTION_DIAGRAM.md`** - Visual reference
- **`IMPLEMENTATION_SUMMARY.md`** - What was built

---

## 🔗 The Three Core Functions

### 1. Analyze Patterns
```tsx
import { analyzeTopPerformerPatterns } from "@/lib/performance-patterns"

const patterns = analyzeTopPerformerPatterns(allReps)
// Returns: 4 plaintext patterns of what leaders do differently
// Use in: Overview page, Coaching sessions
```

### 2. Compare Rep to Team
```tsx
import { compareRepToTeam } from "@/lib/performance-patterns"

const comparisons = compareRepToTeam(rep, allReps)
// Returns: 6 key metrics comparing rep to team avg + top performers
// Use in: Rep detail page, Coaching sessions
```

### 3. Generate Session Context
```tsx
import { generateSessionContext } from "@/lib/performance-patterns"

const narrative = generateSessionContext(rep, "account-focus", comparisons)
// Returns: Plain English "why this matters" story
// Use in: Coaching session workspace
```

---

## 🎨 The Four Display Components

### TopPerformerPatterns
**For:** Overview page
**Props:** `patterns`
**Shows:** 4 pattern cards with plain English insights

```tsx
import { TopPerformerPatterns } from "@/components/overview/top-performer-patterns"

<TopPerformerPatterns patterns={patterns} />
```

### RepComparison
**For:** Rep detail page
**Props:** `comparisons`, `compact?: boolean`
**Shows:** This rep vs team vs top performers

```tsx
import { RepComparison } from "@/components/rep-detail/rep-comparison"

<RepComparison comparisons={comparisons} compact={false} />
```

### TargetContext
**For:** Rep detail page + Coaching sessions
**Props:** `targets`, `showOverrideOnly?: boolean`
**Shows:** Coaching targets with override status

```tsx
import { TargetContext } from "@/components/shared/target-context"

<TargetContext targets={targets} />
```

### WhyThisMatters
**For:** Coaching session workspace
**Props:** `rep`, `insight?`, `comparisons?`, `relatedPatterns?`
**Shows:** Coaching narrative + context

```tsx
import { WhyThisMatters } from "@/components/coaching/why-this-matters"

<WhyThisMatters 
  rep={rep}
  comparisons={comparisons}
  relatedPatterns={patterns}
/>
```

---

## 📊 Signal Types (Enhanced)

### Activity Signals (Existing)
- `momentum` - Building more pipeline than usual
- `risk` - May fall behind pace
- `efficiency-issue` - High activity, weak outcomes
- `drop-off` - Engagement declining
- `positive-outlier` - Pacing ahead

### NEW: Target Pacing Signals
- `pacing_risk` - "Marcus: Behind pace on meetings"
- Shows target progress with days remaining

### NEW: Coaching Readiness Signals
- `coaching_ready` - "Coaching opportunity: Account focus"
- Links to coaching insight details

---

## 🚀 Integration Checklist

### Today Page
- [ ] Fetch reps + targets + insights
- [ ] Call `generateSignals(reps, targets, insights)`
- [ ] Display signals in feed
- [ ] Wire click actions to navigate to rep page / coaching

### Overview Page
- [ ] Fetch all reps
- [ ] Call `analyzeTopPerformerPatterns(reps)`
- [ ] Render `<TopPerformerPatterns patterns={patterns} />`
- [ ] Add team targets progress section
- [ ] Show reps working toward coaching targets

### Rep Detail Page
- [x] Already integrated
- [ ] Test comparisons with real data
- [ ] Verify targets appear immediately after creation
- [ ] Check signal navigation works

### Coaching Session
- [ ] Fetch rep + all reps + coaching insight
- [ ] Generate comparisons and patterns
- [ ] Render `<WhyThisMatters>`
- [ ] Show `<TargetContext>`
- [ ] Enable target creation
- [ ] Verify target appears in Today/Overview after save

---

## ✨ Key Principles

### One Continuous Workflow
```
Today (see signal) 
  → Rep Detail (see comparison)
  → Coaching (set target)
  → Today (see target progress)
  → Overview (target in team summary)
```

### Plain English Insights
✅ "Marcus works 8 accounts vs top performers' 3-4"
❌ "Marcus shows account optimization challenges"

### Clear Override Hierarchy
- Playbook default: 8 meetings/week
- Rep target: 10 meetings/week ← OVERRIDE
- Display: "Rep-specific target (overrides team default)"

### Data Flows Once
1. Analysis layer calculates patterns + comparisons
2. Components receive data via props
3. Pages render components
4. User takes action (schedule coaching, set target)
5. Target saved to database
6. Appears in Today/Overview/Rep page
7. Loop continues

---

## 🧪 Test Scenarios

### Scenario 1: Pattern Consistency
1. See pattern on Overview ("Top performers work 3-4 accounts")
2. Go to Rep detail for rep working 8 accounts
3. See RepComparison: "below average" on account focus
4. Schedule coaching → See "Why this matters" mentions pattern

### Scenario 2: Target Propagation
1. Create target: "5 core accounts"
2. Go to Today → Target appears in pacing signal
3. Go to Overview → Rep shows in target progress
4. Go to Rep page → Target in ActiveCoachingTargets
5. All within 1 second

### Scenario 3: Comparison Accuracy
1. Note team average on Overview
2. Go to Rep detail → Verify same team average in RepComparison
3. Add new rep to team
4. Regenerate comparisons → New rep included

### Scenario 4: Signal Actionability
1. Click signal on Today page
2. Should navigate to correct page with context
3. Perform action (set target, schedule session)
4. Return to Today → Signal updated

---

## 📁 File Map

```
lib/
├─ performance-patterns.ts      ← Core analysis engine
└─ signal-generator.ts          ← Enhanced signal generation

components/
├─ overview/
│  └─ top-performer-patterns.tsx ← Pattern display
├─ rep-detail/
│  ├─ coaching-hub.tsx           ← (Updated) Main rep view
│  ├─ rep-comparison.tsx         ← Comparison display
│  └─ [other existing components]
├─ coaching/
│  └─ why-this-matters.tsx       ← Session context
├─ shared/
│  ├─ target-context.tsx         ← Target display
│  └─ [other existing components]
└─ [other existing components]

app/(app)/
├─ reps/[id]/page.tsx           ← (Updated) Rep detail
├─ today/page.tsx               ← (Ready for integration)
├─ overview/page.tsx            ← (Ready for integration)
└─ [other pages]

docs/
├─ CONNECTED_SYSTEM_ARCHITECTURE.md
├─ INTEGRATION_GUIDE.md
├─ IMPLEMENTATION_CHECKLIST.md
├─ COMPONENT_CONNECTION_DIAGRAM.md
└─ IMPLEMENTATION_SUMMARY.md
```

---

## 🔥 The Core Architecture

```
Analysis Layer (performance-patterns.ts)
         ↓ (calculates once, shares everywhere)
Component Layer (rep-comparison, target-context, etc.)
         ↓ (render with data)
Page Layer (today, overview, rep detail, coaching)
         ↓ (manager clicks)
Action (navigate, schedule, set target)
         ↓ (database saves)
Signal Layer (generateSignals updates)
         ↓ (manager sees updates everywhere)
Back to Pages (continuous feedback loop)
```

---

## ✅ Before You Ship

- [ ] All comparisons calculate from full team dataset
- [ ] Targets propagate to Today/Overview/Rep page immediately
- [ ] Override status always visible
- [ ] Every insight is plain English
- [ ] One signal thread connects all pages
- [ ] Coaching context uses patterns + comparisons
- [ ] Mobile responsive
- [ ] Keyboard accessible
- [ ] Performance tested with 100+ reps

---

## 🎓 Understanding the Pattern

**Top Performers:** Leaders who are consistently improving, with high top-rep similarity scores

**Patterns:** Behaviors that distinguish top performers (e.g., account depth, response rates, consistency)

**Comparisons:** How one rep compares to team average + top performers on key metrics

**Signals:** Actionable alerts based on activity + pacing + coaching readiness

**Context:** "Why this matters" narrative that links signals → patterns → comparisons → coaching targets

**Targets:** Rep-specific coaching commitments that override playbook defaults

**Override:** Rep target is different from team default (explicitly marked in UI)

---

## 📞 Common Questions

**Q: Where do patterns come from?**
A: Analyzed from team data in `analyzeTopPerformerPatterns()`. Top performers are reps with high similarity scores who are improving.

**Q: How are comparisons calculated?**
A: In `compareRepToTeam()` - calculated once, passed to components, displayed consistently across pages.

**Q: When are targets propagated?**
A: Immediately after creation. Database save → signal generated → visible in Today/Overview/Rep page.

**Q: What makes insight "plain English"?**
A: Uses concrete metrics (account count, response rate, hours). No AI jargon. Every insight maps to actionable behavior.

**Q: How does one page know about another?**
A: Through data layer. Analysis calculates once, pages display differently, but show same underlying data.

---

## 🚢 You're Ready!

The connected coaching system is built. Every component is ready. Documentation is complete. Just wire the pages to this foundation and you have a seamless, connected coaching workflow.

**Good luck! 🎯**
