# Connected Coaching System - Implementation Checklist

## ✅ Core Infrastructure Built

### Data Layer
- [x] `lib/performance-patterns.ts` - Pattern analysis engine
  - [x] `analyzeTopPerformerPatterns()` - Identify leader behaviors
  - [x] `compareRepToTeam()` - Individual rep comparisons
  - [x] `generateSessionContext()` - Coaching narrative generation
  
- [x] `lib/signal-generator.ts` - Enhanced signal generation
  - [x] Activity-based signals (existing)
  - [x] Target pacing signals (new)
  - [x] Coaching readiness signals (new)
  - [x] Signal grouping and prioritization

### Components Built
- [x] `components/overview/top-performer-patterns.tsx` - Pattern display for Overview
- [x] `components/rep-detail/rep-comparison.tsx` - Rep vs team/top performers
- [x] `components/shared/target-context.tsx` - Rep targets with override context
- [x] `components/coaching/why-this-matters.tsx` - Session context narrative

### Component Integration
- [x] `components/rep-detail/coaching-hub.tsx` - Updated to include:
  - [x] Rep comparisons display
  - [x] Target context integration
  - [x] Coaching targets section

### Page Updates
- [x] `app/(app)/reps/[id]/page.tsx` - Updated to:
  - [x] Fetch all reps for comparisons
  - [x] Pass allReps to CoachingHub
  - [x] Maintain target data flow

### Documentation
- [x] `CONNECTED_SYSTEM_ARCHITECTURE.md` - System design and principles
- [x] `INTEGRATION_GUIDE.md` - Component usage patterns

---

## 🔗 Data Flow Implementation (Ready to Connect)

### Today Page Integration
**Status:** Ready for integration

```tsx
// What needs to happen:
1. Fetch reps and targets
2. Call generateSignals(reps, targets, insights)
3. Filter for high-priority signals
4. Display in signal feed
5. Link to rep page / coaching session / target detail
```

**Components to use:**
- Signal cards (render headline + supportText + actionLabel)
- Click → navigate to rep page or schedule coaching
- Show "behind pace" alerts for active targets

### Overview Page Integration
**Status:** Ready for integration

```tsx
// What needs to happen:
1. Fetch all reps
2. Call analyzeTopPerformerPatterns(reps)
3. Render TopPerformerPatterns component
4. Show team attainment metrics
5. Show target progress rollup
```

**Components to use:**
- `<TopPerformerPatterns patterns={patterns} />`
- Chart showing team targets vs progress
- Rep cards showing current targets

### Rep Detail Page
**Status:** Partially implemented

```tsx
// ✅ Already done:
- Fetches all reps
- Passes allReps to CoachingHub
- CoachingHub renders RepComparison
- CoachingHub shows TargetContext

// ⚠️  Still needed:
- Ensure real data flows to comparisons
- Verify target updates propagate
- Test signal generation based on rep data
```

### Coaching Session Workspace
**Status:** Ready for integration

```tsx
// What needs to happen:
1. Fetch rep, all reps, active targets, related insights
2. Generate comparisons
3. Render WhyThisMatters component
4. Show active targets
5. Enable target creation form
```

**Components to use:**
- `<WhyThisMatters rep={rep} insight={insight} comparisons={comparisons} patterns={patterns} />`
- `<TargetContext targets={targets} showOverrideOnly={false} />`
- Target creation form (integrate with TargetContext)

---

## 🚀 Remaining Implementation Tasks

### 1. Overview Page - Team Metrics & Patterns
**Files to create/modify:**
- `app/(app)/overview/page.tsx`
  - Fetch all reps
  - Calculate patterns
  - Render TopPerformerPatterns
  - Show team-level targets in progress

**Expected output:**
```
Overview
├─ Team Attainment [charts]
├─ Activity Comparison [table]
├─ What Top Performers Do Differently [pattern cards]
└─ Targets in Progress [rep progress cards]
```

### 2. Today Page - Daily Signals
**Files to create/modify:**
- `app/(app)/today/page.tsx` (if exists) or create new
  - Fetch reps, targets, insights
  - Call generateSignals()
  - Filter high-priority signals
  - Render signal feed
  - Add coaching session quick-create

**Expected output:**
```
Today
├─ Quick Actions [button]
├─ High Priority Signals
│  ├─ Pacing risk cards (click to check in)
│  ├─ Coaching opportunity cards (click to schedule)
│  ├─ Pattern shift alerts
│  └─ Wins/momentum cards
└─ Reps to Check In With [quick links]
```

