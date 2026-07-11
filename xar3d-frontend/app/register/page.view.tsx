'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, User, Loader2, ArrowRight, Paintbrush, Gift, CheckCircle, ChevronLeft, Upload, KeyRound } from 'lucide-react';
import axios from '@/lib/axios';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  
  // Step 3 states
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Step & Preferences state
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<string[]>([]);

  const CATEGORIES = ['Karakter', 'Lingkungan', 'Kendaraan', 'Arsitektur', 'Senjata', 'Prop & Objek'];

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStep(2);
  };

  const handleRequestOTP = () => {
    if (!email || !password || !passwordConfirmation) {
      setErrorMsg('Harap isi email dan password terlebih dahulu.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setErrorMsg('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    alert("Pesan Sistem (Simulasi): Kode OTP Anda adalah " + code);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedOtp) {
      setErrorMsg('Harap minta kode OTP terlebih dahulu.');
      return;
    }
    if (otp !== simulatedOtp) {
      setErrorMsg('Kode OTP tidak valid.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleTogglePreference = (cat: string) => {
    setPreferences(prev => 
      prev.includes(cat) ? prev.filter(p => p !== cat) : [...prev, cat]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('date_of_birth', dateOfBirth);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
      formData.append('username', username);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      formData.append('is_creator', '0');
      formData.append('preferences', JSON.stringify(preferences));

      const response = await axios.post('/api/v1/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { token } = response.data.data;
      if (token) {
        localStorage.setItem('auth_token', token);
        window.location.href = '/';
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0];
        setErrorMsg(error.response.data.errors[firstKey][0]);
      } else {
        setErrorMsg(error.response?.data?.message || 'Registrasi gagal, silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8 shadow-2xl border border-white/10"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Buat Akun Baru</h1>
        <p className="text-brand-muted text-sm">Bergabunglah dengan komunitas 3D terbaik</p>
      </div>


      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 rounded-full transition-all ${step === s ? 'w-8 bg-brand-blue' : step > s ? 'w-4 bg-emerald-500' : 'w-4 bg-white/10'}`} />
        ))}
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-xl mb-5 text-center"
        >
          {errorMsg}
        </motion.div>
      )}

      {/* STEP 1: Basic Info */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-4 items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">Bonus Selamat Datang!</p>
              <p className="text-xs text-brand-muted mt-0.5">Daftar sekarang dan dapatkan 1 token untuk mengunduh aset Premium secara Gratis.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-muted pl-1">Nama Depan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-brand-muted" />
                </div>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all text-sm" placeholder="John" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-muted pl-1">Nama Belakang</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-brand-muted" />
                </div>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all text-sm" placeholder="Doe (Opsional)" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-muted pl-1">Tanggal Lahir</label>
            <div className="relative">
              <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            Lanjut <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: Email, Password, & OTP */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-muted pl-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-brand-muted" />
              </div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all" placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-muted pl-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-brand-muted" />
                </div>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all text-sm" placeholder="Min. 8 karakter" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-muted pl-1">Konfirmasi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-brand-muted" />
                </div>
                <input type="password" required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all text-sm" placeholder="Ulangi password" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 mt-4 space-y-4">
            <p className="text-sm text-brand-muted">Verifikasi Email Anda</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleRequestOTP} className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-3 rounded-xl transition-colors whitespace-nowrap">
                Kirim Kode
              </button>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-brand-muted" />
                </div>
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all text-sm tracking-widest font-mono" placeholder="123456" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              Verifikasi & Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Profile Setup */}
      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 mb-4">
            <div 
              className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue hover:bg-white/10 transition-all overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <User className="w-8 h-8 text-brand-muted mb-1" />
                  <span className="text-[10px] text-brand-muted">Upload Foto</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-muted pl-1">Username / Nama Panggilan Unik</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-brand-muted font-mono">@</span>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all" placeholder="neovertex" />
            </div>
          </div>



          <div className="pt-2 border-t border-white/10">
            <h3 className="text-white font-semibold text-sm mb-1 mt-2">Pilih Minat Anda (Opsional)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleTogglePreference(cat)}
                  className={`py-2 px-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    preferences.includes(cat)
                      ? 'bg-brand-blue/10 border-brand-blue/50 text-brand-blue shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'bg-white/5 border-white/10 text-brand-muted hover:border-white/30'
                  }`}
                >
                  <span className="font-medium truncate">{cat}</span>
                  {preferences.includes(cat) && <CheckCircle className="w-3 h-3 ml-1 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(2)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Selesaikan Pendaftaran'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-brand-muted">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-white font-semibold hover:text-brand-blue transition-colors">
          Masuk di sini
        </Link>
      </div>
    </motion.div>
  );
}
