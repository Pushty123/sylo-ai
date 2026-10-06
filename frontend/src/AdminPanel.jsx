import { useState } from 'react';
import { Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminPanel({ onAddLedgerEntry, onTriggerTamper, isTampered }) {
  const [userEmail, setUserEmail] = useState('');
  const [verifiedMsg, setVerifiedMsg] = useState('');

  const handleVerifyUser = (e) => {
    e.preventDefault();
    setVerifiedMsg(`User ${userEmail} verified successfully via DigiLocker L3.`);
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'ADMIN_VERIFY_USER',
        actor: 'System Admin',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'ad88'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="text-emerald-400 w-6 h-6" />
          Admin Panel & Tamper Demo Control
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage user verification levels and execute the live ledger tamper-evident demonstration[cite: 9, 10].
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* User Verification Control */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DigiLocker User Override
          </h3>
          <form onSubmit={handleVerifyUser} className="space-y-3">
            <input
              type="email"
              required
              placeholder="student@eastpoint.edu.in"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-2 rounded-lg text-sm transition"
            >
              Force Verify User Level 3
            </button>
          </form>
          {verifiedMsg && <div className="text-xs font-mono text-emerald-400">{verifiedMsg}</div>}
        </div>

        {/* Tamper Demo Control (Critical for Judges) */}
        <div className="bg-[#09090b] border border-gray-800 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-mono uppercase text-gray-500 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Cryptographic Tamper Demo
            </h3>
            <p className="text-xs text-gray-400 font-mono">
              Injects a bit-flip into ledger history to demonstrate real-time SHA-256 tree breakage for judges[cite: 10].
            </p>
          </div>

          <button
            onClick={onTriggerTamper}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition font-mono ${
              isTampered 
                ? 'bg-red-950/40 text-red-400 border border-red-800' 
                : 'bg-red-600 hover:bg-red-500 text-black shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }`}
          >
            {isTampered ? '⚠️ Ledger Tampered (Check Audit Modal)' : 'Simulate Hash Tamper Attack'}
          </button>
        </div>
      </div>
    </div>
  );
}