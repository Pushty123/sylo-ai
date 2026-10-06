import { useState } from 'react';
import { ShieldCheck, Lock, Globe, FileText, CheckCircle2 } from 'lucide-react';

export default function SponsorPostProblem({ onAddLedgerEntry }) {
  const [formData, setFormData] = useState({
    title: '',
    budget: '',
    summary: '',
    confidentialBrief: '',
  });

  const [receipt, setReceipt] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.budget) return;

    // Generate mock SHA-256 fingerprint for tamper-evident ledger receipt
    const mockHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const timestamp = new Date().toISOString();

    const newReceipt = {
      id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formData.title,
      budget: formData.budget,
      fingerprint: mockHash,
      timestamp: timestamp,
    };

    setReceipt(newReceipt);

    // Push to Live Ledger
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'POST_PROBLEM',
        actor: 'Sponsor (Acme Corp)',
        hash: mockHash.slice(0, 10) + '...',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-emerald-400 w-6 h-6" />
          Sponsor: Post Problem Statement
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Create a two-tier project listing. Public summary is visible globally; confidential brief is locked behind Supabase RLS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-[#09090b] border border-gray-800 p-6 rounded-xl backdrop-blur-md">
        
        {/* Title & Budget */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-mono uppercase text-gray-400">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. LLM Watermarking for Code Repositories"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-gray-400">Budget ($ USD)</label>
            <input
              type="number"
              required
              placeholder="5000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Public Summary */}
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Public Summary (Visible to All Students & Mentors)
          </label>
          <textarea
            rows={3}
            required
            placeholder="High-level overview describing the core problem without exposing sensitive IP..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* RLS Locked Brief */}
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Confidential Brief (RLS Locked — Signed Team Members Only)
          </label>
          <textarea
            rows={4}
            required
            placeholder="Detailed requirements, proprietary datasets, target benchmarks, confidential deliverables..."
            value={formData.confidentialBrief}
            onChange={(e) => setFormData({ ...formData, confidentialBrief: e.target.value })}
            className="w-full bg-black/60 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-2.5 rounded-lg transition shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          Publish Listing & Register Ledger Hash
        </button>
      </form>

      {/* Confirmation Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c0c0e] border border-emerald-500/40 rounded-xl p-6 max-w-md w-full space-y-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">Project Receipt Issued</h3>
            </div>

            <div className="space-y-2 text-xs font-mono bg-black/80 border border-gray-800 p-4 rounded-lg">
              <div className="flex justify-between border-b border-gray-800 pb-1 text-gray-400">
                <span>PROJECT ID</span>
                <span className="text-white">{receipt.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-1 text-gray-400">
                <span>BUDGET</span>
                <span className="text-emerald-400">${receipt.budget}</span>
              </div>
              <div className="border-b border-gray-800 pb-1">
                <span className="text-gray-400 block mb-0.5">SHA-256 FINGERPRINT</span>
                <span className="text-emerald-400 break-all">{receipt.fingerprint}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">TIMESTAMPER</span>
                <span className="text-gray-300">{receipt.timestamp}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Stamped to ledger. Viewable on audit route.
            </p>

            <button
              onClick={() => setReceipt(null)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded text-sm transition"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}