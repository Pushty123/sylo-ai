import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Bot, UserCircle, ShieldCheck, Settings, LogOut, Menu, X, Briefcase, FileCheck, AlertTriangle } from 'lucide-react';
import LandingPage from './LandingPage';
import SponsorPostProblem from './SponsorPostProblem';
import StudentDashboard from './StudentDashboard';
import AiScoping from './AiScoping';
import ProjectCharter from './ProjectCharter';
import EscrowEngine from './EscrowEngine';
import CredentialVerification from './CredentialVerification';
import PlagiarismShield from './PlagiarismShield';
import AuthRolePortal from './AuthRolePortal';
import DisputeResolution from './DisputeResolution';
import JobPlacementHub from './JobPlacementHub';
import AdminPanel from './AdminPanel';
import StudentProfile from './StudentProfile';
import DemoTest from './DemoTest';
import Dashboard from './Dashboard';
import ProjectWorkspace from './ProjectWorkspace';
import ProfilePage from './ProfilePage';
import SyloLogo from './SyloLogo';
import VerifyIntegrityModal from './VerifyIntegrityModal';
import { supabase } from './supabase';

const navFor=(role)=>[
  {label:'Overview',to:'/app',icon:LayoutDashboard},
  {label:'Projects',to:'/student',icon:FolderKanban},...(role==='sponsor'||role==='expert'||role==='admin'?[{label:'Post project',to:'/sponsor',icon:Briefcase}]:[]),
  {label:'Workspace',to:'/workspace',icon:Briefcase},
  {label:'Private AI',to:'/scoping',icon:Bot},
  {label:'Integrity',to:'/shield',icon:ShieldCheck},
  {label:'Charter',to:'/charter',icon:FileCheck},
  {label:'Escrow',to:'/escrow',icon:Briefcase},
  {label:'Disputes',to:'/dispute',icon:AlertTriangle},
  {label:'Profile',to:'/profile',icon:UserCircle},
  {label:'Placement',to:'/placement',icon:Briefcase},
  ...(role==='admin'?[{label:'Admin',to:'/admin',icon:Settings}]:[])
];

function Shell({session,profile,children,onSignOut}){
  const [open,setOpen]=useState(true), location=useLocation(), navigate=useNavigate();
  const nav=navFor(profile?.role);
  return <div className="min-h-screen bg-[#050505] text-gray-300 flex">
    <aside className={(open?'w-64':'w-20')+' shrink-0 border-r border-gray-800 bg-[#080808] transition-all duration-200 hidden md:flex flex-col'}>
      <div className="h-16 px-4 border-b border-gray-800 flex items-center gap-3"><SyloLogo/><span className={open?'text-white font-bold tracking-wide':'hidden'}>Sylo AI</span></div>
      <div className="p-3 flex-1">
        <div className={open?'text-[10px] uppercase tracking-[.25em] text-gray-600 px-3 py-2':'hidden'}>Research OS</div>
        {nav.map(({label,to,icon:Icon})=><Link key={to} to={to} className={'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 '+(location.pathname===to?'bg-emerald-600 text-black font-semibold':'text-gray-400 hover:bg-gray-900 hover:text-white')}><Icon className="w-4 h-4 shrink-0"/><span className={open?'':'hidden'}>{label}</span></Link>)}
      </div>
      <div className="p-3 border-t border-gray-800 space-y-2">
        <button onClick={()=>setOpen(!open)} className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-white"><Menu className="w-4 h-4"/><span className={open?'text-xs':'hidden'}>{open?'Collapse':'Expand'}</span></button>
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-red-400"><LogOut className="w-4 h-4"/><span className={open?'text-xs':'hidden'}>Sign out</span></button>
      </div>
    </aside>

    <div className="flex-1 min-w-0">
      <header className="h-16 border-b border-gray-800 bg-black/80 backdrop-blur flex items-center justify-between px-5 sticky top-0 z-20">
        <div className="flex items-center gap-3"><button className="md:hidden text-gray-400" onClick={()=>setOpen(!open)}><Menu className="w-5 h-5"/></button><div className="text-xs text-gray-500">Authenticated workspace</div></div>
        <div className="flex items-center gap-3"><div className="text-right"><div className="text-sm text-white">{profile?.full_name||session?.user?.email}</div><div className="text-[10px] uppercase text-emerald-400">{profile?.role||'member'}</div></div><div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">{(profile?.full_name||'U').slice(0,1).toUpperCase()}</div></div>
      </header>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  </div>;
}

function Protected({session,children}){ return session?children:<Navigate to="/auth" replace/>; }

function AppRouter({session,profile,setTampered,tampered,addLedgerEntry}){
  const navigate=useNavigate();
  const signOut=async()=>{await supabase.auth.signOut();navigate('/');};
  return <Routes>
    <Route path="/" element={session?<Navigate to="/app" replace/>:<LandingPage/>}/>
    <Route path="/auth" element={session?<Navigate to="/app" replace/>:<AuthRolePortal onAddLedgerEntry={addLedgerEntry}/>}/>
    <Route path="/verify" element={<CredentialVerification/>}/>
    <Route path="/app" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><Dashboard profile={profile}/></Shell></Protected>}/>
    <Route path="/workspace" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/student" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><StudentDashboard onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/sponsor" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><SponsorPostProblem onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/scoping" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} initialTab="ai" onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/shield" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} initialTab="integrity" onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/charter" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} initialTab="finance" onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/escrow" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} initialTab="finance" onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/dispute" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProjectWorkspace profile={profile} initialTab="disputes" onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/placement" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><JobPlacementHub onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="/profile" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><ProfilePage/></Shell></Protected>}/>
    <Route path="/admin" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><AdminPanel onAddLedgerEntry={addLedgerEntry} onTriggerTamper={()=>setTampered(true)} isTampered={tampered}/></Shell></Protected>}/>
    <Route path="/test" element={<Protected session={session}><Shell session={session} profile={profile} onSignOut={signOut}><DemoTest onAddLedgerEntry={addLedgerEntry}/></Shell></Protected>}/>
    <Route path="*" element={<Navigate to={session?'/app':'/'} replace/>}/>
  </Routes>;
}

export default function App(){
  const [session,setSession]=useState(null),[profile,setProfile]=useState(null),[tampered,setTampered]=useState(false);
  const [ledgerEntries,setLedgerEntries]=useState([{seq:'0001',time:'Genesis',action:'INIT_SYSTEM',actor:'System',hash:'genesis'}]);
  useEffect(()=>{
    let mounted=true;
    async function sync(s){
      if(!mounted)return;
      setSession(s);
      if(!s?.user){setProfile(null);return;}
      const {data}=await supabase.from('profiles').select('id,full_name,role,organisation_id,avatar_url,bio').eq('id',s.user.id).maybeSingle();
      if(mounted)setProfile(data||null);
    }
    supabase.auth.getSession().then(({data})=>sync(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>sync(s));
    return()=>{mounted=false;subscription.unsubscribe()};
  },[]);
  const addLedgerEntry=({action,actor,hash})=>setLedgerEntries(p=>[{seq:String(p.length+1).padStart(4,'0'),time:'Now',action,actor,hash},...p]);
  return <BrowserRouter><AppRouter session={session} profile={profile} setTampered={setTampered} tampered={tampered} addLedgerEntry={addLedgerEntry}/>{session&&<div className="hidden"><VerifyIntegrityModal isOpen={false} ledgerEntries={ledgerEntries} isTampered={tampered}/></div>}</BrowserRouter>;
}
