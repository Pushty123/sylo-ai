import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Search, Plus, ArrowRight, Bell, Users, Wallet, ShieldCheck, Bot, RefreshCw } from 'lucide-react';
import { supabase } from './supabase';

export default function Dashboard({ profile, onRefresh }) {
  const [data,setData]=useState(null), [loading,setLoading]=useState(true), [error,setError]=useState('');
  const navigate=useNavigate();

  async function load(){
    setLoading(true); setError('');
    const {data:result,error:rpcError}=await supabase.rpc('get_my_dashboard');
    if(rpcError) setError(rpcError.message); else { setData(result); onRefresh?.(result); }
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  if(loading) return <div className="p-10 text-gray-400">Loading your workspace…</div>;
  if(error) return <div className="p-10"><div className="border border-red-900 bg-red-950/20 text-red-300 rounded-xl p-5">{error}</div><button onClick={load} className="mt-4 px-4 py-2 bg-emerald-600 text-black rounded">Retry</button></div>;

  const myProjects=data?.my_projects||[], open=data?.open_projects||[], notifications=data?.notifications||[];
  const role=profile?.role||data?.profile?.role||'student';

  return <div className="max-w-7xl mx-auto space-y-8">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs uppercase tracking-[.25em] text-emerald-400">Workspace</p><h2 className="text-3xl font-bold text-white mt-2">Welcome back, {profile?.full_name||data?.profile?.full_name||'Researcher'}</h2><p className="text-gray-400 mt-2">Your projects, research activity, AI workspace and trust records in one place.</p></div>
      <button onClick={load} className="p-2.5 border border-gray-800 rounded-lg text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4"/></button>
    </div>

    <div className="grid grid-cols-4 gap-4">
      {[
        ['Active projects',myProjects.filter(p=>['open','forming_team','active','review'].includes(p.status)).length,FolderKanban],
        ['Unread alerts',data?.unread_notifications||0,Bell],
        ['Team memberships',myProjects.length,Users],
        ['Trust status','Protected',ShieldCheck]
      ].map(([label,value,Icon])=><div key={label} className="bg-[#09090b] border border-gray-800 rounded-xl p-5"><Icon className="w-5 h-5 text-emerald-400"/><div className="text-2xl font-bold text-white mt-4">{value}</div><div className="text-xs text-gray-500 mt-1">{label}</div></div>)}
    </div>

    <div className="grid grid-cols-3 gap-6">
      <section className="col-span-2 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-sm uppercase tracking-widest text-gray-500">Your projects</h3>{['sponsor','expert','admin'].includes(role)&&<Link to="/sponsor" className="flex items-center gap-2 text-xs bg-emerald-600 text-black px-3 py-2 rounded-lg font-semibold"><Plus className="w-4 h-4"/> New project</Link>}</div>
        {myProjects.length===0?<div className="border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500">You are not part of a project yet. Browse opportunities below.</div>:
        myProjects.map(p=><button key={p.id} onClick={()=>{localStorage.setItem('sylo_active_project_id',p.id);navigate('/workspace')}} className="w-full text-left bg-[#09090b] border border-gray-800 hover:border-emerald-800 rounded-xl p-5 transition">
          <div className="flex justify-between gap-4"><div><div className="text-xs font-mono text-emerald-400">{p.status}</div><h4 className="text-lg font-semibold text-white mt-1">{p.title}</h4><p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.public_summary}</p></div><ArrowRight className="w-5 h-5 text-gray-600 shrink-0"/></div>
          <div className="flex gap-5 text-xs text-gray-500 mt-4"><span>₹{Number(p.budget||0).toLocaleString('en-IN')}</span><span>{p.sensitivity}</span><span>{new Date(p.created_at).toLocaleDateString()}</span></div>
        </button>)}
      </section>

      <aside className="space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-sm uppercase tracking-widest text-gray-500">Notifications</h3><Bell className="w-4 h-4 text-gray-500"/></div>
        <div className="bg-[#09090b] border border-gray-800 rounded-xl divide-y divide-gray-800/70">
          {notifications.length===0?<div className="p-6 text-sm text-gray-500">No notifications yet.</div>:notifications.slice(0,6).map(n=><div key={n.id} className="p-4"><div className="text-xs font-semibold text-white">{n.title}</div><div className="text-xs text-gray-500 mt-1">{n.body}</div><div className="text-[10px] text-gray-600 mt-2">{new Date(n.created_at).toLocaleString()}</div></div>)}
        </div>
      </aside>
    </div>

    <section className="space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-sm uppercase tracking-widest text-gray-500">Discover projects</h3><Link to="/student" className="text-xs text-emerald-400 flex items-center gap-1">View all <ArrowRight className="w-3 h-3"/></Link></div>
      <div className="grid grid-cols-2 gap-4">
        {open.slice(0,4).map(p=><div key={p.id} className="bg-[#09090b] border border-gray-800 rounded-xl p-5"><div className="flex justify-between"><span className="text-xs text-emerald-400 font-mono">{p.status}</span><span className="text-xs text-gray-500">₹{Number(p.budget||0).toLocaleString('en-IN')}</span></div><h4 className="text-white font-semibold mt-2">{p.title}</h4><p className="text-sm text-gray-400 mt-2 line-clamp-2">{p.public_summary}</p><button onClick={()=>{localStorage.setItem('sylo_active_project_id',p.id);navigate('/workspace')}} className="mt-4 text-xs text-emerald-400">Open project →</button></div>)}
        {open.length===0&&<div className="col-span-2 border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500">No public projects available yet.</div>}
      </div>
    </section>

    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 flex items-center gap-4"><Bot className="w-8 h-8 text-emerald-400"/><div><div className="text-white font-semibold">Private project AI</div><div className="text-sm text-gray-400">Qwen3:4B is available inside an authorized project workspace. It cannot be used as a cross-project data source.</div></div></div>
  </div>;
}
