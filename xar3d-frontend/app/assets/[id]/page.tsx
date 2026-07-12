'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package, Download, Star, Shield, Layers, Cpu,
  ArrowLeft, User, Tag, Calendar, ExternalLink,
  CheckCircle, Loader2, Heart, Share2, Box, CreditCard
} from 'lucide-react';
import axios from '@/lib/axios';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import Asset3DViewer from '@/components/shared/Asset3DViewer';

interface Asset {
  id: string; title: string; slug: string; description: string;
  price: number; thumbnail_url: string | null; file_url: string | null;
  average_rating: number; download_count: number;
  license_type: string; blender_version: string | null; poly_count: number | null;
  is_published: boolean; created_at: string;
  user: { id: string; name: string };
  category: { id: string; name: string; slug: string };
}

const LICENSE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  free:     { label: 'Free License',     desc: 'Bebas digunakan untuk proyek personal & komersial',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  standard: { label: 'Standard License', desc: 'Diizinkan untuk produk komersial dengan batasan tertentu', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  extended: { label: 'Extended License', desc: 'Penggunaan komersial penuh tanpa batasan',                color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'image' | '3d'>('image');

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsLoggedIn(!!token);
    
    // Fetch asset details
    axios.get(`/api/v1/assets/${id}`)
      .then(res => setAsset(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));

    // If logged in, check favorites
    if (token) {
      axios.get('/api/v1/user/favorites')
        .then(res => {
          const favorites = res.data.data;
          const isFav = favorites.some((fav: any) => fav.asset.id === id);
          setIsFavorite(isFav);
        });
    }
  }, [id]);

  const handleDownload = async () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    if (!asset) return;
    setIsDownloading(true);
    
    try {
      const response = await axios.get(`/api/v1/assets/${asset.id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const disposition = response.headers['content-disposition'];
      let filename = 'asset-download.zip';
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (error: any) {
      if (error.response?.status === 402) {
        alert('Saldo Anda tidak mencukupi untuk membeli aset ini.');
      } else {
        alert('Download gagal. Silakan coba lagi.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    // Simulasi proses pembayaran
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessingPayment(false);
    setCheckoutModalOpen(false);
    
    // Setelah sukses bayar, langsung download
    handleDownload();
  };

  const submitReview = async () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    if (rating === 0) return alert('Silakan pilih rating bintang terlebih dahulu');
    
    setIsSubmittingReview(true);
    try {
      await axios.post(`/api/v1/assets/${id}/reviews`, { rating, comment });
      setReviewSuccess(true);
      // Refresh asset data to get new average_rating
      const res = await axios.get(`/api/v1/assets/${id}`);
      setAsset(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(error.response.data.message || 'Anda harus mendownload aset ini terlebih dahulu.');
      } else {
        alert('Gagal mengirim ulasan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: asset?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleFavorite = async () => {
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    try {
      const res = await axios.post(`/api/v1/user/favorites/${asset?.id}`);
      setIsFavorite(res.data.is_favorite);
    } catch (e) {
      alert('Terjadi kesalahan saat menambahkan ke favorit.');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatPrice = (price: any) => {
    const num = Number(price);
    return num === 0 ? 'Gratis' : `Rp ${num.toLocaleString('id-ID')}`;
  };

  if (isLoading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
    </div><Footer /></>
  );

  if (notFound || !asset) return (
    <><Navbar />
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <Package className="w-20 h-20 text-brand-muted/20" />
      <h2 className="text-2xl font-bold text-white">Aset Tidak Ditemukan</h2>
      <Link href="/explore" className="text-brand-blue hover:text-white transition-colors">← Kembali ke Explore</Link>
    </div><Footer /></>
  );

  const license = LICENSE_INFO[asset.license_type] || LICENSE_INFO.free;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-brand-muted mb-8 flex-wrap">
            <Link href="/explore" className="hover:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Explore</Link>
            <span>/</span>
            <Link href={`/explore?category=${asset.category?.slug}`} className="hover:text-white transition-colors">{asset.category?.name}</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{asset.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Thumbnail + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Thumbnail / 3D Viewer Toggle */}
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 aspect-video flex items-center justify-center group">
                
                {viewMode === '3d' ? (
                  <div className="absolute inset-0 w-full h-full">
                    <Asset3DViewer />
                  </div>
                ) : asset.thumbnail_url ? (
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} alt={asset.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-24 h-24 text-brand-muted/20" />
                )}

                {/* View Toggle Controls */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setViewMode('image')} className={`p-2 rounded-xl backdrop-blur-md transition-all ${viewMode === 'image' ? 'bg-brand-blue/80 text-white shadow-lg' : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'}`}>
                    <Package className="w-5 h-5" />
                  </button>
                  <button onClick={() => setViewMode('3d')} className={`p-2 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 ${viewMode === '3d' ? 'bg-brand-purple/80 text-white shadow-lg' : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'}`}>
                    <Box className="w-5 h-5" />
                    <span className="text-xs font-semibold pr-1 hidden sm:block">3D Preview</span>
                  </button>
                </div>
              </motion.div>

              {/* Title & Meta */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <span className="text-xs text-brand-blue font-medium uppercase tracking-wider">{asset.category?.name}</span>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">{asset.title}</h1>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={toggleFavorite} className={`p-2.5 glass rounded-xl border transition-all ${isFavorite ? 'border-pink-500/50 bg-pink-500/10 text-pink-500' : 'border-white/10 text-brand-muted hover:text-white'}`}>
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
                    </button>
                    <button onClick={handleShare} className="p-2.5 glass rounded-xl border border-white/10 text-brand-muted hover:text-white transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-brand-muted mb-6 flex-wrap">
                  <Link href={`/creators/${asset.user?.id}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white text-xs font-bold">
                      {asset.user?.name?.[0]}
                    </div>
                    {asset.user?.name}
                  </Link>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" />{asset.average_rating > 0 ? asset.average_rating.toFixed(1) : 'Belum ada rating'}</span>
                  <span className="flex items-center gap-1"><Download className="w-4 h-4" />{asset.download_count} unduhan</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatDate(asset.created_at)}</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6 border border-white/10">
                <h2 className="text-white font-semibold mb-4">Deskripsi</h2>
                <p className="text-brand-muted leading-relaxed whitespace-pre-line">{asset.description}</p>
              </motion.div>

              {/* Technical Specs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-white/10">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-brand-blue" /> Spesifikasi Teknis</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Tag, label: 'Kategori', value: asset.category?.name },
                    { icon: Cpu, label: 'Blender Version', value: asset.blender_version || '—' },
                    { icon: Layers, label: 'Poly Count', value: asset.poly_count ? asset.poly_count.toLocaleString() : '—' },
                    { icon: Shield, label: 'Lisensi', value: asset.license_type.charAt(0).toUpperCase() + asset.license_type.slice(1) },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-brand-blue" />
                      </div>
                      <div>
                        <p className="text-xs text-brand-muted">{item.label}</p>
                        <p className="text-sm text-white font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Review Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6 border border-white/10">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Berikan Ulasan</h2>
                
                {reviewSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Terima kasih! Ulasan Anda telah berhasil disimpan.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Bagaimana pendapat Anda tentang aset ini? (Opsional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-blue/50 resize-none h-24 text-sm"
                    />
                    <button
                      onClick={submitReview}
                      disabled={isSubmittingReview || rating === 0}
                      className="bg-brand-blue hover:bg-brand-blue-hover text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Ulasan'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Purchase Card */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="sticky top-28 space-y-4">

                {/* Price Card */}
                <div className="glass rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-brand-muted text-sm">Harga</p>
                      <p className="text-3xl font-bold text-white mt-1">{formatPrice(asset.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400" />
                      <span className="text-white font-semibold">{asset.average_rating > 0 ? asset.average_rating.toFixed(1) : '—'}</span>
                    </div>
                  </div>

                  {/* Download / Buy Button */}
                  <button onClick={() => {
                      if (!isLoggedIn) { window.location.href = '/login'; return; }
                      if (Number(asset.price) > 0) setCheckoutModalOpen(true);
                      else handleDownload();
                    }} disabled={isDownloading || downloaded}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all mb-4 ${
                      downloaded
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-100 disabled:opacity-70'
                    }`}>
                    {isDownloading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Menyiapkan...</>
                    ) : downloaded ? (
                      <><CheckCircle className="w-5 h-5" /> Berhasil Diunduh!</>
                    ) : (
                      <>{Number(asset.price) === 0 ? <Download className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />} {Number(asset.price) === 0 ? 'Unduh Gratis' : 'Beli Sekarang'}</>
                    )}
                  </button>

                  {!isLoggedIn && (
                    <p className="text-center text-xs text-brand-muted">
                      <Link href="/login" className="text-brand-blue hover:text-white transition-colors">Masuk</Link> untuk mengunduh aset ini
                    </p>
                  )}

                  {/* License Info */}
                  <div className={`p-3 rounded-xl border text-xs ${license.color} mt-4`}>
                    <p className="font-semibold mb-1">{license.label}</p>
                    <p className="opacity-80">{license.desc}</p>
                  </div>
                </div>

                {/* Creator Card */}
                <div className="glass rounded-2xl p-5 border border-white/10">
                  <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-blue" /> Creator
                  </h3>
                  <Link href={`/creators/${asset.user?.id}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold shrink-0">
                      {asset.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-brand-blue transition-colors">{asset.user?.name}</p>
                      <p className="text-brand-muted text-xs">Lihat profil & aset lainnya</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-brand-muted group-hover:text-brand-blue transition-colors shrink-0" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-brand-dark border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Checkout</h3>
            <p className="text-brand-muted text-sm mb-6">Konfirmasi pembelian aset Anda.</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 shrink-0 overflow-hidden">
                {asset.thumbnail_url ? (
                  <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} className="w-full h-full object-cover" alt="" />
                ) : <Package className="w-8 h-8 m-4 text-brand-muted/50" />}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium line-clamp-1">{asset.title}</h4>
                <p className="text-brand-muted text-sm mt-1">Harga: {formatPrice(asset.price)}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-sm">
              <div className="flex justify-between items-center text-blue-100">
                <span>Saldo Anda Saat Ini:</span>
                <span className="font-bold text-blue-400">
                  {/* Kita bisa mengambil saldo dari API, untuk UI kita gunakan alert jika gagal */}
                  Cek saldo di Profil
                </span>
              </div>
            </div>

            <button onClick={processPayment} disabled={isProcessingPayment}
              className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              {isProcessingPayment ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses Pembayaran...</> : 'Bayar Sekarang'}
            </button>
            <button onClick={() => !isProcessingPayment && setCheckoutModalOpen(false)} disabled={isProcessingPayment}
              className="w-full py-3 mt-3 text-brand-muted hover:text-white text-sm font-medium transition-colors">
              Batal
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
