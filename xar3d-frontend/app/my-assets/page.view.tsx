'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Package, Upload, Eye, EyeOff, Trash2, ArrowLeft, Download, Star, Plus, Loader2, AlertCircle } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Asset {
  id: string; title: string; thumbnail_url: string | null;
  price: number; is_published: boolean; download_count: number;
  average_rating: number; license_type: string;
  category: { name: string }; created_at: string;
}

export default function MyAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }
    axios.get('/api/v1/my-assets')
      .then(res => setAssets(res.data.data))
      .catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await axios.patch(`/api/v1/assets/${id}/toggle`);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, is_published: res.data.data.is_published } : a));
    } finally { setTogglingId(null); }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/v1/assets/${id}`);
      setAssets(prev => prev.filter(a => a.id !== id));
    } finally { setDeletingId(null); setConfirmDelete(null); }
  };

  const formatPrice = (p: number) => p === 0 ? 'Gratis' : `Rp ${p.toLocaleString('id-ID')}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLoading) return (<><Navbar /><div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" /></div><Footer /></>);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-muted hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Package className="w-8 h-8 text-brand-blue" /> Aset Saya</h1>
              <p className="text-brand-muted mt-1">{assets.length} aset terdaftar</p>
            </div>
            <Link href="/upload" className="flex items-center gap-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white px-5 py-3 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all shrink-0">
              <Plus className="w-5 h-5" /> Upload Baru
            </Link>
          </motion.div>

          {assets.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border border-white/10">
              <Package className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">Belum ada aset</h3>
              <Link href="/upload" className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold mt-4"><Upload className="w-4 h-4" /> Upload Sekarang</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {assets.map((asset, i) => (
                  <motion.div key={asset.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                    className="glass rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                    <div className="flex gap-4 p-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10">
                        {asset.thumbnail_url
                          ? <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} alt={asset.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-brand-muted/30" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-white font-semibold truncate">{asset.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${asset.is_published ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                                {asset.is_published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                            <p className="text-brand-muted text-xs">{asset.category?.name} · {formatPrice(asset.price)} · {formatDate(asset.created_at)}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-brand-muted">
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{asset.download_count}</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{asset.average_rating > 0 ? asset.average_rating.toFixed(1) : '—'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => handleToggle(asset.id)} disabled={togglingId === asset.id}
                              className={`p-2 rounded-xl border transition-all disabled:opacity-50 ${asset.is_published ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                              {togglingId === asset.id ? <Loader2 className="w-4 h-4 animate-spin" /> : asset.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setConfirmDelete(asset.id)} className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <AnimatePresence>
                      {confirmDelete === asset.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /><span>Hapus <strong>{asset.title}</strong>? Tidak bisa dibatalkan.</span></div>
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 text-sm text-brand-muted border border-white/10 rounded-lg hover:text-white transition-all">Batal</button>
                            <button onClick={() => handleDelete(asset.id)} disabled={deletingId === asset.id}
                              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-70 flex items-center gap-2">
                              {deletingId === asset.id && <Loader2 className="w-3 h-3 animate-spin" />} Hapus
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
