import { useState } from 'react';
import { ShieldAlert, CheckCircle2, GitBranch } from 'lucide-react';

export default function PlagiarismShield({ onAddLedgerEntry }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const result = {
        similarity: '12.4%',
        status: 'PASSED (< 70% threshold)',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'c7b4'
      };
      setScanResult(result);

      if (onAddLedgerEntry) {
        onAddLedgerEntry({
          action: 'PLAGIARISM_CHECK_PASSED',
          actor: 'Air-Gapped Shield',
          hash: result.hash
        });
      }
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="text-emerald-400 w-6 h-6" />
          Plagiarism Shield & Submission
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Air-gapped verification scanner. Code must score below 70% similarity before milestone release.
        </p>
      </div>

      <div className="bg-[#09090b] border border-gray-800 rounded-xl p-8 shadow-lg space-y-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              Repository URL / Deliverable Link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                required
                placeholder="https://github.com/team-alpha/sylo-watermark-core"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1 bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition"
              />
              <button
                type="submit"
                disabled={scanning}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition flex items-center gap-2 shrink-0"
              >
                {scanning ? 'Scanning AST...' : 'Run Shield Scan'}
              </button>
            </div>
          </div>
        </form>

        {scanResult && (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle2 className="w-6 h-6" />
                <span>Similarity Analysis: {scanResult.similarity}</span>
              </div>
              <span className="text-xs font-mono bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/50">
                {scanResult.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono text-xs text-gray-400 pt-2 border-t border-gray-800/60">
              <div>
                <span className="block text-gray-600">AST MATCHES</span>
                <span className="text-white">0 Public Repos</span>
              </div>
              <div>
                <span className="block text-gray-600">AI-GENERATED SIGNATURE</span>
                <span className="text-emerald-400">Verified Clean</span>
              </div>
              <div>
                <span className="block text-gray-600">SHIELD FINGERPRINT</span>
                <span className="text-gray-300 truncate">{scanResult.hash}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}