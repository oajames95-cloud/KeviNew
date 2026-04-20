-- Coaching Sessions table to track 1:1 coaching history
-- Run this in Supabase SQL Editor

-- ─────────────────────────────────────────────
-- Coaching Sessions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  rep_id UUID NOT NULL REFERENCES reps(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  coaching_item_id UUID REFERENCES coaching_items(id) ON DELETE SET NULL,
  -- Session details
  notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  -- action_items format: [{ "id": "uuid", "text": "...", "due_date": "2025-01-15", "completed": false, "completed_at": null }]
  talking_points JSONB DEFAULT '[]'::jsonb,
  -- Timestamps
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_rep_id ON coaching_sessions(rep_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_manager_id ON coaching_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_session_date ON coaching_sessions(session_date DESC);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view coaching sessions in their organization" ON coaching_sessions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can insert coaching sessions" ON coaching_sessions
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers can update coaching sessions" ON coaching_sessions
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Add columns to reps table if missing (for backwards compatibility with different column names)
DO $$ 
BEGIN
  -- Check if full_name exists, if not but name exists, add alias view or rename
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'full_name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'name') THEN
      ALTER TABLE reps ADD COLUMN full_name TEXT GENERATED ALWAYS AS (name) STORED;
    END IF;
  END IF;
  
  -- Add score columns if they don't exist with the expected names
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'top_rep_similarity') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'score_top_rep_similarity') THEN
      ALTER TABLE reps ADD COLUMN top_rep_similarity INTEGER GENERATED ALWAYS AS (score_top_rep_similarity) STORED;
    ELSE
      ALTER TABLE reps ADD COLUMN top_rep_similarity INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'workflow_drift') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'score_workflow_drift') THEN
      ALTER TABLE reps ADD COLUMN workflow_drift INTEGER GENERATED ALWAYS AS (score_workflow_drift) STORED;
    ELSE
      ALTER TABLE reps ADD COLUMN workflow_drift INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'prospecting_focus_time') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'score_prospecting_focus_time') THEN
      ALTER TABLE reps ADD COLUMN prospecting_focus_time INTEGER GENERATED ALWAYS AS (score_prospecting_focus_time) STORED;
    ELSE
      ALTER TABLE reps ADD COLUMN prospecting_focus_time INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'follow_up_discipline') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'score_follow_up_discipline') THEN
      ALTER TABLE reps ADD COLUMN follow_up_discipline INTEGER GENERATED ALWAYS AS (score_follow_up_discipline) STORED;
    ELSE
      ALTER TABLE reps ADD COLUMN follow_up_discipline INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'outbound_velocity') THEN
    ALTER TABLE reps ADD COLUMN outbound_velocity INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'signal_confidence') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reps' AND column_name = 'score_signal_confidence') THEN
      ALTER TABLE reps ADD COLUMN signal_confidence INTEGER GENERATED ALWAYS AS (score_signal_confidence) STORED;
    ELSE
      ALTER TABLE reps ADD COLUMN signal_confidence INTEGER DEFAULT 0;
    END IF;
  END IF;
  
  -- Add meetings_booked to rep_daily_metrics if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rep_daily_metrics' AND column_name = 'meetings_booked') THEN
    ALTER TABLE rep_daily_metrics ADD COLUMN meetings_booked INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rep_daily_metrics' AND column_name = 'calls_dialed') THEN
    ALTER TABLE rep_daily_metrics ADD COLUMN calls_dialed INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rep_daily_metrics' AND column_name = 'connect_rate') THEN
    ALTER TABLE rep_daily_metrics ADD COLUMN connect_rate NUMERIC(5,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rep_daily_metrics' AND column_name = 'follow_up_rate') THEN
    ALTER TABLE rep_daily_metrics ADD COLUMN follow_up_rate NUMERIC(5,2) DEFAULT 0;
  END IF;
END $$;
