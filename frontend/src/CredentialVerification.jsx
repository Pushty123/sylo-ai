import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Link as LinkIcon, CheckCircle2, User } from 'lucide-react';

export default function CredentialVerification() {
  // Mock data for the finalized credential
  const credential = {
    id: 'CRED-90210-ALPHA',
    student: 'Team Alpha (Lead: S. Student)',
    project: 'LLM Watermarking for Code Repositories',
    sponsor: 'Acme Corp',
    date: 'Oct 6, 2026',
    hash: '0x95b2a10512e9a1f8c9',
  };

  const verificationUrl = `https://sylo.ai/verify/${credential.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-emerald-400 w-6 h-6" />
          Credential Verification Portal
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Cryptographically verifiable proof of work. Scan the QR code to view the immutable ledger entry.
        </p>
      </div>

      <div className="bg-[#09090b] border border-gray-800 rounded-xl p-8 shadow-lg flex gap-8 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {/* QR Code Section */}
        <div className="shrink-0 flex flex-col items-center justify-center space-y-4 bg-black/40 p-6 rounded-xl border border-gray-800/60 z-10">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG value={verificationUrl} size={150} level="H" />
          </div>
          <div className="text-xs font-mono text-gray-500 flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> sylo.ai/verify/...
          </div>
        </div>

        {/* Credential Details Section */}
        <div className="flex-1 space-y-6 z-10">
          <div className="flex items-center gap-3 text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg w-fit">
            <CheckCircle2 className="w-5 h-5" />
            Verified Authentic On-Chain
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-1">Recipient</h3>
              <div className="text-lg text-white font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                {credential.student}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-1">Project Executed</h3>
              <div className="text-gray-300 font-medium">{credential.project}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-mono uppercase text-gray-500 mb-1">Sponsor</h3>
                <div className="text-gray-300">{credential.sponsor}</div>
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-gray-500 mb-1">Issue Date</h3>
                <div className="text-gray-300">{credential.date}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800/60">
              <h3 className="text-xs font-mono uppercase text-gray-500 mb-1">Ledger Fingerprint (SHA-256)</h3>
              <div className="text-xs font-mono text-emerald-400 bg-black/40 p-2 rounded border border-gray-800/60 break-all">
                {credential.hash}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}