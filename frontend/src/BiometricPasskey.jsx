import { useState } from 'react';
import { Fingerprint, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function BiometricPasskey({ onAddLedgerEntry, onSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScanFingerprint = () => {
    setScanning(true);
    setSuccess(false);

    // Simulate biometric passkey hardware handshake
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);

      if (onAddLedgerEntry) {
        onAddLedgerEntry({
          action: 'BIOMETRIC_PASSKEY_VERIFIED',
          actor: 'Student / Hardware SecurID (TouchID/WinHello)',
          hash: '0x' + Math.random().toString(16).slice(2, 12) + 'bp99'
        });
      }

      // Automatically unlock the app after a brief success display
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full bg-[#09090b] border border-emerald-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-6">
        
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Sylo AI Security Gate</h2>
          <p className="text-gray-400 text-xs">
            Hardware-backed biometric passkey required to decrypt workspace and unlock ledger.
          </p>
        </div>

        <div className="relative flex items-center justify-center py-4">
          <div className={`absolute w-36 h-36 rounded-full border border-emerald-500/20 ${scanning ? 'animate-ping bg-emerald-500/10' : ''}`}></div>
          <button
            onClick={handleScanFingerprint}
            disabled={scanning}
            className={`w-28 h-28 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
              success 
                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                : scanning 
                ? 'bg-emerald-950/20 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-black/60 border-gray-800 text-gray-400 hover:border-emerald-500/60 hover:text-emerald-400 shadow-[0_0_15px_rgba(0,0,0,0.8)]'
            }`}
          >
            {scanning ? (
              <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
            ) : success ? (
              <ShieldCheck className="w-12 h-12 text-emerald-400 animate-bounce" />
            ) : (
              <Fingerprint className="w-14 h-14" />
            )}
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-mono text-gray-300">
            {scanning ? 'Scanning biometric sensor...' : success ? 'Passkey Verified! Unlocking...' : 'Touch sensor or click icon to authenticate'}
          </div>
          <div className="text-[10px] font-mono text-gray-500">
            FIPS 140-2 Level 3 Secure Enclave
          </div>
        </div>

        {success && (
          <div className="w-full bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex items-center gap-2 text-emerald-400 font-mono text-[11px] animate-fadeIn text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>Session bound successfully.</div>
          </div>
        )}

      </div>
    </div>
  );
}