-- ============================================================
-- 003_rep_identity
-- Bridge between Supabase Auth users and reps. A logged-in user is matched to a
-- rep by EMAIL (their login email = their CRM owner email = reps.email).
--   role: 'manager' sees the whole org; 'rep' sees only themselves.
-- reps already has hubspot_owner_id (the CRM owner link) from an earlier change.
-- ============================================================

alter table reps add column if not exists email text;
alter table reps add column if not exists role text not null default 'rep'
  check (role in ('manager', 'rep'));

-- Email is how a login resolves to a rep, so it must be unique per org.
create unique index if not exists reps_org_email_uniq
  on reps (organization_id, lower(email))
  where email is not null;

-- Fast lookup path for the resolver.
create index if not exists reps_email_idx on reps (lower(email)) where email is not null;
