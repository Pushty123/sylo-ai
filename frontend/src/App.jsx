import { useState } from 'react';
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

function AppLayout({ ledgerEntries, addLedgerEntry, isTampered, setIsTampered }) {
  const location = useLocation();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Render full-screen Landing Page on root
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  // Render Dashboard Layout on all other routes
  return (
    <div className="flex h-screen bg-black text-gray-300 font-sans selection:bg-emerald-900 selection:text-emerald-100">
      {/* Main Content Area */}
      <main className="w-3/4 p-10 overflow-y-auto border-r border-gray-800 relative">
        <header className="absolute top-0 left-0 w-full p-6 bg-black/70 backdrop-blur-md border-b border-gray-900 flex justify-between items-center z-10">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <SyloLogo />
              <h1 className="text-xl font-semibold tracking-wide text-gray-100">Sylo AI</h1>
            </div>
            
            <nav className="flex gap-3 text-xs font-mono text-gray-500 overflow-x-auto py-1">
              <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
              <Link to="/auth" className="hover:text-emerald-400 transition">Auth</Link>
              <Link to="/sponsor" className="hover:text-emerald-400 transition">Sponsor</Link>
              <Link to="/student" className="hover:text-emerald-400 transition">Student</Link>
              <Link to="/scoping" className="hover:text-emerald-400 transition">Scoping</Link>
              <Link to="/shield" className="hover:text-emerald-400 transition">Shield</Link>
              <Link to="/charter" className="hover:text-emerald-400 transition">Charter</Link>
              <Link to="/escrow" className="hover:text-emerald-400 transition">Escrow</Link>
              <Link to="/dispute" className="hover:text-emerald-400 transition">Disputes</Link>
              <Link to="/placement" className="hover:text-emerald-400 transition">Placement</Link>
              <Link to="/test" className="hover:text-emerald-400 transition">Test</Link>
              <Link to="/profile" className="hover:text-emerald-400 transition text-emerald-400 font-bold">Profile</Link>
              <Link to="/admin" className="hover:text-emerald-400 transition">Admin</Link>
              <Link to="/verify" className="hover:text-emerald-400 transition">Verify QR</Link>
            </nav>
          </div>
          
          <div className="flex gap-3">
            <div className="text-xs font-mono text-gray-500 bg-gray-900 px-3 py-1.5 rounded-md border border-gray-800">
              Network: <span className={isTampered ? "text-red-400" : "text-emerald-400"}>{isTampered ? "COMPROMISED" : "Secured"}</span>
            </div>
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
            <Route path="/admin" element={<AdminPanel onAddLedgerEntry={addLedgerEntry} onTriggerTamper={() => setIsTampered(true)} isTampered={isTampered} />} />
            <Route path="/verify" element={<CredentialVerification />} />
          </Routes>
        </div>
      </main>

      {/* Live Ledger Sidebar */}
      <aside className="w-1/4 bg-[#050505] p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2 z-10">
          <div className={`w-2 h-2 rounded-full ${isTampered ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
          Live Ledger
        </h2>
        
        <div className="flex-1 border border-gray-800/60 rounded-lg p-3 bg-black/40 backdrop-blur-sm overflow-y-auto z-10 mb-4 space-y-2">
          {ledgerEntries.map((entry, index) => (
            <div key={index} className={`p-3 rounded font-mono text-[10px] border ${isTampered && index === 1 ? 'bg-red-950/30 border-red-900/60' : 'bg-gray-900/50 border-gray-800'}`}>
              <div className="flex justify-between text-gray-500 mb-1">
                <span>SEQ:{entry.seq}</span>
                <span>{entry.time}</span>
              </div>
              <div className={isTampered && index === 1 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>{entry.action}</div>
              <div className="text-gray-400">{entry.actor}</div>
              <div className="text-gray-600 truncate mt-1">hash: {isTampered && index === 1 ? '0xCORRUPTED' : entry.hash}</div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setIsAuditModalOpen(true)}
          className={`w-full py-3 rounded-md font-mono text-sm z-10 transition-all duration-300 ${
            isTampered 
              ? 'bg-red-950/40 text-red-400 border border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 hover:border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
          }`}
        >
          Verify Integrity
        </button>
      </aside>

      <VerifyIntegrityModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        ledgerEntries={ledgerEntries} 
        isTampered={isTampered}
      />
    </div>
  );
}

export default function App() {
  const [isTampered, setIsTampered] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState([
    { seq: '0001', time: 'Just now', action: 'INIT_SYSTEM', actor: 'System', hash: '8f43b2c1...99a0' },
    { seq: '0002', time: '5m ago', action: 'POST_PROBLEM', actor: 'Sponsor (Netra)', hash: '3a91c4e2...bb12' }
  ]);

  const addLedgerEntry = ({ action, actor, hash }) => {
    const nextSeq = String(ledgerEntries.length + 1).padStart(4, '0');
    setLedgerEntries(prev => [
      { seq: nextSeq, time: 'Just now', action, actor, hash },
      ...prev
    ]);
  };

  return (
    <BrowserRouter>
      <AppLayout 
        ledgerEntries={ledgerEntries} 
        addLedgerEntry={addLedgerEntry} 
        isTampered={isTampered} 
        setIsTampered={setIsTampered} 
      />
    </BrowserRouter>
  );
}