import { supabase } from './supabase';

export async function getCurrentUserWithProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return { user: null, profile: null };
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, organisation_id, avatar_url, bio')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return { user, profile: profile ?? null };
}

export async function signIn(email, password) {
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return result.data;
}

export async function signUp(email, password, fullName, role = 'student') {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) return data;
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id, full_name: fullName, role
  });
  if (profileError) throw profileError;
  return data;
}

export async function signOut() {
  return supabase.auth.signOut();
}
