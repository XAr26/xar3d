'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Download, ArrowRight, Loader2, Library, AlertTriangle, Upload, X } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Asset {
  id: string; title: string; thumbnail_url: string | null;
  price: number; category: { name: string; slug: string };
  user: { name: string; username?: string };
}

interface DownloadRecord {
  id: string;
  price_paid: string;
  created_at: string;
  asset: Asset;
  refund_request?: { status: string };
}

export default function MyLibraryPage() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refund states
  const [activeRefund, setActiveRefund] = useState<DownloadRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundProof, setRefundProof] = useState<File | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundMsg, setRefundMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    axios.get('/api/v1/user/downloads')
      .then(res => {
        setDownloads(res.data.data);
      })
      .catch(() => {
        // Handle error or unauthenticated
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const submitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRefund || !refundProof) return;
    
    setIsSubmittingRefund(true);
    setRefundMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('download_id', activeRefund.id);
      formData.append('reason', refundReason);
      formData.append('proof_image', refundProof);

      const res = await axios.post('/api/v1/refunds', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRefundMsg({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setActiveRefund(null);
        setRefundReason('');
        setRefundProof(null);
        setRefundMsg({ type: '', text: '' });
      }, 3000);
    } catch (err: any) {
      setRefundMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengajukan refund.' });
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  if (isLoading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
    </div><Footer /></>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <Library className="w-8 h-8 text-brand-blue" /> Library Saya
            </h1>
            <p className="text-brand-muted mt-2">Kumpulan aset 3D premium yang telah Anda beli dan unduh.</p>
          </motion.div>

          {downloads.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass rounded-3xl border border-white/10">
              <Package className="w-16 h-16 text-brand-muted/20 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Belum ada aset</h2>
              <p className="text-brand-muted mb-6">Anda belum pernah mengunduh atau membeli aset apa pun.</p>
              <Link href="/explore" className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-blue-hover transition-colors">
                Mulai Eksplorasi <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {downloads.map((record, i) => (
                <motion.div key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl overflow-hidden border border-white/10 flex flex-col group">
                  <div className="h-40 relative bg-brand-dark/50">
                    {record.asset.thumbnail_url ? (
                      <img src={`http://127.0.0.1:8000${record.asset.thumbnail_url}`} alt={record.asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-brand-muted/30" /></div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] bg-black/60 backdrop-blur-md text-white/80 px-2 py-1 rounded-lg">
                        {formatDate(record.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-brand-blue font-medium mb-1 uppercase tracking-wider">{record.asset.category.name}</p>
                    <h3 className="text-white font-semibold line-clamp-1 mb-1">{record.asset.title}</h3>
                    <p className="text-xs text-brand-muted mb-4 line-clamp-1">oleh @{record.asset.user.username || record.asset.user.name}</p>
                    
                    <div className="mt-auto space-y-2">
                      <Link href={`/assets/${record.asset.id}`}
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-brand-blue/20 border border-white/10 hover:border-brand-blue/50 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                        <Download className="w-4 h-4" /> Unduh Ulang
                      </Link>
                      {parseFloat(record.price_paid) > 0 && (
                        record.refund_request ? (
                          <div className={`w-full flex items-center justify-center gap-2 text-xs py-1.5 font-medium border rounded-lg mt-2 ${
                             record.refund_request.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                             record.refund_request.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                             'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}>
                            <AlertTriangle className="w-3 h-3" />
                            Refund {record.refund_request.status === 'pending' ? 'Diproses (Menunggu)' : 
                                    record.refund_request.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </div>
                        ) : (
                          <button onClick={() => { setActiveRefund(record); setRefundMsg({type: '', text: ''}) }}
                            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 py-1.5 transition-colors">
                            <AlertTriangle className="w-3 h-3" /> Ajukan Refund
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {activeRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-6 max-w-md w-full border border-white/10 shadow-2xl relative">
            <button onClick={() => setActiveRefund(null)} className="absolute top-4 right-4 text-brand-muted hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle className="text-red-500 w-6 h-6" /> Ajukan Refund</h3>
            <p className="text-sm text-brand-muted mb-4">Refund hanya diproses jika aset terbukti cacat teknis/rusak dalam 7 hari pembelian.</p>
            
            {refundMsg.text && (
              <div className={`p-3 rounded-xl text-sm mb-4 border ${refundMsg.type === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                {refundMsg.text}
              </div>
            )}

            <form onSubmit={submitRefund} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-brand-muted block mb-1">Jelaskan Masalah / Kerusakan</label>
                <textarea required value={refundReason} onChange={e => setRefundReason(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-white text-sm h-24 resize-none" placeholder="Contoh: File Blender korup dan tidak bisa dibuka..." />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-muted block mb-1">Unggah Bukti (Screenshot)</label>
                <div className="relative border border-white/10 border-dashed rounded-xl p-4 text-center hover:border-brand-blue/50 transition-colors bg-black/40 cursor-pointer">
                  <input type="file" required accept="image/*" onChange={e => setRefundProof(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-brand-muted mx-auto mb-2" />
                  <span className="text-xs text-brand-muted">{refundProof ? refundProof.name : 'Klik untuk memilih file'}</span>
                </div>
              </div>
              <button type="submit" disabled={isSubmittingRefund} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {isSubmittingRefund ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Pengajuan Refund'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
}
