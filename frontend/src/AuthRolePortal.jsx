import { useState } from 'react';
import { Shield, UserCheck, CheckCircle2, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, resetPassword, getCurrentUserWithProfile } from './auth';

export default function AuthRolePortal({ onAddLedgerEntry }) {
  const navigate=useNavigate();
  const [selectedRole,setSelectedRole]=useState('Student');
  const [mode,setMode]=useState('login');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [fullName,setFullName]=useState('');
  const [verified,setVerified]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [info,setInfo]=useState('');
  const roleMap={Student:'student',Sponsor:'sponsor',Mentor:'expert',Admin:'admin'};

  async function submit(e){
    e.preventDefault(); if(busy)return;
    setBusy(true);setError('');setInfo('');
    try{
      if(mode==='signup'){
        if(!fullName.trim())throw new Error('Full name is required.');
        if(password.length<8)throw new Error('Use at least 8 characters for the password.');
        const result=await signUp(email.trim(),password,fullName.trim(),roleMap[selectedRole]);
        if(result.needsEmailConfirmation){
          setInfo('Account created. Check your email and confirm the address before signing in.');
          setMode('login');
          return;
        }
      }else{
        await signIn(email.trim(),password);
      }
      const {profile}=await getCurrentUserWithProfile();
      if(!profile)throw new Error('Authentication succeeded but your profile is still being provisioned. Sign out and sign in again.');
      if(profile.role!==roleMap[selectedRole])throw new Error('This account is registered as "'+profile.role+'". Select the matching role.');
      setVerified(true);
      onAddLedgerEntry?.({action:'AUTH_ROLE_VERIFIED',actor:selectedRole+' ('+email.trim()+')',hash:'Supabase Auth'});
      navigate('/app');
    }catch(err){
      const message=err?.message||'Authentication failed.';
      if(message.toLowerCase().includes('rate limit')||message.includes('429')) setError('Supabase email delivery is temporarily rate-limited. Wait for the email quota to recover, then use Sign in rather than creating the account again.');
      else setError(message);
    }finally{setBusy(false);}
  }

  async function forgot(){
    if(!email.trim()){setError('Enter your email first.');return;}
    setBusy(true);setError('');setInfo('');
    try{await resetPassword(email.trim());setInfo('If the account exists, a password-reset email has been requested.');}
    catch(err){setError(err.message||'Could not request password reset.');}
    finally{setBusy(false);}
  }

  return <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
    <div className="w-full max-w-xl">
      <button onClick={()=>navigate('/')} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mb-6"><ArrowLeft className="w-4 h-4"/> Back to Sylo</button>
      <div className="bg-[#09090b] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-2"><Shield className="text-emerald-400"/><h1 className="text-2xl font-bold text-white">{mode==='reset'?'Reset password':'Sign in to Sylo'}</h1></div>
        <p className="text-gray-500 text-sm mb-7">Secure research collaboration with project-scoped access control.</p>
        {mode!=='reset'&&<><div className="grid grid-cols-4 gap-2 mb-6">{['Student','Sponsor','Mentor','Admin'].map(r=><button key={r} type="button" onClick={()=>{setSelectedRole(r);setError('')}} className={'py-2.5 rounded-lg text-xs border '+(selectedRole===r?'bg-emerald-600/20 border-emerald-500 text-emerald-400':'border-gray-800 text-gray-500')}>{r}</button>)}</div>
        <div className="flex justify-end mb-3"><button type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setInfo('')}} className="text-xs text-emerald-400">{mode==='login'?'Create account':'Back to sign in'}</button></div></>}
        <form onSubmit={mode==='reset'?e=>{e.preventDefault();forgot()}:submit} className="space-y-4">
          {mode==='signup'&&<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white text-sm"/>}
          <div className="relative"><Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-600"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-3 py-3 text-white text-sm"/></div>
          {mode!=='reset'&&<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white text-sm"/>}
          {mode==='reset'?<button disabled={busy} className="w-full bg-emerald-600 text-black py-3 rounded-lg font-semibold">{busy?'Sending…':'Send reset email'}</button>:<button disabled={busy} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><UserCheck className="w-4 h-4"/>{busy?'Working…':mode==='login'?'Sign in as '+selectedRole:'Create '+selectedRole+' account'}</button>}
        </form>
        {mode==='login'&&<button onClick={()=>{setMode('reset');setError('');setInfo('')}} className="text-xs text-gray-500 hover:text-emerald-400 mt-4">Forgot password?</button>}
        {mode==='reset'&&<button onClick={()=>{setMode('login');setError('');setInfo('')}} className="text-xs text-gray-500 hover:text-white mt-4">Back to sign in</button>}
        {error&&<div className="mt-5 bg-red-950/20 border border-red-900/50 rounded-xl p-4 text-red-300 text-xs flex gap-3"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
        {info&&<div className="mt-5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-emerald-300 text-xs flex gap-3"><CheckCircle2 className="w-4 h-4 shrink-0"/>{info}</div>}
        {verified&&<div className="mt-5 text-emerald-400 text-xs font-mono">SESSION SECURED — opening your workspace…</div>}
      </div>
    </div>
  </div>;
}
