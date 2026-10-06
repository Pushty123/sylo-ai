import { Search, Shield, Lock, ArrowRight, Code2 } from 'lucide-react';

export default function StudentDashboard({ onAddLedgerEntry }) {
  // Hardcoded mock project for Phase 1 demo
  const mockProject = {
    id: 'PRJ-8092',
    title: 'LLM Watermarking for Code Repositories',
    sponsor: 'Acme Corp',
    budget: 5000,
    summary: 'High-level overview describing the core problem without exposing sensitive IP. The goal is to track AI-generated code snippets across our internal monorepo.',
    status: 'Open for Bids'
  };

  const handleBid = () => {
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'INIT_BID',
        actor: 'Student (Team Alpha)',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'a1b2c3'
      });
    }
    alert('Bid initiated! Transitioning to AI Scoping Phase...');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code2 className="text-emerald-400 w-6 h-6" />
            Active Projects Hub
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Browse public project summaries. Submit a bid to unlock confidential briefs and initiate AI scoping.
          </p>
        </div>
        
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-[#09090b] border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {/* Project Card */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50">
                  {mockProject.id}
                </span>
                <span className="text-xs font-mono text-gray-500">{mockProject.sponsor}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100">{mockProject.title}</h3>
            </div>
            <div className="text-right">
              <div className="text-emerald-400 font-bold">${mockProject.budget}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{mockProject.status}</div>
            </div>
          </div>

          <div className="bg-black/50 border border-gray-800/60 rounded-lg p-4 mb-4">
            <h4 className="text-xs font-mono text-gray-500 uppercase mb-2">Public Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {mockProject.summary}
            </p>
          </div>

          <div className="bg-gray-900/30 border border-dashed border-gray-800 rounded-lg p-4 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-3 text-gray-500">
              <Lock className="w-5 h-5 text-amber-500/70" />
              <div className="text-sm">
                <span className="font-semibold text-gray-400">Confidential Brief Locked</span>
                <p className="text-xs">Requires approved bid and signed digital charter to view IP.</p>
              </div>
            </div>
            
            <button 
              onClick={handleBid}
              className="flex items-center gap-2 bg-gray-100 hover:bg-white text-black px-4 py-2 rounded-md text-sm font-semibold transition"
            >
              Draft Bid <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}