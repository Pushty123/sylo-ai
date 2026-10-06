import { supabase } from './supabase';

export async function getCurrentUserWithProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return { user: null, profile: null };
  const { data: profile, error } = await supabase.from('profiles')
    .select('id,full_name,role,organisation_id,avatar_url,bio')
    .eq('id',user.id).maybeSingle();
  if (error) throw error;
  return { user, profile: profile ?? null };
}

export async function signIn(email,password) {
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error)throw error;
  return data;
}

export async function signUp(email,password,fullName,role='student') {
  const {data,error}=await supabase.auth.signUp({
    email,password,
    options:{data:{full_name:fullName,role}}
  });
  if(error)throw error;
  return { ...data, needsEmailConfirmation: !data.session };
}

export async function resetPassword(email) {
  const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth'});
  if(error)throw error;
}

export async function signOut(){return supabase.auth.signOut();}
