# Database Setup Instructions for Kevi V1

## Overview
This guide walks you through setting up the Kevi V1 database schema and seeding it with sample data.

## Step 1: Run Schema Migration

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the entire contents of `/scripts/001_create_schema.sql`
6. Paste into the SQL editor
7. Click **Run**

This creates:
- `organizations` table
- `profiles` table (linked to auth.users)
- `teams` table
- `reps` table
- `rep_daily_metrics` table
- `rep_outcomes` table
- `coaching_items` table

Plus indexes, foreign keys, and Row Level Security policies.

## Step 2: Seed Sample Data

1. In the same SQL Editor, click **New Query**
2. Copy the entire contents of `/scripts/002_seed_data.sql`
3. Paste into the SQL editor
4. Click **Run**

This creates:
- 1 organization: "Acme Sales Corp"
- 1 team: "Sales - East Region"
- 1 manager profile: "Sarah Chen"
- 5 rep profiles with different tenure
- 25 daily metrics (5 days × 5 reps) with random activity data
- 5 rep outcomes (current month performance)
- 4 coaching items (different priorities and statuses)

## Step 3: Verify the Data

Run this query in the SQL Editor to verify:

```sql
SELECT 
  (SELECT COUNT(*) FROM public.organizations) as orgs,
  (SELECT COUNT(*) FROM public.profiles) as profiles,
  (SELECT COUNT(*) FROM public.teams) as teams,
  (SELECT COUNT(*) FROM public.reps) as reps,
  (SELECT COUNT(*) FROM public.rep_daily_metrics) as metrics,
  (SELECT COUNT(*) FROM public.rep_outcomes) as outcomes,
  (SELECT COUNT(*) FROM public.coaching_items) as coaching;
```

Expected results:
```
orgs: 1
profiles: 7 (1 manager + 5 reps + profile_rep_001-5)
teams: 1
reps: 5
metrics: 25
outcomes: 5
coaching: 4
```

## Step 4: Update Dashboard

The app is now configured to fetch from:
- Team ID: `team_sales_east_001`
- Uses real Supabase data for Team Dashboard and Rep Detail pages
- Falls back to mock data if Supabase queries fail

## Next Steps

Once data is seeded:
1. Navigate to `/dashboard` - should display real team data
2. Click on any rep name - should show real rep detail with metrics
3. Check coaching queue - should show real coaching items

## Troubleshooting

**No data showing:**
- Verify schema was created successfully
- Check Environment Variables in project settings (SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.)
- Check browser console for errors
- Check Supabase logs for query errors

**RLS errors:**
- RLS policies are disabled by default for testing
- To enable: Set `ALTER TABLE public.reps ENABLE ROW LEVEL SECURITY;` etc.
- Create policies based on `auth.uid()` matching `profile_id`

**Missing data:**
- Ensure seed script ran successfully
- Check that no errors were returned from SQL execution
- Verify org and team IDs in seed script match what queries expect
