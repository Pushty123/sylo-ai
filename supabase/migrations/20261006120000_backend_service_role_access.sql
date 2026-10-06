-- Lets the FastAPI backend (SUPABASE_SERVICE_KEY / service_role) read and write the tables
-- it uses. Only service_role is changed: anon and authenticated (the browser app) keep the
-- exact same access, so the existing frontend and its RPCs are unaffected.
-- Ledger rows are still written only through append_ledger_event / the existing triggers.
grant usage on schema public to service_role;
grant select on public.profiles, public.projects, public.project_members, public.milestones,
  public.charters, public.charter_acceptances, public.ledger_entries, public.notifications
  to service_role;
grant select, insert on public.ai_actions, public.project_skills, public.contributions to service_role;
grant insert on public.projects, public.milestones, public.charters, public.charter_acceptances,
  public.notifications to service_role;
grant insert, update on public.project_members to service_role;
grant update on public.charters to service_role;
grant execute on function public.append_ledger_event(uuid,uuid,text,text,uuid,jsonb,uuid) to service_role;
