-- Enable Row Level Security on all tables

-- ============================================================
-- reps
-- ============================================================
ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON reps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON reps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON reps
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON reps
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- teams
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON teams
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON teams
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON teams
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON teams
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- organizations
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON organizations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON organizations
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON organizations
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- coaching_items
-- ============================================================
ALTER TABLE coaching_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON coaching_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON coaching_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON coaching_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON coaching_items
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- rep_daily_metrics
-- ============================================================
ALTER TABLE rep_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON rep_daily_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON rep_daily_metrics
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON rep_daily_metrics
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON rep_daily_metrics
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- rep_outcomes
-- ============================================================
ALTER TABLE rep_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON rep_outcomes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON rep_outcomes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON rep_outcomes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON rep_outcomes
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update" ON profiles
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete" ON profiles
  FOR DELETE TO authenticated USING (true);
