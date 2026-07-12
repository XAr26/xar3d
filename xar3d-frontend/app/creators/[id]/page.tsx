'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Globe, Star, Download, ArrowLeft, ExternalLink, UserCircle, Sparkles, BadgeCheck, Ban, Info, X } from 'lucide-react';
import axios from '@/lib/axios';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Creator {
  id: string; name: string; role: string; created_at: string;
  is_verified: boolean; is_banned: boolean; email: string;
  creator_profile: { bio: string | null; avatar_url: string | null; portfolio_url: string | null } | null;
  assets_count: number;
}
interface Asset {
  id: string; title: string; thumbnail_url: string | null;
  price: number; download_count: number; average_rating: number;
  category: { name: string };
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  const [stats, setStats] = useState<{ total_downloads: number, average_rating: number } | null>(null);

  useEffect(() => {
    // Check if current user is admin
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.get('/api/v1/auth/user')
        .then(res => {
          if (res.data.data.role === 'admin') setIsAdmin(true);
        })
        .catch(() => {});
    }

    axios.get(`/api/v1/creators/${id}`)
      .then(res => {
        setCreator(res.data.data.creator);
        setStats(res.data.data.stats);
        setAssets(res.data.data.assets.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const formatPrice = (price: any) => {
    const num = Number(price);
    return num === 0 ? 'Gratis' : `Rp ${num.toLocaleString('id-ID')}`;
  };
  const memberSince = (d: string) => new Date(d).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const handleToggleBan = async () => {
    if (!creator || !confirm('Ubah status BAN pengguna ini?')) return;
    setProcessingAction(true);
    try {
      const res = await axios.patch(`/api/v1/admin/users/${creator.id}/ban`);
      setCreator(prev => prev ? { ...prev, is_banned: res.data.user.is_banned } : prev);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengubah status ban.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleToggleVerify = async () => {
    if (!creator) return;
    setProcessingAction(true);
    try {
      const res = await axios.patch(`/api/v1/admin/users/${creator.id}/verify`);
      setCreator(prev => prev ? { ...prev, is_verified: res.data.user.is_verified } : prev);
    } catch (e) {
      alert('Gagal memverifikasi pengguna.');
    } finally {
      setProcessingAction(false);
    }
  };

  if (isLoading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
    </div><Footer /></>
  );

  if (notFound || !creator) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <UserCircle className="w-20 h-20 text-brand-muted/20" />
      <h2 className="text-2xl font-bold text-white">Creator Tidak Ditemukan</h2>
      <Link href="/creators" className="text-brand-blue hover:text-white transition-colors">← Kembali ke Creator List</Link>
    </div><Footer /></>
  );

  const profile = creator.creator_profile;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">

          <Link href="/creators" className="inline-flex items-center gap-2 text-brand-muted hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Semua Creator
          </Link>

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl border border-white/10 p-6 md:p-10 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              {profile?.avatar_url ? (
                <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${profile.avatar_url}`} alt={creator.name}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-4 ring-brand-blue/30 shrink-0" />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  {getInitials(creator.name)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    {creator.name}
                    {creator.is_verified ? <BadgeCheck className="w-6 h-6 text-blue-400" /> : null}
                  </h1>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAdminModal(true)}
                      className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      title="Admin Aksi"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}

                  <span className="text-xs px-3 py-1 rounded-full bg-brand-purple/20 text-purple-400 border border-purple-500/30 font-medium">Creator</span>
                  {stats && stats.total_downloads >= 10 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Kreator Unggul
                    </span>
                  )}
                  {new Date().getTime() - new Date(creator.created_at).getTime() < 30 * 24 * 60 * 60 * 1000 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Kreator Baru
                    </span>
                  )}
                </div>
                <p className="text-brand-muted text-sm mb-4">Member sejak {memberSince(creator.created_at)}</p>
                {profile?.bio && <p className="text-brand-muted leading-relaxed max-w-xl">{profile.bio}</p>}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-5 justify-center md:justify-start flex-wrap">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{creator.assets_count}</p>
                    <p className="text-xs text-brand-muted">Aset</p>
                  </div>
                  {stats && (
                    <>
                      <div className="text-center border-l border-white/10 pl-6">
                        <p className="text-2xl font-bold text-white">{stats.total_downloads}</p>
                        <p className="text-xs text-brand-muted">Total Unduhan</p>
                      </div>
                      <div className="text-center border-l border-white/10 pl-6">
                        <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                          {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}
                          <Star className="w-4 h-4 text-amber-400" />
                        </p>
                        <p className="text-xs text-brand-muted">Rating Rata-rata</p>
                      </div>
                    </>
                  )}
                  {profile?.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-blue hover:text-white transition-colors text-sm border border-brand-blue/30 px-4 py-2 rounded-xl hover:bg-brand-blue/10">
                      <Globe className="w-4 h-4" /> Portfolio <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assets Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-blue" /> Aset dari {creator.name.split(' ')[0]}
            </h2>
            {assets.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border border-white/10">
                <Package className="w-12 h-12 text-brand-muted/20 mx-auto mb-3" />
                <p className="text-brand-muted">Creator ini belum mempublikasikan aset</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((asset, i) => (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/assets/${asset.id}`}>
                      <div className="glass-hover glass rounded-2xl overflow-hidden border border-white/10 hover:border-brand-blue/30 transition-all group">
                        <div className="h-36 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 relative">
                          {asset.thumbnail_url ? (
                            <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} alt={asset.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-brand-muted/30" /></div>
                          )}
                          <div className="absolute top-2 left-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${asset.price === 0 ? 'bg-emerald-500/80 text-white' : 'bg-brand-blue/80 text-white'}`}>
                              {formatPrice(asset.price)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-brand-muted mb-1">{asset.category?.name}</p>
                          <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-brand-blue transition-colors">{asset.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-brand-muted">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{asset.average_rating > 0 ? asset.average_rating.toFixed(1) : '—'}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{asset.download_count}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />

      {/* Admin User Info Modal */}
      {showAdminModal && isAdmin && creator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 p-2 text-brand-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Aksi Moderasi Admin</h3>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Status Verifikasi</p>
                  {creator.is_verified ? (
                    <span className="text-blue-400 text-sm font-semibold flex items-center gap-1"><BadgeCheck className="w-4 h-4"/> Verified</span>
                  ) : (
                    <span className="text-brand-muted text-sm font-semibold">Unverified</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Status Akun</p>
                  {creator.is_banned ? (
                    <span className="text-red-400 text-sm font-semibold flex items-center gap-1"><Ban className="w-4 h-4"/> Banned</span>
                  ) : (
                    <span className="text-emerald-400 text-sm font-semibold">Active</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleToggleVerify}
                disabled={processingAction}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  creator.is_verified 
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                <BadgeCheck className="w-5 h-5" /> 
                {creator.is_verified ? 'Cabut Centang Biru' : 'Berikan Centang Biru'}
              </button>

              <button
                onClick={handleToggleBan}
                disabled={processingAction}
                className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  creator.is_banned 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <Ban className="w-5 h-5" /> 
                {creator.is_banned ? 'Bebaskan Creator (Unban)' : 'Banned Creator Ini'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
