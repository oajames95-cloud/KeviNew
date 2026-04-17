-- Kevi V1 Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bubbqyyiutxbgtbdmfjs/sql/new
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
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'SDR',
  hire_date DATE,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'drifting', 'at-risk')),
  -- Pattern scores (denormalized for quick reads)
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
  -- Time buckets (minutes)
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
  -- Engagement metrics
  context_switches INTEGER DEFAULT 0,
  focus_blocks_min INTEGER DEFAULT 0,
  workday_minutes INTEGER DEFAULT 480,
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

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rep_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_items ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access data in their organization
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view teams in their organization" ON teams
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view reps in their organization" ON reps
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view rep metrics in their organization" ON rep_daily_metrics
  FOR SELECT USING (
    rep_id IN (SELECT id FROM reps WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can view rep outcomes in their organization" ON rep_outcomes
  FOR SELECT USING (
    rep_id IN (SELECT id FROM reps WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
  );

CREATE POLICY "Users can view coaching items in their organization" ON coaching_items
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Allow managers to update coaching items
CREATE POLICY "Managers can update coaching items" ON coaching_items
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can insert coaching items" ON coaching_items
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
