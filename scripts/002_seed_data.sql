-- Seed data for Kevi V1
-- Run this AFTER 001_create_schema.sql in Supabase SQL Editor
-- https://supabase.com/dashboard/project/bubbqyyiutxbgtbdmfjs/sql/new

-- 1. Create organization
INSERT INTO organizations (id, name, slug, plan)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Acme Sales Corp',
  'acme-sales',
  'growth'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Create team (no manager_id yet - will update after profiles exist)
INSERT INTO teams (id, organization_id, name)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Sales - East Region'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create reps (without profile_id - these are tracked reps who may not have accounts)
INSERT INTO reps (id, organization_id, team_id, name, email, avatar_url, role, hire_date, trend, score_top_rep_similarity, score_workflow_drift, score_prospecting_focus_time, score_follow_up_discipline, score_prep_quality)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Alex Rodriguez', 'alex@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'AE', CURRENT_DATE - INTERVAL '180 days', 'improving', 82, 15, 78, 85, 72),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Jordan Kim', 'jordan@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan', 'SDR', CURRENT_DATE - INTERVAL '90 days', 'drifting', 58, 42, 45, 52, 61),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Casey Mitchell', 'casey@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey', 'AE', CURRENT_DATE - INTERVAL '365 days', 'stable', 91, 8, 88, 92, 85),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Morgan Taylor', 'morgan@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan', 'SDR', CURRENT_DATE - INTERVAL '45 days', 'at-risk', 35, 65, 32, 38, 40),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Sam Johnson', 'sam@acme.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam', 'AE', CURRENT_DATE - INTERVAL '270 days', 'stable', 75, 22, 71, 78, 68)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert rep daily metrics (last 5 days for each rep)
INSERT INTO rep_daily_metrics (rep_id, date, time_prospecting, time_researching, time_in_apollo, time_in_crm, time_in_email, context_switches, focus_blocks_min, calls_dialed, meetings_booked)
VALUES
  -- Alex Rodriguez (improving - good numbers)
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '0 days', 185, 35, 45, 55, 30, 18, 95, 22, 4),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 days', 175, 40, 50, 45, 35, 22, 85, 18, 3),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 190, 30, 40, 50, 25, 15, 100, 25, 5),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days', 165, 45, 55, 40, 30, 20, 80, 20, 3),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '4 days', 180, 35, 45, 55, 35, 17, 90, 21, 4),
  
  -- Jordan Kim (drifting - inconsistent)
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '0 days', 95, 15, 25, 80, 45, 42, 35, 8, 1),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 days', 140, 20, 35, 60, 40, 35, 55, 15, 2),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days', 80, 10, 20, 90, 55, 48, 25, 5, 0),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '3 days', 120, 25, 30, 70, 35, 38, 45, 12, 2),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '4 days', 105, 18, 28, 75, 50, 45, 30, 9, 1),
  
  -- Casey Mitchell (top performer - consistent excellence)
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '0 days', 210, 45, 55, 40, 25, 12, 120, 28, 6),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '1 days', 200, 50, 50, 45, 30, 14, 115, 26, 5),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 days', 215, 40, 60, 35, 20, 10, 125, 30, 7),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '3 days', 195, 55, 45, 50, 25, 15, 110, 24, 5),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '4 days', 205, 48, 52, 42, 28, 13, 118, 27, 6),
  
  -- Morgan Taylor (at-risk - low activity)
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '0 days', 65, 8, 15, 95, 60, 55, 15, 4, 0),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 days', 75, 12, 20, 85, 55, 50, 20, 6, 1),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', 55, 5, 10, 100, 70, 60, 10, 3, 0),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '3 days', 70, 10, 18, 90, 58, 52, 18, 5, 0),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '4 days', 60, 6, 12, 98, 65, 58, 12, 4, 0),
  
  -- Sam Johnson (stable - solid performer)
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '0 days', 160, 30, 40, 50, 35, 25, 75, 18, 3),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '1 days', 155, 35, 38, 52, 38, 28, 70, 16, 3),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '2 days', 165, 28, 42, 48, 32, 22, 78, 19, 4),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '3 days', 150, 32, 36, 55, 40, 30, 68, 15, 2),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '4 days', 158, 30, 40, 50, 36, 26, 72, 17, 3)
ON CONFLICT (rep_id, date) DO NOTHING;

-- 5. Insert rep outcomes (daily outcomes for last 5 days)
INSERT INTO rep_outcomes (rep_id, date, calls_dialed, connect_rate, emails_sent, meetings_booked, follow_up_rate)
VALUES
  -- Alex Rodriguez
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '0 days', 22, 32.5, 45, 4, 78.0),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 days', 18, 28.0, 38, 3, 75.0),
  ('c0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 25, 35.0, 52, 5, 82.0),
  
  -- Jordan Kim
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '0 days', 8, 18.0, 22, 1, 45.0),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 days', 15, 22.0, 30, 2, 52.0),
  ('c0000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days', 5, 12.0, 15, 0, 35.0),
  
  -- Casey Mitchell (top performer)
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '0 days', 28, 42.0, 60, 6, 92.0),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '1 days', 26, 40.0, 55, 5, 90.0),
  ('c0000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 days', 30, 45.0, 65, 7, 95.0),
  
  -- Morgan Taylor (at-risk)
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '0 days', 4, 8.0, 12, 0, 25.0),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 days', 6, 12.0, 18, 1, 30.0),
  ('c0000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', 3, 5.0, 8, 0, 20.0),
  
  -- Sam Johnson
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '0 days', 18, 28.0, 40, 3, 72.0),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '1 days', 16, 25.0, 35, 3, 70.0),
  ('c0000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '2 days', 19, 30.0, 42, 4, 75.0)
ON CONFLICT (rep_id, date) DO NOTHING;

-- 6. Insert coaching items
INSERT INTO coaching_items (id, organization_id, rep_id, severity, status, theme, reason, recommended_action)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'high', 'new', 'Prospecting Consistency', 'Context switching 42x/day vs team avg of 20x. Focus time blocks averaging only 35 min.', 'Implement 3-hour morning prospecting blocks with notifications off. Review with 1:1 accountability check-ins.'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'critical', 'new', 'Activity Volume', 'Only 4-6 calls/day vs team target of 20. Time in CRM (95 min) exceeds prospecting time (65 min).', 'Immediate coaching session. Set daily call minimums with midday check-in. Reduce CRM admin time.'),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'low', 'reviewing', 'Momentum Building', 'Strong improvement trajectory. Meetings up 40% MoM. Approaching top performer baseline.', 'Continue current workflow. Consider pairing with Casey for best practice sharing.'),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'low', 'coached', 'Top Performer Recognition', 'Consistently exceeding all metrics. 91% top rep similarity score.', 'Invite to lead team coaching session on prospecting workflow.')
ON CONFLICT (id) DO NOTHING;
