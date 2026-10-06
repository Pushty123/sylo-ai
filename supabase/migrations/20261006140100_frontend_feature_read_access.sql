-- Read access for the Explore, Ledger, Notifications and Profile pages.
-- RLS stays on: existing policies limit rows to the user's own data and their projects.
-- projects: non-confidential columns only (confidential_brief is not granted).
grant select (id, title, status, public_summary, sensitivity, budget, currency, created_by, created_at, updated_at) on public.projects to authenticated;
grant select on public.project_members, public.ledger_entries, public.notifications, public.user_skills, public.project_applications, public.profile_evidence, public.credentials, public.organisations to authenticated;
grant insert on public.project_applications to authenticated;
