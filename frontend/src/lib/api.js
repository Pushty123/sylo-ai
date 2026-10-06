import { createClient } from '@supabase/supabase-js';
export const supabase=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);
export const API=import.meta.env.VITE_API_URL||'http://localhost:8000';
export async function api(path,options={}){
 const {data:{session}}=await supabase.auth.getSession();
 const headers={'Content-Type':'application/json',...(options.headers||{})};
 if(session?.access_token) headers.Authorization='Bearer '+session.access_token;
 const res=await fetch(API+path,{...options,headers});
 const body=await res.json().catch(()=>({}));
 if(!res.ok) throw new Error(body.detail||'Request failed');
 return body;
}
