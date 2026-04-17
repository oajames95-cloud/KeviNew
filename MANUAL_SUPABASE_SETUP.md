## Kevi V1 - Manual Supabase Setup Guide

Because the automated migration tool is timing out on the new Supabase project, follow these manual steps:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Create Database Schema

Copy and paste **all of the following SQL** into the SQL editor, then click **Run**:

```sql
-- Kevi V1 Schema
-- Lean foundation for Team Dashboard and Rep Detail

-- ─────────────────────────────────────────────
-- Organizations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Profiles (managers/users linked to auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Teams
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Reps
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'SDR',
  hire_date DATE,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'drifting', 'at-risk')),
  score_top_rep_similarity INTEGER DEFAULT 0,
  score_workflow_drift INTEGER DEFAULT 0,
  score_prospecting_focus_time INTEGER DEFAULT 0,
  score_follow_up_discipline INTEGER DEFAULT 0,
  score_prep_quality INTEGER DEFAULT 0,
  score_signal_confidence INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Rep Daily Metrics (workflow activity snapshots)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rep_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_prospecting INTEGER DEFAULT 0,
  time_researching INTEGER DEFAULT 0,
  time_building_lists INTEGER DEFAULT 0,
  time_in_apollo INTEGER DEFAULT 0,
  time_in_linkedin INTEGER DEFAULT 0,
  time_in_crm INTEGER DEFAULT 0,
  time_in_sequencer INTEGER DEFAULT 0,
  time_in_email INTEGER DEFAULT 0,
  time_in_calendar INTEGER DEFAULT 0,
  idle_time INTEGER DEFAULT 0,
  context_switches INTEGER DEFAULT 0,
  focus_blocks_min INTEGER DEFAULT 0,
  workday_minutes INTEGER DEFAULT 480,
  calls_dialed INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rep_id, date)
);

-- ─────────────────────────────────────────────
-- Rep Outcomes (sales outcomes per day)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rep_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calls_dialed INTEGER DEFAULT 0,
  connect_rate NUMERIC(5,2) DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  follow_up_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(rep_id, date)
);

-- ─────────────────────────────────────────────
-- Coaching Items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'coached', 'watchlist')),
  theme TEXT NOT NULL,
  reason TEXT NOT NULL,
  recommended_action TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Indexes for common queries
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reps_team_id ON reps(team_id);
CREATE INDEX IF NOT EXISTS idx_reps_organization_id ON reps(organization_id);
CREATE INDEX IF NOT EXISTS idx_rep_daily_metrics_rep_date ON rep_daily_metrics(rep_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_rep_outcomes_rep_date ON rep_outcomes(rep_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_coaching_items_rep_id ON coaching_items(rep_id);
CREATE INDEX IF NOT EXISTS idx_coaching_items_status ON coaching_items(status);
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
```

### Step 3: Seed Baseline Data

Create a **new query** and paste:

```sql
-- Organization
INSERT INTO public.organizations (id, name, slug, plan)
VALUES (
  'org_demo_001'::UUID,
  'Acme Sales Corp',
  'acme-sales',
  'starter'
) ON CONFLICT DO NOTHING;

-- Team
INSERT INTO public.teams (id, organization_id, name)
VALUES (
  'team_sales_east_001'::UUID,
  'org_demo_001'::UUID,
  'Sales - East Region'
) ON CONFLICT DO NOTHING;

-- Reps (baseline 5 reps)
INSERT INTO public.reps (id, organization_id, team_id, name, email, avatar_url, role, hire_date)
VALUES
  ('rep_001'::UUID, 'org_demo_001'::UUID, 'team_sales_east_001'::UUID, 'Alex Rodriguez', 'alex@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'Account Executive', CURRENT_DATE - INTERVAL '180 days'),
  ('rep_002'::UUID, 'org_demo_001'::UUID, 'team_sales_east_001'::UUID, 'Jordan Kim', 'jordan@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', 'SDR', CURRENT_DATE - INTERVAL '90 days'),
  ('rep_003'::UUID, 'org_demo_001'::UUID, 'team_sales_east_001'::UUID, 'Casey Mitchell', 'casey@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey', 'Account Executive', CURRENT_DATE - INTERVAL '365 days'),
  ('rep_004'::UUID, 'org_demo_001'::UUID, 'team_sales_east_001'::UUID, 'Morgan Taylor', 'morgan@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan', 'SDR', CURRENT_DATE - INTERVAL '45 days'),
  ('rep_005'::UUID, 'org_demo_001'::UUID, 'team_sales_east_001'::UUID, 'Sam Johnson', 'sam@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', 'Account Executive', CURRENT_DATE - INTERVAL '270 days')
ON CONFLICT DO NOTHING;

-- Rep Daily Metrics (5 days of activity for each rep)
WITH rep_data AS (
  SELECT id FROM reps WHERE organization_id = 'org_demo_001'::UUID
)
INSERT INTO public.rep_daily_metrics (rep_id, date, calls_dialed, meetings_booked, time_prospecting, time_researching, time_in_apollo, time_in_crm, time_in_email, context_switches, focus_blocks_min)
SELECT
  r.id,
  (CURRENT_DATE - (d || ' days')::INTERVAL)::DATE,
  (5 + FLOOR(RANDOM() * 20))::INT,
  (1 + FLOOR(RANDOM() * 5))::INT,
  (120 + FLOOR(RANDOM() * 120))::INT,
  (15 + FLOOR(RANDOM() * 30))::INT,
  (20 + FLOOR(RANDOM() * 40))::INT,
  (30 + FLOOR(RANDOM() * 50))::INT,
  (20 + FLOOR(RANDOM() * 40))::INT,
  (15 + FLOOR(RANDOM() * 40))::INT,
  (30 + FLOOR(RANDOM() * 90))::INT
FROM rep_data r
CROSS JOIN (SELECT 0 AS d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) days
ON CONFLICT DO NOTHING;

-- Rep Outcomes (latest 30-day period)
INSERT INTO public.rep_outcomes (rep_id, date, calls_dialed, meetings_booked)
SELECT
  r.id,
  (CURRENT_DATE - (d || ' days')::INTERVAL)::DATE,
  (10 + FLOOR(RANDOM() * 20))::INT,
  (1 + FLOOR(RANDOM() * 5))::INT
FROM (SELECT id FROM reps WHERE organization_id = 'org_demo_001'::UUID) r
CROSS JOIN (SELECT 0 AS d UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) days
ON CONFLICT DO NOTHING;
```

### Step 4: Verify Tables Created

1. Click **Table Editor** in the left sidebar
2. You should see:
   - organizations
   - profiles
   - teams
   - reps
   - rep_daily_metrics
   - rep_outcomes
   - coaching_items

### Step 5: Verify Environment Variables

The environment variables are already set in your project settings. You can verify in the Vercel dashboard under project **Settings > Environment Variables**.

### What's Next

- The app is already wired to use Supabase data via `/lib/supabase-queries.ts`
- Dashboard will fetch real team data on page load
- Rep Detail pages will load individual rep metrics
- Falls back to mock data if queries fail (safe for development)

**If you get auth errors**, check that redirect URLs are configured in Supabase Auth settings:
- `http://localhost:3000/auth/callback` (local development)
- `https://your-deployed-url.vercel.app/auth/callback` (production)
