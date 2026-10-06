import { useState } from 'react';
import { AlertTriangle, Lock, Unlock, ShieldAlert } from 'lucide-react';

export default function DisputeResolution({ onAddLedgerEntry }) {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [escrowFrozen, setEscrowFrozen] = useState(false);
  const [resolved, setResolved] = useState(false);

  const handleFileDispute = (e) => {
    e.preventDefault();
    if (!reason) return;
    setEscrowFrozen(true);
    setResolved(false);

    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'DISPUTE_FILED_ESCROW_FROZEN',
        actor: 'Student/Sponsor Dispute Gateway',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'd9f2'
      });
    }
  };

  const handleResolveAdmin = () => {
    setEscrowFrozen(false);
    setResolved(true);

    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'DISPUTE_RESOLVED_ADMIN',
        actor: 'Admin Authority',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'e8a3'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-400 w-6 h-6" />
          Dispute Resolution & Admin Override
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          File disputes with evidence ledger entries. Triggers automated escrow freeze until admin resolves[cite: 6].
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Dispute Filing Panel */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Raise a Dispute
          </h3>

          <form onSubmit={handleFileDispute} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400">Reason / Grievance</label>
              <textarea
                required
                rows="3"
                placeholder="Describe the milestone deviation or payment conflict..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400">Evidence Link / Log Hash</label>
              <input
                type="text"
                placeholder="https://github.com/... or tx hash"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold py-2.5 rounded-lg text-sm transition shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              File Dispute & Freeze Escrow
            </button>
          </form>
        </div>

        {/* Escrow Status & Admin Control Panel */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2 mb-4">
              {escrowFrozen ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
              Escrow Security Status
            </h3>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg border font-mono text-xs ${
                escrowFrozen 
                  ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                  : resolved 
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                  : 'bg-black/40 border-gray-800 text-gray-400'
              }`}>
                {escrowFrozen ? (
                  <div>
                    <span className="font-bold block mb-1">ESCROW FROZEN:</span> Funds locked pending admin review of evidence logs[cite: 6].
                  </div>
                ) : resolved ? (
                  <div>
                    <span className="font-bold block mb-1">DISPUTE RESOLVED:</span> Admin override applied. Escrow unfrozen and distributed.
                  </div>
                ) : (
                  <div>
                    <span className="font-bold block mb-1">SYSTEM NOMINAL:</span> No active disputes logged. Escrow active.
                  </div>
                )}
              </div>
            </div>
          </div>

          {escrowFrozen && (
            <button
              onClick={handleResolveAdmin}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-2.5 rounded-lg text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              Admin Override & Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}