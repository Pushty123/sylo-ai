import { useState } from 'react';
import { ShieldCheck, Lock, Globe, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from './supabase';

export default function SponsorPostProblem({ onAddLedgerEntry }) {
  const [formData,setFormData]=useState({title:'',budget:'',summary:'',confidentialBrief:''});
  const [receipt,setReceipt]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!formData.title||!formData.budget||!formData.summary||!formData.confidentialBrief)return;
    setBusy(true);setError('');
    try{
      const {data,error:rpcError}=await supabase.rpc('create_project',{
        p_title:formData.title.trim(),
        p_public_summary:formData.summary.trim(),
        p_confidential_brief:formData.confidentialBrief.trim(),
        p_budget:Number(formData.budget),
        p_currency:'INR'
      });
      if(rpcError)throw rpcError;
      const project=data;
      localStorage.setItem('sylo_active_project_id',project.id);
      const timestamp=new Date().toISOString();
      setReceipt({id:project.id,title:project.title,budget:project.budget,timestamp});
      onAddLedgerEntry?.({action:'POST_PROBLEM',actor:'Sponsor',hash:project.id});
    }catch(err){setError(err?.message||'Could not create project.');}
    finally{setBusy(false);}
  };

  return <div className="max-w-3xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-emerald-400 w-6 h-6"/>Sponsor: Post Problem Statement</h2>
    <p className="text-gray-400 text-sm mt-1">Publish a real Supabase project. The creator is automatically added as an active project member.</p></div>
    <form onSubmit={handleSubmit} className="space-y-5 bg-[#09090b] border border-gray-800 p-6 rounded-xl">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-1"><label className="text-xs font-mono uppercase text-gray-400">Project Title</label><input required value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white"/></div>
        <div className="space-y-1"><label className="text-xs font-mono uppercase text-gray-400">Budget (INR)</label><input type="number" min="0" required value={formData.budget} onChange={e=>setFormData({...formData,budget:e.target.value})} className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white"/></div>
      </div>
      <div className="space-y-1"><label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-400"/>Public Summary</label><textarea rows={3} required value={formData.summary} onChange={e=>setFormData({...formData,summary:e.target.value})} className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white"/></div>
      <div className="space-y-1"><label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-amber-400"/>Confidential Brief</label><textarea rows={4} required value={formData.confidentialBrief} onChange={e=>setFormData({...formData,confidentialBrief:e.target.value})} className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white"/></div>
      <button disabled={busy} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg">{busy?'Publishing...':'Publish Listing'}</button>
    </form>
    {error&&<div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 text-red-300 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
    {receipt&&<div className="bg-[#0c0c0e] border border-emerald-500/40 rounded-xl p-6 space-y-4"><div className="flex items-center gap-3 text-emerald-400"><CheckCircle2/><h3 className="font-bold text-lg text-white">Project Created</h3></div><div className="font-mono text-xs space-y-2"><div>PROJECT ID: <span className="text-white">{receipt.id}</span></div><div>BUDGET: <span className="text-emerald-400">₹{receipt.budget}</span></div><div>CREATED: <span className="text-gray-300">{receipt.timestamp}</span></div></div><div className="text-xs text-gray-400 flex gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400"/>Creator membership and project scope are active.</div><button onClick={()=>setReceipt(null)} className="w-full bg-gray-800 text-white py-2 rounded">Close</button></div>}
  </div>;
}
