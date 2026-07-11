'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Paintbrush, Loader2, ArrowRight, Monitor, Tag, Link as LinkIcon, CheckCircle, Globe, MessageSquare } from 'lucide-react';
import axios from '@/lib/axios';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

const SOFTWARE_LIST = ['Blender', 'Maya', 'ZBrush', 'Unreal Engine', 'Unity', '3ds Max', 'Cinema 4D', 'Substance Painter'];
const SPECIALIZATION_LIST = ['Karakter', 'Lingkungan', 'Kendaraan', 'Arsitektur', 'Senjata', 'Prop & Objek', 'Animasi'];

export default function BecomeCreatorPage() {
  const router = useRouter();
  
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [softwareSkills, setSoftwareSkills] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  
  const [socials, setSocials] = useState({
    artstation: '',
    sketchfab: '',
    instagram: '',
    twitter: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    axios.get('/api/v1/auth/user').then(res => {
      const user = res.data.data;
      if (user.role === 'creator' || user.role === 'admin') {
        router.push('/dashboard'); // Already a creator
      }
      setCheckingAuth(false);
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  const toggleArrayItem = (item: string, array: string[], setArray: (val: string[]) => void) => {
    if (array.includes(item)) setArray(array.filter(i => i !== item));
    else setArray([...array, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await axios.post('/api/v1/profile/upgrade-creator', {
        bio,
        portfolio_url: portfolioUrl,
        software_skills: softwareSkills,
        specializations,
        social_links: socials
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mendaftar sebagai kreator. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-10 max-w-md w-full text-center border border-brand-purple/20">
            <div className="w-20 h-20 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-brand-purple" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Selamat Bergabung!</h1>
            <p className="text-brand-muted mb-6">Akun Anda berhasil ditingkatkan menjadi Kreator. Mari mulai mengunggah karya terbaik Anda!</p>
            <Loader2 className="w-6 h-6 animate-spin text-brand-purple mx-auto" />
            <p className="text-xs text-brand-muted mt-4">Mengarahkan ke dashboard...</p>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Paintbrush className="w-8 h-8 text-brand-purple" /> Upgrade ke Kreator
            </h1>
            <p className="text-brand-muted text-lg">Lengkapi profil profesional Anda untuk mulai menjual aset 3D.</p>
          </motion.div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-center">
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bio & Portfolio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-5">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Informasi Dasar</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-muted pl-1">Ceritakan Tentang Anda / Studio Anda</label>
                <textarea 
                  required
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/50 focus:border-brand-purple transition-all h-28 resize-none" 
                  placeholder="Saya adalah 3D Artist dari Indonesia yang berfokus pada..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-muted pl-1">URL Portofolio Utama</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="w-4 h-4 text-brand-muted" />
                  </div>
                  <input 
                    type="url" 
                    required
                    value={portfolioUrl} 
                    onChange={e => setPortfolioUrl(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/50 focus:border-brand-purple transition-all" 
                    placeholder="https://yourportfolio.com" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Skills & Specialization */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Keahlian & Spesialisasi</h2>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-brand-muted pl-1 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Software yang Dikuasai
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOFTWARE_LIST.map(sw => (
                    <button
                      key={sw} type="button"
                      onClick={() => toggleArrayItem(sw, softwareSkills, setSoftwareSkills)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        softwareSkills.includes(sw) 
                          ? 'bg-brand-purple/20 border-brand-purple text-brand-purple border'
                          : 'bg-white/5 border-white/10 text-brand-muted border hover:border-white/30'
                      }`}
                    >
                      {sw}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-brand-muted pl-1 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Spesialisasi Utama
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATION_LIST.map(spec => (
                    <button
                      key={spec} type="button"
                      onClick={() => toggleArrayItem(spec, specializations, setSpecializations)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        specializations.includes(spec) 
                          ? 'bg-brand-blue/20 border-brand-blue text-brand-blue border'
                          : 'bg-white/5 border-white/10 text-brand-muted border hover:border-white/30'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-5">
              <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">Sosial Media (Opsional)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-brand-muted pl-1">ArtStation</label>
                  <input type="url" value={socials.artstation} onChange={e => setSocials({...socials, artstation: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm" placeholder="URL Profil" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-brand-muted pl-1">Sketchfab</label>
                  <input type="url" value={socials.sketchfab} onChange={e => setSocials({...socials, sketchfab: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm" placeholder="URL Profil" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-brand-muted pl-1">Instagram</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Globe className="w-4 h-4 text-brand-muted" /></div>
                    <input type="url" value={socials.instagram} onChange={e => setSocials({...socials, instagram: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm" placeholder="https://instagram.com/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-brand-muted pl-1">Twitter / X</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MessageSquare className="w-4 h-4 text-brand-muted" /></div>
                    <input type="url" value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm" placeholder="https://twitter.com/..." />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Creator Agreement */}
            <div className="glass p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-brand-purple focus:ring-brand-purple" />
                <span className="text-sm text-brand-muted leading-relaxed">
                  Saya menjamin bahwa semua aset 3D yang akan saya unggah adalah <strong>karya asli saya</strong> dan tidak melanggar hak cipta pihak mana pun. Saya setuju dengan <Link href="/terms" className="text-brand-purple hover:underline">Syarat & Ketentuan Kreator</Link>.
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Selesaikan Pendaftaran Kreator'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