### 3. Coaching Session Workspace
**Files to create/modify:**
- `components/coaching/coaching-session-workspace.tsx` (if exists)
  - Integrate WhyThisMatters
  - Show active targets + override status
  - Target creation form
  - Session tracking

**Expected output:**
```
Coaching Session
├─ Why This Session Matters [context]
├─ Rep Summary [metrics]
├─ Talking Points [checklist]
├─ Active Targets [with override context]
├─ Add New Target [form]
├─ Action Items [list]
└─ Save / Complete [buttons]
```

### 4. Signal-Based Alerts
**Files to create/modify:**
- Create `components/shared/signal-card.tsx`
  - Render ManagerSignal
  - Show urgency indicators
  - Add action buttons
  - Link to navigation

**Expected component:**
```tsx
<SignalCard 
  signal={signal}
  onActionClick={(action) => {
    // Navigate to rep page, schedule coaching, etc.
  }}
/>
```

### 5. Target Progress Display
**Files to create/modify:**
- Create/modify `components/shared/target-pacing.tsx`
  - Show progress bar
  - Days remaining
  - Projected completion
  - Behind/on-track/ahead status

**Expected component:**
```tsx
<TargetPacing 
  targets={targets}
  compact={false}
/>
```

---

## 📊 Data Integration Checklist

### For Each Page/Component:

#### Today Page
- [ ] Call `generateSignals(reps, targets, insights)` with real data
- [ ] Pass targets Map and insights Map
- [ ] Sort signals by priority
- [ ] Link signal actions to correct pages
- [ ] Update signal status when rep page viewed

#### Overview Page
- [ ] Call `analyzeTopPerformerPatterns(allReps)`
- [ ] Get team-level targets from database
- [ ] Calculate target progress for each rep
- [ ] Show rollup metrics
- [ ] Update when new targets created

#### Rep Detail Page
- [ ] Verify `compareRepToTeam()` gets full dataset
- [ ] Test comparison values match Overview data
- [ ] Ensure targets update immediately when created
- [ ] Check signal navigation works
- [ ] Validate comparison consistency

#### Coaching Session
- [ ] Load rep, all reps, coaching insight
- [ ] Generate comparisons before session
- [ ] Show related patterns
- [ ] Enable target creation
- [ ] Save targets to database
- [ ] Return to Today/Overview and verify targets visible

---

## 🧪 Testing the Connected System

### Test 1: Pattern Consistency
**Steps:**
1. Go to Overview → See pattern "Top performers work 3-4 accounts"
2. Go to Rep Detail for a rep who works 8+ accounts
3. Verify RepComparison shows "below average" on account focus
4. Schedule coaching session
5. Verify "Why this matters" mentions the pattern
6. Verify coaching focus suggests consolidation

**Expected:** Same pattern appears consistently across all pages

### Test 2: Target Propagation
**Steps:**
1. Schedule coaching session for rep
2. Set target: "5 core accounts" (rep-specific override)
3. View Today page → Verify target appears in signal feed
4. Go to Overview → Verify rep shows in target progress
5. Return to Rep detail → Verify target in ActiveCoachingTargets
6. Check TargetContext → Verify "rep-specific override" shown

**Expected:** Target visible everywhere within minutes, override clearly marked

### Test 3: Comparison Accuracy
**Steps:**
1. Note team averages on Overview
2. Go to individual Rep page
3. Check RepComparison shows same team averages
4. Add a new rep with very different scores
5. Regenerate comparisons
6. Verify new rep included in calculations

**Expected:** Comparisons always match team data, update when roster changes

### Test 4: Signal Actionability
**Steps:**
1. See pacing_risk signal on Today page
2. Click "Check in" → Should navigate to rep detail
3. See coaching_ready signal on Today page
4. Click "Schedule session" → Should open coaching session creation
5. Create session, set target
6. Return to Today → Target now visible in target progress signal

**Expected:** Signals drive real actions, flow continues to completion

### Test 5: Plain English Quality
**Steps:**
1. Read every insight (pattern, comparison, coaching context)
2. Check that NO insight uses vague terms like "synergy" or "optimization"
3. Verify every insight maps to concrete behavior (account count, response rate, etc.)
4. Verify coaching focus is actionable (specific behavior to change)

**Expected:** Manager can explain every insight without ambiguity

---

## 📋 Configuration & Setup

