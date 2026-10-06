// Notifications — preserved as a standalone component so it does not affect authentication or biometric/passkey flows.
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const ago = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
};

export default function NotificationBell({ userId }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    let active = true;

    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (active) setItems(data || []); });

    const ch = supabase
      .channel('notif-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (p) => setItems((x) => [p.new, ...x]))
      .subscribe();

    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);

    return () => {
      active = false;
      supabase.removeChannel(ch);
      document.removeEventListener('mousedown', close);
    };
  }, [userId]);

  const unread = items.filter((n) => !n.read_at).length;

  async function openItem(n) {
    if (!n.read_at) {
      const { error } = await supabase.rpc('mark_notification_read', { p_notification_id: n.id });
      if (!error) {
        setItems((x) => x.map((i) =>
          i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i
        ));
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  async function markAll() {
    const unreadItems = items.filter((n) => !n.read_at);
    await Promise.all(unreadItems.map((n) =>
      supabase.rpc('mark_notification_read', { p_notification_id: n.id })
    ));
    setItems((x) => x.map((i) => ({
      ...i,
      read_at: i.read_at || new Date().toISOString(),
    })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-800 bg-[#09090b] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <span className="text-sm text-white font-semibold">Notifications</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-emerald-400 hover:text-emerald-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">You're all caught up.</div>
            ) : items.map((n) => (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                className={'w-full text-left px-4 py-3 border-b border-gray-900 hover:bg-gray-900/60 flex gap-3 ' + (n.read_at ? 'opacity-60' : '')}
              >
                <span className={'mt-1.5 w-2 h-2 rounded-full shrink-0 ' + (n.read_at ? 'bg-gray-700' : 'bg-emerald-400')} />
                <span className="min-w-0">
                  <span className="block text-sm text-white">{n.title}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">{n.body}</span>
                  <span className="block text-[10px] text-gray-600 mt-1">{ago(n.created_at)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
