import { useState } from 'react';
import { DollarSign, PieChart, ShieldCheck, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function EscrowEngine({ onAddLedgerEntry }) {
  const [isReleased, setIsReleased] = useState(false);

  // Core financial logic based on your specs
  const totalBudget = 5000;
  const platformFee = 0; // $0 platform fee as requested
  const computeReserve = totalBudget * 0.10; // 10% for compute
  const mentorShare = totalBudget * 0.15; // 15% to mentor
  const studentShare = totalBudget * 0.75; // 75% to student team

  const handleReleaseFunds = () => {
    setIsReleased(true);
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'FUNDS_RELEASED',
        actor: 'Smart Escrow Contract',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'e9a1'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="text-emerald-400 w-6 h-6" />
          Escrow & Payout Engine
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Zero-fee transparent payout distribution. Funds are locked in escrow until the final milestone is verified.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Breakdown Panel */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-mono uppercase text-gray-500 mb-6 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> Escrow Split Breakdown
          </h3>
          
          <div className="space-y-4 font-mono">
            <div className="flex justify-between items-end border-b border-gray-800/60 pb-2">
              <div>
                <div className="text-emerald-400 text-sm">Total Locked Value</div>
                <div className="text-xs text-gray-500 mt-1">Project: PRJ-8092</div>
              </div>
              <div className="text-xl text-white font-bold">${totalBudget.toLocaleString()}</div>
            </div>

            <div className="flex justify-between text-sm text-gray-400 pt-2">
              <span>Platform Fee (0%)</span>
              <span className="text-gray-600">${platformFee}</span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>Compute Reserve (10%)</span>
              <span>${computeReserve.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-400">
              <span>Mentor Share (15%)</span>
              <span>${mentorShare.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm text-emerald-400 font-bold bg-emerald-950/20 p-2 rounded border border-emerald-900/30 mt-2">
              <span>Student Impact Share (75%)</span>
              <span>${studentShare.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase text-gray-500 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Contract Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Charter Cryptographically Signed
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Plagiarism Shield Verified (&lt;5% similarity)
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sponsor Final Approval Logged
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800">
            {!isReleased ? (
              <button 
                onClick={handleReleaseFunds}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-3 rounded-lg transition shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Execute Ledger Payout <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-lg p-4 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-emerald-400 font-bold">Funds Distributed</div>
                <div className="text-xs font-mono text-gray-500 mt-1">Transactions recorded on ledger</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}