### Environment Variables (if needed)
- None required for connected system (all internal logic)

### Database Queries Needed
```sql
-- For Today page signals
SELECT reps.*, rep_targets.*, coaching_insights.*
FROM reps
LEFT JOIN rep_targets ON reps.id = rep_targets.rep_id
LEFT JOIN coaching_insights ON reps.id = coaching_insights.rep_id
WHERE reps.team_id = $1

-- For Overview page
SELECT reps.*, MAX(rep_daily_metrics.time_prospecting) 
FROM reps
JOIN rep_daily_metrics ON reps.id = rep_daily_metrics.rep_id
WHERE reps.team_id = $1
GROUP BY reps.id

-- For Rep detail
SELECT * FROM reps WHERE id = $1
SELECT * FROM reps WHERE team_id = $2  -- For all reps
SELECT * FROM rep_targets WHERE rep_id = $1 AND status = 'active'
```

### Component Props Validation
- [ ] CoachingHub receives allReps array
- [ ] TopPerformerPatterns receives patterns array
- [ ] RepComparison receives comparisons array
- [ ] TargetContext receives targets with context metadata
- [ ] WhyThisMatters receives all required props

---

## 🎯 Success Validation

Manager using Kevi should be able to:

1. **View Today** → See signals about pacing, patterns, and coaching
2. **Click signal** → Navigate to relevant page with full context
3. **See Overview** → Understand what top performers do differently
4. **See Rep page** → Compare this rep to team and leaders
5. **Schedule coaching** → See exactly why this session matters
6. **Set target** → See it appear in multiple places immediately
7. **Return to Today** → See target progress tracked
8. **Trace narrative** → Signal → Pattern → Comparison → Coaching → Target → Progress

All pages should tell the SAME story from different angles.

---

## 🔍 Debugging Checklist

If data doesn't flow:

- [ ] Verify allReps fetched with correct fields
- [ ] Check compareRepToTeam() receives full dataset
- [ ] Validate analyzeTopPerformerPatterns() has enough reps
- [ ] Ensure targets passed to all components that need them
- [ ] Confirm signal generation includes targets + insights
- [ ] Check that target updates call right endpoints
- [ ] Verify target ID matches in TargetContext display
- [ ] Validate comparison values match source data

---

## 📝 Files Summary

### New Files Created (7)
1. `lib/performance-patterns.ts` - Analysis engine
2. `components/overview/top-performer-patterns.tsx` - Pattern display
3. `components/rep-detail/rep-comparison.tsx` - Comparison component
4. `components/shared/target-context.tsx` - Target display
5. `components/coaching/why-this-matters.tsx` - Session context
6. `CONNECTED_SYSTEM_ARCHITECTURE.md` - Design doc
7. `INTEGRATION_GUIDE.md` - Implementation guide

### Files Modified (3)
1. `components/rep-detail/coaching-hub.tsx` - Added comparisons + targets
2. `app/(app)/reps/[id]/page.tsx` - Added allReps fetch
3. `lib/signal-generator.ts` - Enhanced with new signal types

### Total New Code
- ~500 lines of analysis logic
- ~300 lines of UI components
- ~400 lines of documentation

---

## 🚢 Deployment Readiness

Before shipping:
- [ ] All components render without errors
- [ ] Data flows correctly through props
- [ ] Comparisons calculate consistently
- [ ] Targets save and propagate
- [ ] Signals generate correctly
- [ ] Navigation works between pages
- [ ] Plain English validation passed
- [ ] Performance testing (comparisons on 100+ reps)
- [ ] Mobile responsive testing
- [ ] Accessibility testing (ARIA labels, keyboard nav)

---

## 📞 Support & Next Steps

### Common Issues & Solutions

**Issue:** Comparisons show same values for all reps
- Solution: Verify allReps includes variety of performance levels

**Issue:** Targets don't appear in TargetContext
- Solution: Check target.status === "active" and props passed correctly

**Issue:** Patterns don't match reps visible
- Solution: Run analyzeTopPerformerPatterns() with full reps dataset, check trending logic

**Issue:** Signals not actionable
- Solution: Verify actionLabel and action handler in signal card component

### Questions & Validation
- Does every signal have a clear action?
- Can manager understand every insight without domain knowledge?
- Are comparisons consistent across pages?
- Do targets propagate within 1 second of creation?
- Does one page's insight connect to another page's display?

If all checks pass, the connected coaching system is production-ready!
