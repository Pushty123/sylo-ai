import { useState } from 'react';
import { Shield, UserCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, getCurrentUserWithProfile } from './auth';

export default function AuthRolePortal({ onAddLedgerEntry }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Student');
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const roleMap = { Student: 'student', Sponsor: 'sponsor', Mentor: 'expert', Admin: 'admin' };
  const destinations = { Student: '/student', Sponsor: '/sponsor', Mentor: '/student', Admin: '/admin' };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setVerified(false);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Full name is required.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await signUp(email.trim(), password, fullName.trim(), roleMap[selectedRole]);
      } else {
        await signIn(email.trim(), password);
      }

      const { profile } = await getCurrentUserWithProfile();
      if (!profile) throw new Error('Authentication succeeded, but no profile was found.');
      if (profile.role !== roleMap[selectedRole]) {
        throw new Error(`Account role is "${profile.role}", but "${selectedRole}" was selected.`);
      }

      setVerified(true);
      onAddLedgerEntry?.({
        action: 'AUTH_ROLE_VERIFIED',
        actor: `${selectedRole} (${email.trim()})`,
        hash: 'Supabase Auth'
      });
      navigate(destinations[selectedRole] || '/student');
    } catch (err) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-emerald-400 w-6 h-6" />
          Auth & Role Portal
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Real Supabase authentication with role-based access control.
        </p>
      </div>

      <div className="bg-[#09090b] border border-gray-800 rounded-xl p-8 shadow-lg space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-gray-500">Select User Role</label>
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-xs text-emerald-400 hover:text-emerald-300">
              {mode === 'login' ? 'Create account' : 'Already have an account? Sign in'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {['Student', 'Sponsor', 'Mentor', 'Admin'].map((role) => (
              <button key={role} type="button" onClick={() => { setSelectedRole(role); setError(''); }}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs transition border ${selectedRole === role
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-black/40 border-gray-800 text-gray-400 hover:border-gray-700'}`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-gray-400">Full name</label>
              <input required value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Email
            </label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-gray-400">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <button type="submit" disabled={busy}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-semibold py-3 rounded-lg text-sm transition flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4" /> {busy ? 'Authenticating...' : mode === 'login' ? `Sign in as ${selectedRole}` : `Create ${selectedRole} account`}
          </button>
        </form>

        {error && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4 flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0" /><div>{error}</div>
          </div>
        )}

        {verified && (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-center gap-3 text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div><span className="font-bold">SESSION SECURED:</span> Supabase session verified. Redirecting to <span className="text-white">{selectedRole}</span> workspace.</div>
          </div>
        )}
      </div>
    </div>
  );
}
