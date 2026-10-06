// LedgerChain.jsx — the tamper-evident ledger shown as a chain of linked blocks, with one-click verification.
import { useEffect, useState } from 'react';
import { Link2, ShieldCheck, ShieldAlert, Loader2, Blocks } from 'lucide-react';
import { supabase } from './supabase';

const LABEL = {
  PROJECTS_CREATED:'Project created', PROJECT_MEMBERS_CREATED:'Member joined', CHARTERS_CREATED:'Charter published',
  CHARTER_ACCEPTED:'Charter accepted', ESCROWS_CREATED:'Escrow opened', ESCROW_FUNDED:'Escrow funded',
  CONTRIBUTIONS_CREATED:'Contribution submitted', MILESTONE_APPROVED:'Milestone approved', PAYOUTS_CREATED:'Payout released',
  CREDENTIALS_CREATED:'Credential issued', DISPUTES_CREATED:'Dispute raised'
};
const short = (h) => (h ? h.slice(0, 10) + '…' + h.slice(-6) : 'GENESIS');

export default function LedgerChain(){
  const [projects,setProjects]=useState([]),[pid,setPid]=useState(''),[entries,setEntries]=useState([]),[loading,setLoading]=useState(true);
  const [result,setResult]=useState(null),[verifying,setVerifying]=useState(false),[err,setErr]=useState('');

  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    const {data:m}=await supabase.from('project_members').select('project_id').eq('user_id',user.id).eq('status','active');
    const ids=(m||[]).map(x=>x.project_id);
    if(!ids.length){setLoading(false);return;}
    const {data:p}=await supabase.from('projects').select('id,title,status').in('id',ids).order('created_at',{ascending:false});
    setProjects(p||[]);
    const active=(p||[]).find(x=>x.status==='active')||(p||[])[0];
    if(active)setPid(active.id);else setLoading(false);
  })();},[]);

  useEffect(()=>{if(!pid)return;(async()=>{
    setLoading(true);setResult(null);setErr('');
    const {data,error}=await supabase.from('ledger_entries').select('id,sequence_number,event_type,entity_type,previous_hash,entry_hash,created_at,event_data').eq('project_id',pid).order('sequence_number');
    if(error)setErr(error.message);
    setEntries(data||[]);setLoading(false);
  })();},[pid]);

  async function verify(){
    setVerifying(true);setErr('');setResult(null);
    await new Promise(r=>setTimeout(r,700));
    const {data,error}=await supabase.rpc('verify_project_ledger',{p_project_id:pid});
    if(error)setErr(error.message);else setResult(data);
    setVerifying(false);
  }

  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><div className="text-xs uppercase tracking-[.25em] text-emerald-400">Proof</div><h2 className="text-3xl font-bold text-white mt-2">Tamper-evident ledger</h2><p className="text-gray-400 mt-2 max-w-2xl">Every important action is a block. Each block stores the SHA-256 hash of the one before it, so changing any past record breaks the chain.</p></div>
      <div className="flex gap-3">
        <select value={pid} onChange={e=>setPid(e.target.value)} className="bg-black border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white max-w-xs">
          {projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button onClick={verify} disabled={!pid||verifying} className="bg-emerald-600 text-black px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50">
          {verifying?<Loader2 className="w-4 h-4 animate-spin"/>:<ShieldCheck className="w-4 h-4"/>}Verify chain
        </button>
      </div>
    </div>

    {result&&<div className={'rounded-xl border p-4 flex items-center gap-3 '+(result.valid?'border-emerald-700 bg-emerald-950/30':'border-red-800 bg-red-950/30')}>
      {result.valid?<ShieldCheck className="w-6 h-6 text-emerald-400"/>:<ShieldAlert className="w-6 h-6 text-red-400"/>}
      <div><div className={'font-semibold '+(result.valid?'text-emerald-300':'text-red-300')}>{result.valid?`Chain intact — all ${result.checked_entries} blocks verified`:`Chain broken at block #${result.broken_sequence}`}</div>
      <div className="text-xs text-gray-400 font-mono mt-0.5">root hash {short(result.root_hash)}</div></div>
    </div>}
    {err&&<div className="border border-red-900 bg-red-950/20 text-red-300 p-4 rounded-xl text-sm">{err}</div>}

    {loading?<div className="text-gray-500 p-6">Loading ledger…</div>:!projects.length?<div className="border border-gray-800 rounded-xl p-8 text-center text-gray-400">Join a project to see its ledger.</div>:
    <div className="relative">
      {entries.map((e,i)=>{const bad=result&&!result.valid&&e.sequence_number>=result.broken_sequence;const ok=result&&!bad;return <div key={e.id}>
        {i>0&&<div className="flex justify-center py-1"><Link2 className={'w-4 h-4 rotate-90 '+(bad?'text-red-500':ok?'text-emerald-500':'text-gray-600')}/></div>}
        <div className={'rounded-xl border p-4 bg-[#09090b] transition '+(bad?'border-red-800':ok?'border-emerald-800':'border-gray-800')}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><div className={'w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold '+(ok?'bg-emerald-950 text-emerald-400':'bg-gray-900 text-gray-400')}>#{e.sequence_number}</div>
              <div><div className="text-white text-sm font-semibold">{LABEL[e.event_type]||e.event_type}</div><div className="text-[11px] text-gray-500">{new Date(e.created_at).toLocaleString()}</div></div></div>
            <Blocks className="w-4 h-4 text-gray-600"/>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mt-3 font-mono text-[11px]">
            <div className="bg-black/50 border border-gray-800 rounded px-2 py-1.5 text-gray-500">prev <span className="text-gray-300">{short(e.previous_hash)}</span></div>
            <div className="bg-black/50 border border-gray-800 rounded px-2 py-1.5 text-gray-500">hash <span className="text-emerald-300">{short(e.entry_hash)}</span></div>
          </div>
        </div>
      </div>})}
    </div>}
  </div>;
}
