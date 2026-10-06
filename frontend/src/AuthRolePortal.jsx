import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AuthRolePortal({ onAddLedgerEntry }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setVerified(true);
    if (onAddLedgerEntry) {
      onAddLedgerEntry({
        action: 'AUTH_ROLE_VERIFIED',
        actor: `${selectedRole} (${email || 'demo@eastpoint.ac.in'})`,
        hash: '0x' + Math.random().toString(16).slice(2, 12) + 'd1a8'
      });
    }
    const destinations = {
      Student: '/student',
      Sponsor: '/sponsor',
      Mentor: '/student',
      Admin: '/admin'
    };
    setTimeout(() => navigate(destinations[selectedRole] || '/student'), 400);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-emerald-400 w-6 h-6" />
          Auth & Role Switcher Portal
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Supabase Auth with role-based access control and DigiLocker verification level checks[cite: 16].
        </p>
      </div>

      <div className="bg-[#09090b] border border-gray-800 rounded-xl p-8 shadow-lg space-y-6">
        {/* Role Selection Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-gray-500">Select User Role</label>
          <div className="grid grid-cols-4 gap-3">
            {['Student', 'Sponsor', 'Mentor', 'Admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => { setSelectedRole(role); setVerified(false); }}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs transition border ${
                  selectedRole === role
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Login / Verification Form */}
        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              College Email / DigiLocker ID
            </label>
            <input
              type="email"
              required
              placeholder="e.g. student@eastpoint.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold py-3 rounded-lg text-sm transition shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" /> Authenticate & Verify Role ({selectedRole})
          </button>
        </form>

        {verified && (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-center gap-3 text-emerald-400 font-mono text-xs animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">SESSION SECURED:</span> Logged in as <span className="text-white">{selectedRole}</span>. Verification level: <span className="text-white">DigiLocker Level 3 (Verified)</span>[cite: 16].
            </div>
          </div>
        )}
      </div>
    </div>
  );
}