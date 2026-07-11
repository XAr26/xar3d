'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Mail, Globe, FileText, Camera, Save,
  Loader2, CheckCircle, AlertCircle, ArrowLeft, Shield, BadgeCheck
} from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  portfolio_url: string | null;
  is_verified: boolean;
  balance: number;
  username: string;
  username_changes_count: number;
  last_username_change_at: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    axios.get('/api/v1/profile')
      .then((res) => {
        const data: ProfileData = res.data.data;
        setProfile(data);
        setUsername(data.username || '');
        setBio(data.bio || '');
        setPortfolioUrl(data.portfolio_url || '');
        // Fix avatar URL: if it starts with /storage/, prepend backend base URL
        if (data.avatar_url) {
          const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
          const url = data.avatar_url.startsWith('http') ? data.avatar_url : `${BACKEND}${data.avatar_url}`;
          setAvatarPreview(url);
        } else {
          setAvatarPreview(null);
        }
      })
      .catch(() => { router.push('/login'); })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('portfolio_url', portfolioUrl);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const res = await axios.post('/api/v1/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data.data);
      setSuccessMsg('Profil berhasil diperbarui!');
      setAvatarFile(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setErrorMsg(err.response.data.errors[firstKey][0]);
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal memperbarui profil.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

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
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-brand-muted mt-1">Perbarui informasi akun dan profil publicmu</p>
            {profile && (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5" /> Akun Terverifikasi
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                  💰 Saldo: Rp {profile.balance?.toLocaleString('id-ID') ?? '0'}
                </span>
              </div>
            )}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Avatar Section */}
            <div className="glass rounded-3xl p-6 border border-white/10">
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-blue" /> Foto Profil
              </h2>
              <div className="flex items-center gap-5">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-blue/40"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      {profile ? getInitials(profile.name) : '??'}
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-medium text-brand-blue hover:text-white transition-colors"
                  >
                    Ganti foto
                  </button>
                  <p className="text-xs text-brand-muted mt-1">JPG, PNG, atau WebP. Maks 2MB.</p>
                  {avatarFile && (
                    <p className="text-xs text-emerald-400 mt-1">✓ {avatarFile.name}</p>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Info Section */}
            <div className="glass rounded-3xl p-6 border border-white/10 space-y-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" /> Informasi Dasar
              </h2>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted flex items-center justify-between">
                  <span>Nama Unik (Username)</span>
                  <span className="text-xs">{profile ? 2 - profile.username_changes_count : 2} sisa perubahan</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-muted font-mono">
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={profile ? profile.username_changes_count >= 2 : false}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-12 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all ${profile && profile.username_changes_count >= 2 ? 'cursor-not-allowed opacity-50' : ''}`}
                    placeholder="namaunik"
                  />
                  {profile?.is_verified ? (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <BadgeCheck className="h-5 w-5 text-blue-400" />
                    </div>
                  ) : null}
                </div>
                {profile?.last_username_change_at && (
                  <p className="text-[10px] text-brand-muted">
                    Terakhir diubah: {new Date(profile.last_username_change_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>

              {/* Name (readonly) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted flex items-center gap-2">
                  Nama Lengkap <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Tidak dapat diubah</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-brand-muted" />
                  </div>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    disabled
                    className="w-full bg-white/3 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-brand-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted flex items-center gap-2">
                  Email <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Tidak dapat diubah</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-brand-muted" />
                  </div>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-white/3 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-brand-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-muted flex items-center gap-2">
                  Role Akun
                </label>
                <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
                  <Shield className="w-4 h-4 text-brand-muted" />
                  <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                    profile?.role === 'creator' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio & Portfolio (Creator only) */}
            {(profile?.role === 'creator' || profile?.role === 'admin') && (
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-5">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-purple" /> Profil Creator
                </h2>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all resize-none"
                    placeholder="Ceritakan tentang dirimu sebagai creator 3D..."
                  />
                  <p className="text-xs text-brand-muted text-right">{bio.length}/1000</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Portfolio URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-brand-muted" />
                    </div>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                      placeholder="https://portofolio-kamu.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Messages */}
            {successMsg && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-xl text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" /> {successMsg}
              </motion.div>
            )}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-100"
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="w-5 h-5" /> Simpan Perubahan</>
              )}
            </button>
          </motion.form>
        </div>
      </div>
      <Footer />
    </>
  );
}
