'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Package, BadgeCheck, ShoppingCart, TrendingUp, Wallet, RefreshCw, XCircle, Trash2, Sparkles } from 'lucide-react';
import axios from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Notif {
  id: string;
  type: string;
  title: string;
  message: string;
  payload?: any;
  read_at: string | null;
  created_at: string;
}

const TYPE_ICON: Record<string, { icon: typeof Bell; color: string }> = {
  asset_approved:  { icon: Package,    color: 'bg-emerald-500/20 text-emerald-400' },
  asset_rejected:  { icon: Package,    color: 'bg-red-500/20 text-red-400' },
  asset_sold:      { icon: TrendingUp, color: 'bg-amber-500/20 text-amber-400' },
  asset_purchased: { icon: ShoppingCart, color: 'bg-blue-500/20 text-blue-400' },
  verified:        { icon: BadgeCheck, color: 'bg-blue-500/20 text-blue-400' },
  unverified:      { icon: BadgeCheck, color: 'bg-slate-500/20 text-slate-400' },
  topup:           { icon: Wallet,     color: 'bg-emerald-500/20 text-emerald-400' },
  refund_submitted:{ icon: RefreshCw,  color: 'bg-amber-500/20 text-amber-400' },
  refund_approved: { icon: CheckCheck, color: 'bg-emerald-500/20 text-emerald-400' },
  refund_rejected: { icon: XCircle,    color: 'bg-red-500/20 text-red-400' },
  creator_new_asset: { icon: Sparkles, color: 'bg-purple-500/20 text-purple-400' },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff} detik lalu`;
  if (diff < 3600)  return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Poll unread count every 30s
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const fetch = () => {
      axios.get('/api/v1/notifications/unread-count')
        .then(res => setUnread(res.data.unread_count))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = () => {
    setLoading(true);
    axios.get('/api/v1/notifications')
      .then(res => {
        setNotifs(res.data.data.data ?? []);
        setUnread(res.data.unread_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const toggleOpen = () => {
    if (!open) fetchNotifs();
    setOpen(v => !v);
  };

  const markRead = (id: string) => {
    axios.post(`/api/v1/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = () => {
    axios.post('/api/v1/notifications/read-all').catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  };

  const handleNotifClick = (n: Notif) => {
    if (!n.read_at) markRead(n.id);
    setOpen(false);
    
    switch (n.type) {
      case 'asset_purchased':
      case 'refund_submitted':
      case 'refund_approved':
      case 'refund_rejected':
        router.push('/my-library');
        break;
      case 'asset_approved':
      case 'asset_rejected':
      case 'asset_sold':
        router.push('/my-assets');
        break;
      case 'creator_new_asset':
        if (n.payload?.asset_id) router.push(`/assets/${n.payload.asset_id}`);
        else router.push('/explore');
        break;
      default:
        router.push('/dashboard');
        break;
    }
  };

  const deleteNotif = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent clicking the notif
    axios.delete(`/api/v1/notifications/${id}`).catch(() => {});
    setNotifs(prev => prev.filter(n => n.id !== id));
    // Re-fetch unread count
    axios.get('/api/v1/notifications/unread-count').then(res => setUnread(res.data.unread_count)).catch(() => {});
  };

  const deleteAllNotifs = () => {
    axios.delete('/api/v1/notifications/delete-all').catch(() => {});
    setNotifs([]);
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
        aria-label="Notifikasi"
      >
        <Bell className="w-4 h-4 text-brand-muted" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-80 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
              <div className="flex items-center gap-3">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-brand-blue hover:text-white transition-colors"
                    title="Tandai semua sudah dibaca"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {notifs.length > 0 && (
                  <button
                    onClick={deleteAllNotifs}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    title="Hapus semua notifikasi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-brand-blue/30 border-t-brand-blue animate-spin" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-brand-muted">
                  <Bell className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                notifs.map(n => {
                  const meta = TYPE_ICON[n.type] ?? { icon: Bell, color: 'bg-white/10 text-brand-muted' };
                  const Icon = meta.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={cn(
                        'w-full text-left flex gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 cursor-pointer',
                        !n.read_at && 'bg-brand-blue/5'
                      )}
                    >
                      <div className={cn('w-9 h-9 rounded-xl shrink-0 flex items-center justify-center', meta.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white leading-tight pr-4">{n.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {!n.read_at && <span className="w-2 h-2 rounded-full bg-brand-blue" />}
                            <button 
                              onClick={(e) => deleteNotif(e, n.id)}
                              className="text-white/20 hover:text-red-400 transition-colors"
                              title="Hapus"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-brand-muted mt-0.5 leading-relaxed line-clamp-2 pr-4">{n.message}</p>
                        <p className="text-[10px] text-brand-muted/60 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifs.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 text-center">
                <button onClick={markAllRead} className="text-xs text-brand-muted hover:text-white transition-colors flex items-center gap-1.5 mx-auto">
                  <Check className="w-3.5 h-3.5" /> Semua notifikasi sudah dibaca
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
