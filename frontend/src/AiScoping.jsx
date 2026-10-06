import { useEffect, useState } from 'react';
import { Bot, Send, Sparkles, Code, Loader2 } from 'lucide-react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export default function AiScoping({ onAddLedgerEntry }) {
  const [prompt,setPrompt]=useState('');
  const [answer,setAnswer]=useState('');
  const [project,setProject]=useState(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const navigate=useNavigate();
  const API=import.meta.env.VITE_API_BASE_URL||'http://127.0.0.1:8000';

  useEffect(()=>{loadProject()},[]);
  async function loadProject(){
    const id=localStorage.getItem('sylo_active_project_id');
    if(!id){setError('No active project. Join or create a project first.');return;}
    const {data,error}=await supabase.from('projects').select('id,title,public_summary,confidential_brief,status').eq('id',id).maybeSingle();
    if(error){setError(error.message);return;}
    if(!data){setError('Project not found or access denied.');return;}
    setProject(data);
  }
  async function askAI(e){
    e.preventDefault(); if(!prompt.trim()||!project||busy)return;
    setBusy(true);setError('');setAnswer('');
    try{
      const {data:{session}}=await supabase.auth.getSession();
      if(!session?.access_token)throw new Error('Your Supabase session has expired. Sign in again.');
      const res=await fetch(API+'/private-ai/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({project_id:project.id,prompt:prompt.trim()})});
      const body=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(body.detail||'Private AI request failed.');
      setAnswer(body.result||'No response returned.');
      onAddLedgerEntry?.({action:'PRIVATE_AI',actor:'Qwen3:4B',hash:project.id});
    }catch(err){setError(err?.message||'Private AI unavailable.');}
    finally{setBusy(false);}
  }
  return <div className="max-w-5xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Bot className="text-emerald-400 w-6 h-6"/>Project AI Scoping</h2><p className="text-gray-400 text-sm mt-1">Qwen3:4B runs through the FastAPI private-AI gateway. Access is scoped to this project.</p></div>
    {!project?<div className="border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500">Select a project first from Student or Sponsor.</div>:
    <><div className="bg-[#09090b] border border-gray-800 rounded-xl p-5"><div className="text-xs font-mono text-emerald-400 mb-2">ACTIVE PROJECT</div><h3 className="text-white font-semibold">{project.title}</h3><p className="text-sm text-gray-400 mt-2">{project.public_summary}</p></div>
    <div className="grid grid-cols-5 gap-6"><div className="col-span-3 flex flex-col bg-[#09090b] border border-gray-800 rounded-xl overflow-hidden h-[500px]">
      <div className="flex-1 p-6 overflow-y-auto space-y-6"><div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-emerald-400"/></div><div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 text-sm text-gray-300">Project context is authorized. Ask Qwen to break down the research problem, propose milestones, identify risks, or clarify the confidential brief.</div></div>{answer&&<div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap">{answer}</div>}</div>
      <form onSubmit={askAI} className="p-4 bg-black/60 border-t border-gray-800 flex gap-2"><input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Ask the private project AI..." className="flex-1 bg-[#050505] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white" disabled={busy}/><button disabled={busy||!prompt.trim()} className="px-4 bg-emerald-600 text-black rounded-lg disabled:opacity-50">{busy?<Loader2 className="animate-spin"/>:<SendIcon/>}</button></form>
    </div><div className="col-span-2 space-y-4"><h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2"><Code className="w-4 h-4"/>Project Context</h3><div className="bg-[#09090b] border border-gray-800 rounded-xl p-5 space-y-4"><div><div className="text-xs text-gray-500">STATUS</div><div className="text-sm text-white">{project.status}</div></div><div><div className="text-xs text-gray-500">PRIVATE AI</div><div className="text-sm text-emerald-400">Qwen3:4B / local Ollama</div></div><div><div className="text-xs text-gray-500">CONFIDENTIAL BRIEF</div><div className="text-sm text-gray-300">{project.confidential_brief?'Available to authorized members':'Not available'}</div></div><button onClick={()=>navigate('/charter')} className="w-full bg-emerald-950/40 text-emerald-400 border border-emerald-800 py-3 rounded-lg text-sm">Continue to Charter</button></div></div></div></>}
  </div>;
}
function SendIcon(){return <span className="font-bold">→</span>}
