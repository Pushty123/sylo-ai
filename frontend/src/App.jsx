import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import SyloLogo from './SyloLogo';
import VerifyIntegrityModal from './VerifyIntegrityModal';
import { supabase } from './supabase';

function AppLayout({ ledgerEntries, addLedgerEntry, isTampered, setIsTampered, session, profile }) {
  const location = useLocation();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  if (location.pathname === '/') return <LandingPage />;

  return (
    <div className="flex h-screen bg-black text-gray-300 font-sans selection:bg-emerald-900 selection:text-emerald-100">
      <main className="w-3/4 p-10 overflow-y-auto border-r border-gray-800 relative">
        <header className="absolute top-0 left-0 w-full p-6 bg-black/70 backdrop-blur-md border-b border-gray-900 flex justify-between items-center z-10">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3"><SyloLogo /><h1 className="text-xl font-semibold tracking-wide text-gray-100">Sylo AI</h1></div>
            <nav className="flex gap-3 text-xs font-mono text-gray-500 overflow-x-auto py-1">
              {[['Home','/'],['Auth','/auth'],['Sponsor','/sponsor'],['Student','/student'],['Scoping','/scoping'],['Shield','/shield'],['Charter','/charter'],['Escrow','/escrow'],['Disputes','/dispute'],['Placement','/placement'],['Test','/test'],['Profile','/profile'],['Admin','/admin'],['Verify QR','/verify']].map(([label,path])=><Link key={path} to={path} className="hover:text-emerald-400 transition">{label}</Link>)}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-md border border-gray-800">
              {profile?.full_name || session?.user?.email || 'Not signed in'}
            </div>
            {session && <button onClick={()=>supabase.auth.signOut()} className="text-xs px-3 py-1.5 border border-gray-800 rounded-md hover:border-red-500 hover:text-red-400">Sign out</button>}
          </div>
        </header>
        <div className="mt-20">
          <Routes>
            <Route path="/auth" element={<AuthRolePortal onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/sponsor" element={<SponsorPostProblem onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/student" element={<StudentDashboard onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/scoping" element={<AiScoping onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/shield" element={<PlagiarismShield onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/charter" element={<ProjectCharter onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/escrow" element={<EscrowEngine onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/dispute" element={<DisputeResolution onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/placement" element={<JobPlacementHub onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/test" element={<DemoTest onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/profile" element={<StudentProfile onAddLedgerEntry={addLedgerEntry} />} />
            <Route path="/admin" element={<AdminPanel onAddLedgerEntry={addLedgerEntry} onTriggerTamper={()=>setIsTampered(true)} isTampered={isTampered} />} />
            <Route path="/verify" element={<CredentialVerification />} />
          </Routes>
        </div>
      </main>
      <aside className="w-1/4 bg-[#050505] p-6 flex flex-col relative overflow-hidden">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2 z-10"><div className={'w-2 h-2 rounded-full ' + (isTampered ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse')}></div>Live Ledger</h2>
        <div className="flex-1 border border-gray-800/60 rounded-lg p-3 bg-black/40 backdrop-blur-sm overflow-y-auto z-10 mb-4 space-y-2">
          {ledgerEntries.map((entry,index)=><div key={index} className={'p-3 rounded font-mono text-[10px] border ' + (isTampered && index===1?'bg-red-950/30 border-red-900/60':'bg-gray-900/50 border-gray-800')}>
            <div className="flex justify-between text-gray-500 mb-1"><span>SEQ:{entry.seq}</span><span>{entry.time}</span></div>
            <div className={isTampered&&index===1?'text-red-400 font-semibold':'text-emerald-400 font-semibold'}>{entry.action}</div>
            <div className="text-gray-400">{entry.actor}</div>
            <div className="text-gray-600 truncate mt-1">hash: {isTampered&&index===1?'0xCORRUPTED':entry.hash}</div>
          </div>)}
        </div>
        <button onClick={()=>setIsAuditModalOpen(true)} className={'w-full py-3 rounded-md font-mono text-sm z-10 ' + (isTampered?'bg-red-950/40 text-red-400 border border-red-800':'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50')}>Verify Integrity</button>
      </aside>
      <VerifyIntegrityModal isOpen={isAuditModalOpen} onClose={()=>setIsAuditModalOpen(false)} ledgerEntries={ledgerEntries} isTampered={isTampered} />
    </div>
  );
}

export default function App() {
  const [isTampered,setIsTampered]=useState(false);
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [ledgerEntries,setLedgerEntries]=useState([{seq:'0001',time:'Just now',action:'INIT_SYSTEM',actor:'System',hash:'8f43b2c1...99a0'}]);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async (nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession?.user) { setProfile(null); return; }
      const {data,error}=await supabase.from('profiles').select('id,full_name,role,organisation_id,avatar_url,bio').eq('id',nextSession.user.id).maybeSingle();
      if (mounted && !error) setProfile(data);
    };
    supabase.auth.getSession().then(({data})=>loadProfile(data.session));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,nextSession)=>loadProfile(nextSession));
    return () => { mounted=false; subscription.unsubscribe(); };
  }, []);

  const addLedgerEntry=({action,actor,hash})=>{
    setLedgerEntries(prev=>[{seq:String(prev.length+1).padStart(4,'0'),time:'Just now',action,actor,hash},...prev]);
  };
  return <BrowserRouter><AppLayout ledgerEntries={ledgerEntries} addLedgerEntry={addLedgerEntry} isTampered={isTampered} setIsTampered={setIsTampered} session={session} profile={profile}/></BrowserRouter>;
}
