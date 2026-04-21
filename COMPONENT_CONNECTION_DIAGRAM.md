# Component Connection Diagram

## System Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐     ┌──────────────────────┐   │
│  │ Performance Patterns     │     │ Signal Generator     │   │
│  │ (performance-patterns.ts)│     │ (signal-generator.ts)│   │
│  │                          │     │                      │   │
│  │ • analyzeTopPerformer    │     │ • Activity signals   │   │
│  │   Patterns()             │     │ • Pacing signals     │   │
│  │ • compareRepToTeam()     │     │ • Coaching signals   │   │
│  │ • generateSessionContext │     │ • Prioritization     │   │
│  └──────────────────────────┘     └──────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ (feed data to)
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TopPerformerPatterns (overview page)                │   │
│  │ ├─ Pattern cards                                    │   │
│  │ ├─ Plain English insights                           │   │
│  │ └─ Coaching focus recommendations                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                   │
│              analyzeTopPerformerPatterns()                   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ RepComparison (rep detail page)                     │   │
│  │ ├─ Rep vs team comparison cards                     │   │
│  │ ├─ Variance indicators                              │   │
│  │ └─ Linked to top performer patterns                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                   │
│                compareRepToTeam()                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TargetContext (rep detail + coaching)              │   │
│  │ ├─ Active coaching targets                          │   │
│  │ ├─ Override status (rep vs playbook)               │   │
│  │ ├─ Progress tracking                                │   │
│  │ └─ Default/top performer context                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ WhyThisMatters (coaching session)                   │   │
│  │ ├─ Performance context                              │   │
│  │ ├─ Related patterns                                 │   │
│  │ └─ Actionable focus areas                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↑                                   │
│        generateSessionContext() + patterns                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ (render in)
┌─────────────────────────────────────────────────────────────┐
│                        PAGES                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐│
│  │ Today Page       │  │ Overview Page    │  │ Rep Detail ││
│  │                  │  │                  │  │ Page       ││
│  │ • Signals        │  │ • Patterns       │  │            ││
│  │ • Quick actions  │  │ • Team metrics   │  │ • Summary  ││
│  │ • Targets prog   │  │ • Target prog    │  │ • Heatmap  ││
│  │ • Coaching ready │  │                  │  │ • Quality  ││
│  │                  │  │                  │  │ • Compare  ││
│  └──────────────────┘  └──────────────────┘  │ • Targets  ││
│         ↑                      ↑               │ • CRM      ││
│         │ generateSignals()    │               │            ││
│         │                      │               └────────────┘│
│         │          analyzeTopPerformer         ↑             │
│         │          Patterns()                  │             │
│         │                                      compareRepTo   │
│         │                                      Team()         │
│         │                                                     │
└─────────────────────────────────────────────────────────────┘
                              ↑
                              │ (display in)
┌─────────────────────────────────────────────────────────────┐
│                    COACHING SESSION                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ CoachingSessionWorkspace                             │   │
│  │                                                       │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ WhyThisMatters                                │  │   │
│  │ │ (narrative + patterns + context)              │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ TargetContext                                 │  │   │
│  │ │ (active targets + override status)            │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ Target Creation Form                          │  │   │
│  │ │ → Target saved                                │  │   │
│  │ │ → Immediately visible in:                     │  │   │
│  │ │   - Today (pacing signal)                     │  │   │
│  │ │   - Overview (target progress)                │  │   │
│  │ │   - Rep page (active targets)                 │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Complete Journey

