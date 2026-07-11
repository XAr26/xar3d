'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Settings, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Shield, Bell } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function SettingsPage() {
  const router = useRouter();
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await axios.patch('/api/v1/profile/password', {
        current_password: currentPassword,
        password: password,
        password_confirmation: passwordConfirmation,
      });
      
      setSuccessMsg('Password berhasil diperbarui.');
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        setErrorMsg(err.response.data.errors[firstKey][0]);
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal memperbarui password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-brand-muted hover:text-white transition-colors text-sm mb-6">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8 text-brand-blue" /> Pengaturan Akun
            </h1>
            <p className="text-brand-muted mt-1">Kelola keamanan dan preferensi akun Anda</p>
          </motion.div>

          <div className="space-y-6">
            {/* Ubah Password */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 md:p-8 border border-white/10">
              <h2 className="text-white font-semibold mb-6 flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-brand-blue" /> Keamanan & Password
              </h2>
              
              {successMsg && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 p-4 rounded-xl text-sm mb-6">
                  <CheckCircle className="w-5 h-5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl text-sm mb-6">
                  <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Password Saat Ini</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                      placeholder="Masukkan password saat ini"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Password Baru</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-muted">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordConfirmation}
                      onChange={e => setPasswordConfirmation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
                      placeholder="Ketik ulang password baru"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-brand-blue-hover disabled:opacity-70 flex items-center gap-2 mt-2"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : 'Simpan Password'}
                </button>
              </form>
            </motion.div>

            {/* Preferensi Notifikasi (Placeholder) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 md:p-8 border border-white/10">
              <h2 className="text-white font-semibold mb-6 flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-brand-purple" /> Preferensi Notifikasi
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div>
                    <p className="text-white font-medium">Notifikasi Email</p>
                    <p className="text-brand-muted text-sm mt-1">Terima email saat ada aset baru yang trending</p>
                  </div>
                  <div className="w-12 h-6 bg-brand-blue/30 rounded-full relative cursor-not-allowed opacity-60">
                    <div className="w-5 h-5 bg-brand-blue rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>
                <p className="text-xs text-brand-muted text-center mt-2">Fitur notifikasi akan segera hadir di update selanjutnya.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
