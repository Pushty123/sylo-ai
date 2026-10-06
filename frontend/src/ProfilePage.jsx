import { useEffect, useState } from 'react';
import { UserCircle, Save, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { supabase } from './supabase';

export default function ProfilePage(){
  const [data,setData]=useState(null),[form,setForm]=useState({full_name:'',bio:'',avatar_url:''}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  async function load(){const {data:r,error:e}=await supabase.rpc('get_my_profile');if(e)setError(e.message);else{setData(r);setForm({full_name:r?.profile?.full_name||'',bio:r?.profile?.bio||'',avatar_url:r?.profile?.avatar_url||''})}}
  useEffect(()=>{load()},[]);
  async function save(e){e.preventDefault();setBusy(true);setError('');setSaved(false);const {error:e2}=await supabase.rpc('update_my_profile',{p_full_name:form.full_name,p_bio:form.bio,p_avatar_url:form.avatar_url});if(e2)setError(e2.message);else setSaved(true);setBusy(false)}
  if(!data&&!error)return <div className="p-10 text-gray-500">Loading profile…</div>;
  return <div className="max-w-5xl mx-auto space-y-6">
    <div><div className="text-xs uppercase tracking-[.25em] text-emerald-400">Identity</div><h2 className="text-3xl font-bold text-white mt-2">Your profile</h2><p className="text-gray-400 mt-2">The profile used for project membership, evidence and credentials.</p></div>
    {error&&<div className="border border-red-900 bg-red-950/20 text-red-300 p-4 rounded-xl text-sm">{error}</div>}
    <div className="grid grid-cols-3 gap-6">
      <form onSubmit={save} className="col-span-2 bg-[#09090b] border border-gray-800 rounded-xl p-6 space-y-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xl font-bold">{(form.full_name||'U').slice(0,1).toUpperCase()}</div><div><div className="text-white font-semibold">{data?.profile?.role}</div><div className="text-xs text-gray-500">Role is controlled by the platform, not this form.</div></div></div><input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Full name" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white"/><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Bio" rows="5" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white"/><input value={form.avatar_url} onChange={e=>setForm({...form,avatar_url:e.target.value})} placeholder="Avatar URL (optional)" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white"/><button disabled={busy} className="bg-emerald-600 text-black px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2">{busy?<Loader2 className="animate-spin"/>:<Save className="w-4 h-4"/>}{saved?'Saved':'Save profile'}</button></form>
      <div className="space-y-5"><div className="bg-[#09090b] border border-gray-800 rounded-xl p-5"><ShieldCheck className="text-emerald-400"/><h3 className="text-white font-semibold mt-3">Evidence</h3><div className="text-2xl text-white font-bold mt-2">{data?.evidence?.length||0}</div><div className="text-xs text-gray-500">profile evidence records</div></div><div className="bg-[#09090b] border border-gray-800 rounded-xl p-5"><Award className="text-emerald-400"/><h3 className="text-white font-semibold mt-3">Credentials</h3><div className="text-2xl text-white font-bold mt-2">{data?.credentials?.length||0}</div><div className="text-xs text-gray-500">issued credentials</div></div></div>
    </div>
  </div>;
}
