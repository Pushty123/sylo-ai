-- Signed-in users must not write ledger rows directly; triggers and the backend still can.
revoke execute on function public.append_ledger_event(uuid,uuid,text,text,uuid,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.append_ledger_event(uuid,uuid,text,text,uuid,jsonb,uuid) to service_role;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
-- create_contribution never sent a type, so "Add contribution" always failed.
alter table public.contributions alter column contribution_type set default 'other'::public.contribution_type;
