// AvatarPicker.jsx — choose a generated avatar or upload a photo (stored in the "avatars" bucket).
import { useRef, useState } from 'react';
import { Upload, Shuffle, Loader2, Check } from 'lucide-react';
import { supabase } from './supabase';

const STYLES = [
  { id: 'initials', label: 'Initials' },
  { id: 'notionists', label: 'Sketch' },
  { id: 'avataaars', label: 'Cartoon' },
  { id: 'lorelei', label: 'Portrait' },
  { id: 'bottts', label: 'Robot' },
  { id: 'shapes', label: 'Abstract' },
];

const urlFor = (style, seed) =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=052e16,064e3b,0f766e,134e4a&radius=50`;

export function Avatar({ url, name, size = 64 }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken)
    return <img src={url} alt={name || 'avatar'} onError={() => setBroken(true)} style={{ width: size, height: size }} className="rounded-full object-cover border border-emerald-800 bg-emerald-950 shrink-0" />;
  return (
    <div style={{ width: size, height: size, fontSize: size / 2.6 }} className="rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
      {(name || 'U').slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function AvatarPicker({ value, name, onPick }) {
  const [seed, setSeed] = useState(name || 'Sylo');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErr('Image must be under 2 MB.'); return; }
    setBusy(true); setErr('');
    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split('.').pop().toLowerCase();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setErr(error.message); setBusy(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await onPick(data.publicUrl);
    setBusy(false);
  }

  return (
    <div className="bg-black/40 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-white font-semibold">Choose your avatar</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSeed(Math.random().toString(36).slice(2, 8))} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-900">
            <Shuffle className="w-3 h-3" /> Shuffle
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-black font-semibold hover:bg-emerald-500 disabled:opacity-50">
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload photo
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={upload} />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {STYLES.map((s) => {
          const u = urlFor(s.id, seed);
          const active = value === u;
          return (
            <button type="button" key={s.id} onClick={() => onPick(u)} className={'relative flex flex-col items-center gap-1 p-2 rounded-lg border transition ' + (active ? 'border-emerald-500 bg-emerald-950/40' : 'border-gray-800 hover:border-gray-600')}>
              <img src={u} alt={s.label} className="w-12 h-12 rounded-full" />
              <span className="text-[10px] text-gray-400">{s.label}</span>
              {active && <Check className="absolute top-1 right-1 w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>
      {err && <div className="text-xs text-red-400 mt-2">{err}</div>}
    </div>
  );
}
