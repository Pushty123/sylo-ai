import { ShieldCheck, X, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function VerifyIntegrityModal({ isOpen, onClose, ledgerEntries, isTampered }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#0c0c0e] border border-emerald-500/40 rounded-xl p-6 max-w-2xl w-full space-y-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="font-bold text-lg text-white">Cryptographic Ledger Audit</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        {isTampered ? (
          <div className="bg-red-950/30 border border-red-900/60 p-4 rounded-lg flex items-center gap-3 text-red-400 font-mono text-xs">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">INTEGRITY CHECK FAILED:</span> Root hash mismatch detected! Chain broken at Block SEQ:0002 due to unauthorized payload modification[cite: 10].
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-lg flex items-center gap-3 text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">INTEGRITY CHECK PASSED:</span> All {ledgerEntries.length} blocks successfully verified. Genesis hash matches root.
            </div>
          </div>
        )}

        {/* Block List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 font-mono text-xs">
          {ledgerEntries.map((entry, idx) => (
            <div key={idx} className={`bg-black/60 border p-3 rounded-lg flex items-center justify-between ${isTampered && idx === 1 ? 'border-red-500/80 bg-red-950/10' : 'border-gray-800'}`}>
              <div className="space-y-1">
                <div className="text-gray-500">BLOCK SEQ:{entry.seq} — {entry.time}</div>
                <div className="text-emerald-400 font-semibold">{entry.action} ({entry.actor})</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-[10px]">FINGERPRINT</div>
                <div className={`font-mono text-[11px] ${isTampered && idx === 1 ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                  {isTampered && idx === 1 ? '0xCORRUPTED_HASH_FF99' : entry.hash}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-6 py-2 rounded-lg text-sm transition"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}