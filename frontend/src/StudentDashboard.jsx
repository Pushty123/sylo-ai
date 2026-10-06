import { useEffect, useState } from 'react';
import { Search, Shield, Lock, ArrowRight, Code2, Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard({ onAddLedgerEntry }) {
  const [projects,setProjects]=useState([]);
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);
  const [joining,setJoining]=useState(null);
  const [error,setError]=useState('');
  const navigate=useNavigate();

  useEffect(()=>{loadProjects()},[]);
  async function loadProjects(){
    setLoading(true);setError('');
    const {data,error}=await supabase.from('projects').select('id,title,public_summary,budget,currency,status,created_at').in('status',['open','forming_team','active']).order('created_at',{ascending:false});
    if(error)setError(error.message);else setProjects(data||[]);
    setLoading(false);
  }
  async function joinProject(project){
    setJoining(project.id);setError('');
    try{
      const {error:joinError}=await supabase.rpc('join_project',{p_project_id:project.id});
      if(joinError)throw joinError;
      localStorage.setItem('sylo_active_project_id',project.id);
      onAddLedgerEntry?.({action:'PROJECT_JOINED',actor:'Student',hash:project.id});
      navigate('/scoping');
    }catch(err){setError(err?.message||'Could not join project.');}
    finally{setJoining(null);}
  }
  const visible=projects.filter(p=>(p.title+' '+p.public_summary).toLowerCase().includes(query.toLowerCase()));

  return <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex justify-between items-end"><div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Code2 className="text-emerald-400 w-6 h-6"/>Active Projects Hub</h2><p className="text-gray-400 text-sm mt-1">Browse public summaries, join a project, then use the project-scoped private AI.</p></div>
      <div className="relative"><Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects..." className="bg-[#09090b] border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-white w-64"/></div></div>
    {error&&<div className="text-red-300 text-xs bg-red-950/20 border border-red-900/50 p-3 rounded">{error}</div>}
    {loading?<div className="text-gray-500 flex items-center gap-2"><Loader2 className="animate-spin"/>Loading projects...</div>:
      visible.length===0?<div className="border border-dashed border-gray-800 rounded-xl p-10 text-center text-gray-500">No open projects yet. A sponsor can create one from the Sponsor page.</div>:
      <div className="space-y-4">{visible.map(project=><div key={project.id} className="bg-[#09090b] border border-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4"><div><span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">{project.id.slice(0,8)}</span><h3 className="text-lg font-semibold text-gray-100 mt-2">{project.title}</h3></div><div className="text-right text-emerald-400 font-bold">₹{Number(project.budget||0).toLocaleString('en-IN')}<div className="text-xs text-gray-500 uppercase mt-1">{project.status}</div></div></div>
        <div className="bg-black/50 border border-gray-800/60 rounded-lg p-4 mb-4"><h4 className="text-xs font-mono text-gray-500 uppercase mb-2">Public Summary</h4><p className="text-sm text-gray-300 leading-relaxed">{project.public_summary}</p></div>
        <div className="bg-gray-900/30 border border-dashed border-gray-800 rounded-lg p-4 flex items-center justify-between"><div className="flex items-center gap-3 text-gray-500"><Lock className="w-5 h-5 text-amber-500/70"/><div className="text-sm"><span className="font-semibold text-gray-400">Confidential Brief</span><p className="text-xs">Unlocked only after project membership.</p></div></div><button onClick={()=>joinProject(project)} disabled={joining===project.id} className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-md text-sm font-semibold">{joining===project.id?<Loader2 className="w-4 h-4 animate-spin"/>:'Join & Scope'}<ArrowRight className="w-4 h-4"/></button></div>
      </div>)}</div>}
  </div>;
}
