import { useState } from 'react';
import { FileSignature, CheckCircle, Scale, Shield, History } from 'lucide-react';

export default function ProjectCharter({ onAddLedgerEntry }) {
  const [isSigned, setIsSigned] = useState(false);
  const [charterHash, setCharterHash] = useState(null);

  const handleSign = () => {
    // Generate a mock hash for the signature
    const hash = '0x' + Math.random().toString(16).slice(2, 12) + 'f8c9';
    setCharterHash(hash);
    setIsSigned(true);

    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'CHARTER_SIGNED',
        actor: 'Student (Team Alpha)',
        hash: hash
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileSignature className="text-emerald-400 w-6 h-6" />
          Versioned Project Charter
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Immutable 9-clause agreement generated from AI scoping. Requires digital signature to execute escrow.
        </p>
      </div>

      <div className={`bg-[#09090b] border ${isSigned ? 'border-emerald-900/50' : 'border-gray-800'} rounded-xl p-8 relative overflow-hidden transition-all duration-500 shadow-lg`}>
        {isSigned && (
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
        )}

        <div className="flex justify-between items-start mb-8 border-b border-gray-800/60 pb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-100">LLM Watermarking for Code Repositories</h3>
            <div className="flex items-center gap-4 mt-2 text-xs font-mono text-gray-500">
              <span className="flex items-center gap-1"><History className="w-3 h-3" /> v1.0.0 (FINAL)</span>
              <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> Standard Jurisdiction</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-bold text-lg">$5,000 USD</div>
            <div className="text-xs text-gray-500 font-mono mt-1">Platform Fee: $0.00</div>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-gray-500">Clause 1: Scope of Work</h4>
              <p className="bg-black/40 p-3 rounded border border-gray-800/50 leading-relaxed">Execution of 3-phase milestone plan derived from AI Scoping session (Seq: 0002).</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-gray-500">Clause 4: Escrow & Payout</h4>
              <p className="bg-black/40 p-3 rounded border border-gray-800/50 leading-relaxed">Funds locked in smart escrow. Payouts distributed proportionally upon verified milestone delivery.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-gray-500">Clause 7: IP Assignment</h4>
              <p className="bg-black/40 p-3 rounded border border-gray-800/50 leading-relaxed">Full intellectual property transfers to Sponsor upon final milestone acceptance and payout.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-gray-500">Clause 9: Plagiarism Shield</h4>
              <p className="bg-black/40 p-3 rounded border border-gray-800/50 leading-relaxed">Submission strictly subject to &lt;70% similarity flag via integrated air-gapped checking.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800/60 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-gray-500">Sponsor Signature: <span className="text-emerald-400">Pre-authorized (Acme Corp)</span></div>
            <div className="text-xs font-mono text-gray-500">Student Signature: {isSigned ? <span className="text-emerald-400">Verified</span> : <span className="text-amber-500">Pending...</span>}</div>
          </div>

          {!isSigned ? (
            <button
              onClick={handleSign}
              className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-2 px-6 rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Cryptographically Sign Charter
            </button>
          ) : (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5" />
                Charter Locked & Active
              </div>
              <div className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {charterHash}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}