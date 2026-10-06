import { useEffect, useState } from 'react';
import { Search, Lock, ArrowRight, Code2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard({ onAddLedgerEntry }) {
  const [projects,setProjects]=useState([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[joining,setJoining]=useState(null),[error,setError]=useState('');
  const navigate=useNavigate();

  async function load(){
    setLoading(true);setError('');
    const {data,error:rpcError}=await supabase.rpc('get_my_dashboard');
    if(rpcError)setError(rpcError.message);else setProjects(data?.open_projects||[]);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);
  async function joinProject(project){
    setJoining(project.id);setError('');
    try{
      const {error:joinError}=await supabase.rpc('join_project',{p_project_id:project.id});
      if(joinError)throw joinError;
      localStorage.setItem('sylo_active_project_id',project.id);
      onAddLedgerEntry?.({action:'PROJECT_JOINED',actor:'Current user',hash:project.id});
      navigate('/workspace');
    }catch(err){setError(err.message||'Could not join project.');}
    finally{setJoining(null);}
  }
  const visible=projects.filter(p=>(p.title+' '+p.public_summary).toLowerCase().includes(query.toLowerCase()));
  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex items-end justify-between gap-4"><div><div className="text-xs uppercase tracking-[.25em] text-emerald-400">Project marketplace</div><h2 className="text-3xl font-bold text-white mt-2">Discover research opportunities</h2><p className="text-gray-400 mt-2">Only public summaries are exposed here. Confidential briefs remain project-scoped.</p></div><button onClick={load} className="p-2.5 border border-gray-800 rounded-lg text-gray-400"><RefreshCw className="w-4 h-4"/></button></div>
    <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-600"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or research area…" className="w-full bg-[#09090b] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white"/></div>
    {error&&<div className="border border-red-900 bg-red-950/20 text-red-300 rounded-xl p-4 text-xs">{error}</div>}
    {loading?<div className="text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin"/>Loading opportunities…</div>:visible.length===0?<div className="border border-dashed border-gray-800 rounded-xl p-12 text-center"><Code2 className="mx-auto text-gray-700"/><p className="text-gray-500 mt-3">No open projects match your search.</p></div>:
    <div className="grid md:grid-cols-2 gap-5">{visible.map(p=><article key={p.id} className="bg-[#09090b] border border-gray-800 hover:border-emerald-900 rounded-2xl p-6"><div className="flex justify-between"><span className="text-xs uppercase font-mono text-emerald-400">{p.status}</span><span className="text-xs text-gray-500">₹{Number(p.budget||0).toLocaleString('en-IN')}</span></div><h3 className="text-xl font-semibold text-white mt-3">{p.title}</h3><p className="text-sm text-gray-400 mt-3 leading-relaxed">{p.public_summary}</p><div className="mt-5 p-3 rounded-lg bg-black/40 border border-dashed border-gray-800 flex items-center gap-3"><Lock className="w-4 h-4 text-amber-400"/><div className="text-xs text-gray-500">Confidential brief unlocks after membership.</div></div><button onClick={()=>joinProject(p)} disabled={joining===p.id} className="mt-5 w-full flex justify-center items-center gap-2 bg-emerald-600 text-black font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50">{joining===p.id?<Loader2 className="animate-spin"/>:<>Join project <ArrowRight className="w-4 h-4"/></>}</button></article>)}</div>}
  </div>;
}
