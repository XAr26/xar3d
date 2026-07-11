'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Upload, Image, FileArchive, Tag, DollarSign, FileText,
  Layers, Cpu, Shield, ArrowLeft, Loader2, CheckCircle, AlertCircle, X
} from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Category { id: string; name: string; slug: string; }

const LICENSE_OPTIONS = [
  { value: 'free', label: 'Free', desc: 'Gratis untuk semua penggunaan' },
  { value: 'standard', label: 'Standard', desc: 'Penggunaan komersial terbatas' },
  { value: 'extended', label: 'Extended', desc: 'Penggunaan komersial penuh' },
];

export default function UploadPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('0');
  const [licenseType, setLicenseType] = useState('free');
  const [blenderVersion, setBlenderVersion] = useState('');
  const [polyCount, setPolyCount] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    Promise.all([
      axios.get('/api/v1/auth/user'),
      axios.get('/api/v1/assets/categories'),
    ]).then(([userRes, catRes]) => {
      const user = userRes.data.data;
      if (user.role !== 'creator' && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setCategories(catRes.data.data);
    }).catch(() => router.push('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile || !assetFile) {
      setErrorMsg('Thumbnail dan file aset wajib diupload.');
      return;
    }
    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('license_type', licenseType);
    if (blenderVersion) formData.append('blender_version', blenderVersion);
    if (polyCount) formData.append('poly_count', polyCount);
    formData.append('thumbnail', thumbnailFile);
    formData.append('file', assetFile);

    try {
      const res = await axios.post('/api/v1/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(`Aset "${res.data.data.title}" berhasil dipublish! 🎉`);
      // Reset form
      setTitle(''); setDescription(''); setCategoryId(''); setPrice('0');
      setLicenseType('free'); setBlenderVersion(''); setPolyCount('');
      setThumbnailFile(null); setThumbnailPreview(null); setAssetFile(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setErrorMsg(err.response.data.errors[firstKey][0]);
      } else {
        setErrorMsg(err.response?.data?.message || 'Upload gagal, coba lagi.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8 text-brand-blue" /> Upload Asset 3D
            </h1>
            <p className="text-brand-muted mt-1">Publish karya terbaikmu ke marketplace XAR 3D HUB</p>
          </motion.div>

          {/* Feedback */}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-2xl text-sm mb-6">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} className="ml-auto shrink-0"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-2xl text-sm mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="ml-auto shrink-0"><X className="w-4 h-4" /></button>
            </motion.div>
          )}

          <motion.form
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="space-y-6"
          >
            {/* Thumbnail Upload */}
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-brand-blue" /> Thumbnail
              </h2>
              <label className="block cursor-pointer">
                {thumbnailPreview ? (
                  <div className="relative group rounded-2xl overflow-hidden">
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Ganti Thumbnail</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:border-brand-blue/50 hover:bg-brand-blue/5 transition-all">
                    <Image className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                    <p className="text-white font-medium">Klik untuk upload thumbnail</p>
                    <p className="text-brand-muted text-sm mt-1">JPG, PNG, WebP — Maks 5MB</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
              </label>
            </div>

            {/* Asset Info */}
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" /> Informasi Aset
              </h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted">Judul Aset *</label>
                <input
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                  placeholder="Contoh: Cyberpunk Character Pack v2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted">Deskripsi *</label>
                <textarea
                  required value={description} onChange={e => setDescription(e.target.value)}
                  rows={5} maxLength={5000}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all resize-none"
                  placeholder="Jelaskan secara detail apa yang ada di dalam paket aset ini..."
                />
                <p className="text-xs text-brand-muted text-right">{description.length}/5000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Kategori *</label>
                  <select
                    required value={categoryId} onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-blue transition-all appearance-none"
                  >
                    <option value="" disabled className="bg-brand-dark">Pilih kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-brand-dark">{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Harga (Rp) *</label>
                  <input
                    type="number" required min={0} value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="0 = Gratis"
                  />
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-purple" /> Detail Teknis
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Blender Version</label>
                  <input
                    type="text" value={blenderVersion} onChange={e => setBlenderVersion(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="4.2, 3.6, dst."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Poly Count</label>
                  <input
                    type="number" min={0} value={polyCount} onChange={e => setPolyCount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                    placeholder="Jumlah polygon"
                  />
                </div>
              </div>

              {/* License */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-muted flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Tipe Lisensi *</label>
                <div className="grid grid-cols-3 gap-3">
                  {LICENSE_OPTIONS.map(opt => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => setLicenseType(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        licenseType === opt.value
                          ? 'bg-brand-blue/20 border-brand-blue/60 text-white'
                          : 'bg-white/3 border-white/10 text-brand-muted hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-brand-purple" /> File Aset *
              </h2>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  assetFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 hover:border-brand-purple/50 hover:bg-brand-purple/5'
                }`}>
                  <FileArchive className={`w-10 h-10 mx-auto mb-3 ${assetFile ? 'text-emerald-400' : 'text-brand-muted'}`} />
                  {assetFile ? (
                    <>
                      <p className="text-emerald-400 font-medium">✓ {assetFile.name}</p>
                      <p className="text-brand-muted text-sm mt-1">{(assetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-medium">Upload file .blend atau .zip</p>
                      <p className="text-brand-muted text-sm mt-1">Maks 100MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file" accept=".zip,.blend"
                  onChange={e => setAssetFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={isUploading}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-100"
            >
              {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
              {!isUploading && <Upload className="w-5 h-5" />}
              <span>{isUploading ? 'Sedang Mengupload...' : 'Publish Aset Sekarang'}</span>
            </button>
          </motion.form>
        </div>
      </div>
      <Footer />
    </>
  );
}
