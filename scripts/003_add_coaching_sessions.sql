-- Coaching Sessions table to track 1:1 coaching history

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  coaching_item_id UUID REFERENCES coaching_items(id) ON DELETE SET NULL,
  notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  talking_points JSONB DEFAULT '[]'::jsonb,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_rep_id ON coaching_sessions(rep_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_manager_id ON coaching_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_session_date ON coaching_sessions(session_date DESC);

ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view coaching sessions in their organization" ON coaching_sessions;
CREATE POLICY "Users can view coaching sessions in their organization" ON coaching_sessions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Managers can insert coaching sessions" ON coaching_sessions;
CREATE POLICY "Managers can insert coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Managers can update coaching sessions" ON coaching_sessions;
CREATE POLICY "Managers can update coaching sessions" ON coaching_sessions
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
