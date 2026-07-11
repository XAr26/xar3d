'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Upload, Settings, User, ArrowRight,
  Sparkles, TrendingUp, Download, Star, Eye, Users, Shield, BadgeCheck, Wallet, Loader2, X, Paintbrush
} from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string; name: string; username?: string; email: string; role: string;
  is_verified?: boolean; balance?: number;
}

const creatorQuickLinks = [
  { label: 'Upload Asset Baru', href: '/upload',    icon: Upload,          desc: 'Publish karya 3D terbaikmu', color: 'from-brand-blue to-cyan-500' },
  { label: 'Kelola Assets',     href: '/my-assets', icon: Package,         desc: 'Edit, hapus, toggle publish', color: 'from-brand-purple to-pink-500' },
  { label: 'Jelajahi Aset',     href: '/explore',   icon: TrendingUp,      desc: 'Lihat aset dari creator lain', color: 'from-emerald-500 to-teal-500' },
  { label: 'Library Saya',      href: '/my-library',icon: Download,        desc: 'Aset yang pernah dibeli', color: 'from-indigo-500 to-purple-500' },
  { label: 'Semua Creator',     href: '/creators',  icon: Users,           desc: 'Temukan creator inspiratif', color: 'from-rose-500 to-red-500' },
  { label: 'Pengaturan',        href: '/settings',  icon: Settings,        desc: 'Keamanan dan preferensi', color: 'from-slate-500 to-slate-400' },
];

const userQuickLinks = [
  { label: 'Jelajahi Aset',  href: '/explore',  icon: TrendingUp, desc: 'Temukan aset 3D premium', color: 'from-brand-blue to-cyan-500' },
  { label: 'Library Saya',   href: '/my-library', icon: Download, desc: 'Lihat koleksi aset Anda', color: 'from-indigo-500 to-purple-500' },
  { label: 'Semua Creator',  href: '/creators', icon: Users,      desc: 'Lihat profil para creator', color: 'from-brand-purple to-pink-500' },
];

// Removed static stats array in favor of state

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    total_assets: number;
    total_downloads: number;
    average_rating: number;
    total_views: number;
  } | null>(null);

  // Top-Up State
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }
    
    // Fetch user from /profile endpoint which includes is_verified and balance
    axios.get('/api/v1/profile')
      .then(res => {
        const userData = res.data.data;
        setUser(userData);
        
        if (userData.role === 'admin') {
          router.push('/admin');
          return;
        }

        // If Creator, fetch stats
        if (userData.role === 'creator') {
          axios.get('/api/v1/dashboard/stats').then(res => setStats(res.data.data));
        }
      })
      .catch(() => { localStorage.removeItem('auth_token'); router.push('/login'); })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
    </div>
  );
  if (!user) return null;

  const isCreator = user.role === 'creator' || user.role === 'admin';
  const quickLinks = isCreator ? [...creatorQuickLinks] : [...userQuickLinks];
  
  if (user.role === 'admin') {
    quickLinks.unshift({
      label: 'Admin Panel', href: '/admin', icon: Shield, desc: 'Moderasi aset dan pengguna', color: 'from-red-500 to-rose-500'
    });
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 10000) { alert('Minimal top-up adalah Rp 10.000'); return; }
    
    setIsToppingUp(true);
    try {
      const res = await axios.post('/api/v1/profile/topup', { amount });
      setUser(prev => prev ? { ...prev, balance: res.data.balance } : null);
      setTopupAmount('');
      setIsTopupModalOpen(false);
      alert(res.data.message);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal top-up.');
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <span className="text-brand-muted text-sm font-medium">Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">@{user.username || user.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-brand-muted mt-1.5">
            {isCreator ? 'Kelola aset 3D dan pantau performa karyamu.' : 'Temukan dan unduh aset 3D premium favoritmu.'}
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 border border-white/10 mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="text-white font-semibold text-lg flex items-center gap-2">
                {user.name}
                {user.is_verified ? <BadgeCheck className="w-5 h-5 text-blue-400" /> : null}
              </p>
              <p className="text-brand-muted text-sm">{user.email}</p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  user.role === 'creator' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  user.role === 'admin'   ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                {user.balance !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Saldo: Rp {user.balance.toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={() => setIsTopupModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
                    >
                      <Wallet className="w-3 h-3" /> Top Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link href="/profile" className="flex items-center gap-2 text-sm text-brand-blue hover:text-white transition-colors font-medium">
            Edit Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Upgrade to Creator Banner (User only) */}
        {!isCreator && user.role !== 'admin' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="mb-8 rounded-2xl p-6 border border-brand-purple/30 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-brand-purple" /> Ingin Menjadi Kreator?
              </h2>
              <p className="text-brand-muted text-sm max-w-xl">
                Jual karya 3D Anda kepada ribuan pengguna di seluruh dunia. Bergabunglah sebagai Kreator sekarang dan mulailah menghasilkan pendapatan dari keahlian Anda.
              </p>
            </div>
            <Link href="/creator-onboarding" className="shrink-0 bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-purple/20 transition-all flex items-center gap-2">
              Daftar Jadi Kreator <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
        {/* Stats (Creator only) */}
        {isCreator && stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Assets', value: stats.total_assets, icon: Package, color: 'from-brand-blue to-cyan-500' },
              { label: 'Total Downloads', value: stats.total_downloads, icon: Download, color: 'from-brand-purple to-pink-500' },
              { label: 'Avg Rating', value: stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—', icon: Star, color: 'from-amber-500 to-orange-500' },
              { label: 'Total Views', value: stats.total_views, icon: Eye, color: 'from-emerald-500 to-teal-500' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-brand-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-brand-blue" /> Menu Cepat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, i) => (
              <Link key={i} href={link.href}
                className="glass-hover glass rounded-2xl p-5 border border-white/10 flex items-center gap-4 group hover:border-brand-blue/30 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${link.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">{link.label}</p>
                  <p className="text-brand-muted text-xs mt-0.5 truncate">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-blue ml-auto shrink-0 transition-colors group-hover:translate-x-1 duration-200" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* CTA for regular users */}
        {!isCreator && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 border border-brand-blue/20 rounded-2xl p-8 text-center">
            <h3 className="text-white font-bold text-xl mb-2">Ingin jadi Creator?</h3>
            <p className="text-brand-muted text-sm mb-6">Upload aset 3D karyamu dan mulai menghasilkan dari passion-mu.</p>
            <Link href="/become-creator" className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white px-6 py-3 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
              <Sparkles className="w-4 h-4" /> Daftar sebagai Creator
            </Link>
          </motion.div>
        )}

      </div>

      {/* Top Up Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setIsTopupModalOpen(false)} className="absolute top-4 right-4 p-2 text-brand-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Top-Up Saldo</h3>
                <p className="text-xs text-brand-muted">Simulasi Top-Up Akun</p>
              </div>
            </div>
            
            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-brand-muted block mb-1.5">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="10000"
                  max="10000000"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder="Min. 10000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isToppingUp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isToppingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proses Pembayaran'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
