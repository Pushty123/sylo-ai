import { useState } from 'react';
import { Briefcase, CheckCircle2, Building2, Award } from 'lucide-react';

export default function JobPlacementHub({ onAddLedgerEntry }) {
  const [offers, setOffers] = useState([
    { id: 1, company: 'Acme Corp', role: 'AI Security Engineer', salary: '$140k/yr', status: 'Pending Review', linkedCharter: 'PRJ-8092' },
    { id: 2, company: 'Netra Eye Hospital', role: 'ML Research Lead', salary: '$130k/yr', status: 'Eligible (Charter Verified)', linkedCharter: 'PRJ-8095' }
  ]);

  const handleAcceptOffer = (id, company) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Accepted & Locked' } : o));
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'JOB_OFFER_ACCEPTED',
        actor: 'Student (Team Alpha)',
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'f4b1'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Briefcase className="text-emerald-400 w-6 h-6" />
          Job Offers & Placement Hub
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Direct corporate placement unlocked exclusively via verified project charters containing placement clauses[cite: 6].
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-[#09090b] border border-gray-800 rounded-xl p-6 flex justify-between items-center shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">{offer.company}</h3>
                <span className="text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900 px-2.5 py-0.5 rounded">
                  {offer.linkedCharter}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-300">{offer.role} — <span className="text-emerald-400 font-mono">{offer.salary}</span></div>
              <div className="text-xs font-mono text-gray-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Status: <span className="text-gray-300">{offer.status}</span>
              </div>
            </div>

            <div>
              {offer.status !== 'Accepted & Locked' ? (
                <button
                  onClick={() => handleAcceptOffer(offer.id, offer.company)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Accept Offer
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs bg-emerald-950/30 border border-emerald-900/40 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" /> Secured On-Chain
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}