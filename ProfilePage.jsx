import { useEffect, useState } from 'react';
import { Save, ShieldCheck, Award, Loader2, BadgeCheck, Clock, GitBranch, FileText, Trophy, Briefcase, Copy, Check, Sparkles } from 'lucide-react';
import { supabase } from './supabase';
import FingerprintSetup from './FingerprintSetup';
import AvatarPicker, { Avatar } from './AvatarPicker';

const EVIDENCE_ICON = { github: GitBranch, paper: FileText, publication: FileText, competition: Trophy, certificate: Award, project: Briefcase };

export default function ProfilePage(){
  const [data,setData]=useState(null),[form,setForm]=useState({full_name:'',bio:'',avatar_url:''}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
  const [skills,setSkills]=useState([]),[evidence,setEvidence]=useState([]),[creds,setCreds]=useState([]),[org,setOrg]=useState(null),[showPicker,setShowPicker]=useState(false),[copied,setCopied]=useState('');

  async function load(){
    const {data:r,error:e}=await supabase.rpc('get_my_profile');
    if(e){setError(e.message);return;}
    setData(r);setForm({full_name:r?.profile?.full_name||'',bio:r?.profile?.bio||'',avatar_url:r?.profile?.avatar_url||''});
    const {data:{user}}=await supabase.auth.getUser();
    const [s,ev,c,p]=await Promise.all([
      supabase.from('user_skills').select('skill_name,confidence,evidence_count,source').eq('user_id',user.id).order('confidence',{ascending:false}),
      supabase.from('profile_evidence').select('id,evidence_type,title,description,external_url,verification_status').eq('user_id',user.id).order('created_at'),
      supabase.from('credentials').select('id,title,description,verification_code,placement,role,issued_at').eq('recipient_id',user.id).order('issued_at',{ascending:false}),
      supabase.from('profiles').select('organisation_id').eq('id',user.id).maybeSingle()
    ]);
    setSkills(s.data||[]);setEvidence(ev.data||[]);setCreds(c.data||[]);
    if(p.data?.organisation_id){const {data:o}=await supabase.from('organisations').select('name').eq('id',p.data.organisation_id).maybeSingle();setOrg(o?.name||null);}
  }
  useEffect(()=>{load()},[]);

  async function persist(next){
    setBusy(true);setError('');setSaved(false);
    const {error:e2}=await supabase.rpc('update_my_profile',{p_full_name:next.full_name,p_bio:next.bio,p_avatar_url:next.avatar_url});
    if(e2)setError(e2.message);else setSaved(true);
    setBusy(false);
  }
  async function save(e){e.preventDefault();await persist(form);}
  async function pickAvatar(url){const next={...form,avatar_url:url};setForm(next);await persist(next);}
  function copy(code){navigator.clipboard?.writeText(code);setCopied(code);setTimeout(()=>setCopied(''),1500);}

  if(!data&&!error)return <div className="p-10 text-gray-500">Loading profile…</div>;
  const verified=evidence.filter(e=>e.verification_status==='verified').length;

  return <div className="max-w-6xl mx-auto space-y-6">
    <div><div className="text-xs uppercase tracking-[.25em] text-emerald-400">Identity</div><h2 className="text-3xl font-bold text-white mt-2">Your profile</h2><p className="text-gray-400 mt-2">The profile used for project membership, evidence and credentials.</p></div>
    {error&&<div className="border border-red-900 bg-red-950/20 text-red-300 p-4 rounded-xl text-sm">{error}</div>}

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={save} className="bg-[#09090b] border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar url={form.avatar_url} name={form.full_name} size={84}/>
              <button type="button" onClick={()=>setShowPicker(!showPicker)} className="absolute -bottom-1 -right-1 bg-emerald-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-emerald-500">Edit</button>
            </div>
            <div className="min-w-0">
              <div className="text-xl text-white font-bold flex items-center gap-2">{form.full_name||'Unnamed'}{verified>0&&<BadgeCheck className="w-5 h-5 text-emerald-400" title="Verified evidence"/>}</div>
              <div className="text-sm text-gray-400">{org||'Independent researcher'}</div>
              <div className="flex gap-2 mt-2"><span className="text-[10px] uppercase tracking-wider bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded-full">{data?.profile?.role}</span><span className="text-[10px] uppercase tracking-wider bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded-full">Identity verified</span></div>
            </div>
          </div>
          {showPicker&&<AvatarPicker value={form.avatar_url} name={form.full_name} onPick={pickAvatar}/>}
          <input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Full name" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white"/>
          <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Bio" rows="4" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white"/>
          <button disabled={busy} className="bg-emerald-600 text-black px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2">{busy?<Loader2 className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}{saved?'Saved':'Save profile'}</button>
        </form>

        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400"/>Skills</h3><span className="text-xs text-gray-500">confidence from verified evidence</span></div>
          {skills.length===0?<div className="text-sm text-gray-500">No skills yet.</div>:<div className="space-y-3">{skills.map(s=><div key={s.skill_name}>
            <div className="flex justify-between text-sm"><span className="text-gray-200">{s.skill_name}{s.source==='verified_evidence'&&<BadgeCheck className="inline w-3.5 h-3.5 ml-1 text-emerald-400"/>}</span><span className="text-gray-400">{Math.round(s.confidence)}%</span></div>
            <div className="h-2 bg-gray-900 rounded-full mt-1 overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 rounded-full" style={{width:`${s.confidence}%`}}/></div>
          </div>)}</div>}
        </div>

        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4 text-emerald-400"/>Evidence</h3>
          <div className="space-y-3">{evidence.map(ev=>{const Icon=EVIDENCE_ICON[ev.evidence_type]||FileText;return <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-800 bg-black/40">
            <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
            <div className="flex-1 min-w-0"><div className="text-sm text-white">{ev.external_url?<a href={ev.external_url} target="_blank" rel="noreferrer" className="hover:text-emerald-400">{ev.title}</a>:ev.title}</div><div className="text-xs text-gray-500 mt-0.5">{ev.description}</div></div>
            {ev.verification_status==='verified'?<span className="text-[10px] flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full shrink-0"><BadgeCheck className="w-3 h-3"/>Verified</span>:<span className="text-[10px] flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full shrink-0"><Clock className="w-3 h-3"/>Pending</span>}
          </div>})}</div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#09090b] border border-gray-800 rounded-xl p-4"><ShieldCheck className="text-emerald-400 w-5 h-5"/><div className="text-2xl text-white font-bold mt-2">{verified}/{evidence.length}</div><div className="text-xs text-gray-500">evidence verified</div></div>
          <div className="bg-[#09090b] border border-gray-800 rounded-xl p-4"><Award className="text-emerald-400 w-5 h-5"/><div className="text-2xl text-white font-bold mt-2">{creds.length}</div><div className="text-xs text-gray-500">credentials</div></div>
        </div>

        {creds.map(c=><div key={c.id} className="relative overflow-hidden rounded-xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950/60 to-black p-5">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border-4 border-emerald-800/40"/>
          <div className="text-[10px] uppercase tracking-[.25em] text-emerald-400">Verified credential</div>
          <div className="text-white font-semibold mt-2 leading-snug">{c.title}</div>
          <div className="text-xs text-gray-400 mt-1">{c.role}{c.placement?` · ${c.placement}`:''}</div>
          <div className="text-xs text-gray-500 mt-2">{c.description}</div>
          <button onClick={()=>copy(c.verification_code)} className="mt-4 w-full flex items-center justify-between font-mono text-xs bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-emerald-300 hover:border-emerald-700">
            {c.verification_code}{copied===c.verification_code?<Check className="w-3.5 h-3.5"/>:<Copy className="w-3.5 h-3.5"/>}
          </button>
          <div className="text-[10px] text-gray-500 mt-2">Anyone can verify this code on the public Verify page.</div>
        </div>)}

        <FingerprintSetup/>
      </div>
    </div>
  </div>;
}