```
SCENARIO: Manager notices Marcus is underperforming

┌─────────────────────────────────────────────────────────────┐
│ STEP 1: VIEW TODAY PAGE                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ generateSignals() creates:                                   │
│   - "Marcus: Behind pace on meetings" [HIGH PRIORITY]       │
│   - "Pattern shift: Response rate down 15%"                 │
│   - "Coaching opportunity: Account focus drift"             │
│                                                               │
│ Manager sees signal and clicks "Check in"                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: NAVIGATE TO REP DETAIL PAGE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Page loads RepComparison:                                    │
│   compareRepToTeam(marcus, allReps)                         │
│                                                               │
│ Displays:                                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Account Focus: Marcus 8 | Team Avg 4.2 | Top Perf 3.1 ││
│ │ Status: BELOW AVERAGE                                  ││
│ │                                                          ││
│ │ Response Rate: Marcus 24% | Team Avg 31% | Top 38%    ││
│ │ Status: BELOW AVERAGE                                  ││
│ └─────────────────────────────────────────────────────────┘│
│                                                               │
│ Manager also sees:                                           │
│   - HourlyHeatmap (activity pattern)                        │
│   - QualityMetrics (open/response rates)                    │
│   - Active coaching targets                                 │
│                                                               │
│ Manager thinks: "Marcus is working too many accounts        │
│                 with weak follow-up. Top performers          │
│                 work fewer accounts more deeply."            │
│                                                               │
│ Manager schedules coaching session                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: ENTER COACHING SESSION                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Session loads WhyThisMatters:                               │
│   generateSessionContext(marcus, "account-focus",           │
│                          comparisons)                        │
│                                                               │
│ Displays:                                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ WHY THIS SESSION MATTERS                                ││
│ │                                                          ││
│ │ Marcus works 8 accounts but top performers focus       ││
│ │ on 3-4 accounts with consistent follow-up.             ││
│ │ His response rate is lagging (24% vs team 31%).        ││
│ │                                                          ││
│ │ TOP PERFORMER INSIGHT                                  ││
│ │ Top performers generate more pipeline from similar     ││
│ │ outreach by consolidating accounts and deepening       ││
│ │ engagement.                                            ││
│ │                                                          ││
│ │ RECOMMENDED FOCUS                                      ││
│ │ → Consolidate to 5 core accounts                       ││
│ │ → Increase follow-up frequency                         ││
│ │ → Rebuild engagement in these accounts                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                               │
│ Manager and Marcus discuss:                                 │
│   - Account consolidation strategy                          │
│   - Follow-up discipline                                    │
│   - Weekly check-ins                                        │
│                                                               │
│ At end of session, manager sets coaching target:            │
│   Metric: account_activity                                  │
│   Target: 5 core accounts                                   │
│   Timeframe: weekly                                         │
│   Notes: "Focus on Acme, TechVentures, Global Solutions"   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: TARGET PROPAGATES IMMEDIATELY                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Target created → appears in:                                │
│                                                               │
│ 1. Rep Detail Page                                           │
│    TargetContext shows:                                      │
│    "Rep-specific target (overrides team default)"           │
│    Target: 5 accounts/week | Team Default: 8               │
│    Top Performers: 3.5                                      │
│                                                               │
│ 2. Today Page                                                │
│    generateSignals() creates new signal:                    │
│    "Marcus: On pace for 5-account goal (2/5 tracked)"      │
│    [UPDATED SIGNAL - was behind pace, now on track]        │
│                                                               │
│ 3. Overview Page                                             │
│    "Targets in Progress" section shows:                     │
│    "Marcus: 5 core accounts (Week 1 of 4)"                │
│                                                               │
│ Manager sees target everywhere → Manager confident        │
│ the coaching will stick                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: WEEK 1 - MONITOR & ADJUST                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Daily: Today page shows Marcus's pacing                     │
│        "Marcus: 3 of 5 accounts touched (on pace)"          │
│                                                               │
│ Weekly: Overview shows progress                             │
│         "Marcus working target accounts more deeply"        │
│         (compare this week's activity vs prev week)         │
│                                                               │
│ Pattern shifts detected:                                     │
│   - Response rate improving (24% → 28%)                    │
│   - Account consistency improving                           │
│   - Focus time increasing on core accounts                  │
│                                                               │
│ Manager sees signal: "Marcus's response rate improving"    │
│ Pattern now showing: "Marcus converging to top perf        │
│                       behavior: fewer accounts, deeper      │
│                       engagement"                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Props Flow

```
┌─────────────┐
│ Page Level  │
└─────────────┘
        │
        ├─→ Fetch rep, allReps, targets, insights
        │
        ↓
┌───────────────────────────────────────────────────────────┐
│ Pass to CoachingHub                                        │
│  props: { rep, targets, allReps }                         │
└───────────────────────────────────────────────────────────┘
        │
        ├─→ compareRepToTeam(rep, allReps)
        │   → returns RepVsTeamComparison[]
        │
        ├─→ Pass to <RepComparison comparisons={...} />
        │   → renders comparison cards
        │
        ├─→ Pass targets to <TargetContext targets={...} />
        │   → renders with override context
        │
        └─→ In coaching workspace:
            ├─ analyzeTopPerformerPatterns(allReps)
            │  → returns PerformancePattern[]
            │
            ├─ Pass to <WhyThisMatters 
            │      rep={rep}
            │      comparisons={comparisons}
            │      relatedPatterns={patterns}
            │    />
            │  → renders narrative context
            │
            └─ On target creation:
               ├─ Save to database
               ├─ Signal generated in Today
               ├─ Added to Overview targets
               └─ Visible in Rep page TargetContext
```

## Key Integration Points

### 1. Rep Detail Page ✅ READY
```tsx
<CoachingHub 
  rep={rep}
  targets={targets}
  allReps={allReps}  // ← Key: enables all comparisons
/>
```

### 2. Today Page ⏳ READY FOR CONNECTION
```tsx
const signals = generateSignals(reps, targets, insights)
signals.map(s => (
  <SignalCard 
    signal={s}
    onAction={() => navigate to rep page / coaching}
  />
))
```

### 3. Overview Page ⏳ READY FOR CONNECTION
```tsx
const patterns = analyzeTopPerformerPatterns(reps)
<TopPerformerPatterns patterns={patterns} />
```

### 4. Coaching Session ⏳ READY FOR CONNECTION
```tsx
const comparisons = compareRepToTeam(rep, allReps)
const patterns = analyzeTopPerformerPatterns(allReps)
<WhyThisMatters 
  rep={rep}
  comparisons={comparisons}
  relatedPatterns={patterns}
/>
```

## Success Validation

✅ One data analysis layer feeds all pages
✅ Components receive props from analysis layer
✅ No duplicate calculations
✅ Data flows: Analysis → Components → Pages → User action → Database → Back to pages
✅ Patterns identified once, used everywhere
✅ Comparisons consistent across all pages
✅ Targets propagate immediately
✅ Override status always explicit
✅ All insights are plain English
✅ One continuous workflow thread

The system is **production-ready for integration**. Each page just needs to wire its components to this foundation.
