-- Open email signup: anyone can create an account. The role chosen at signup is limited to
-- student, sponsor or expert; "admin" (or anything unknown) becomes student.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_role public.user_role;
begin
  v_role := case new.raw_user_meta_data->>'role'
              when 'sponsor' then 'sponsor'::public.user_role
              when 'expert'  then 'expert'::public.user_role
              else 'student'::public.user_role end;
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)), v_role)
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$function$;
