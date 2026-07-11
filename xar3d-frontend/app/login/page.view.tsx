'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import axios from '@/lib/axios';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('banned') === '1') {
      setErrorMsg('Akun Anda telah ditangguhkan oleh Admin. Silakan hubungi kami jika ini adalah kesalahan.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      const { token, user } = response.data.data;
      if (token) {
        localStorage.setItem('auth_token', token);
        window.location.href = user?.role === 'admin' ? '/admin' : '/';
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const firstKey = Object.keys(error.response.data.errors)[0];
        setErrorMsg(error.response.data.errors[firstKey][0]);
      } else {
        setErrorMsg(error.response?.data?.message || 'Email atau password salah.');
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
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-brand-muted text-sm">Masuk ke akunmu untuk melanjutkan</p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3 rounded-xl mb-6 text-center"
        >
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-brand-muted pl-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-brand-muted" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue focus:bg-white/8 transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between pl-1 pr-1">
            <label className="text-sm font-medium text-brand-muted">Password</label>
            <Link href="/forgot-password" className="text-xs text-brand-blue hover:text-white transition-colors">
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-brand-muted" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue focus:bg-white/8 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-100"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Masuk <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-brand-muted">
        Belum punya akun?{' '}
        <Link href="/register" className="text-white font-semibold hover:text-brand-blue transition-colors">
          Daftar sekarang
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
