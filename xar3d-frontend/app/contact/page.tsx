'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Send, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">Hubungi Kami</h1>
                <p className="text-brand-muted text-lg">Punya pertanyaan atau masukan? Kami siap membantu Anda kapan saja.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Email</h3>
                    <p className="text-brand-muted">support@xar3dhub.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Kantor Pusat</h3>
                    <p className="text-brand-muted">Jl. Kreativitas Digital No. 99<br />Jakarta, Indonesia 12345</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass rounded-3xl p-8 border border-white/10">
              {success ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Pesan Terkirim!</h3>
                  <p className="text-brand-muted">Terima kasih telah menghubungi kami. Tim kami akan merespons dalam 1-2 hari kerja.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-brand-muted pl-1 mb-1.5 block">Nama Lengkap</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/50 focus:border-brand-purple transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-muted pl-1 mb-1.5 block">Email</label>
                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/50 focus:border-brand-purple transition-all" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-muted pl-1 mb-1.5 block">Pesan</label>
                    <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-brand-muted/50 focus:border-brand-purple transition-all h-32 resize-none" placeholder="Tuliskan pesan Anda di sini..." />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-70">
                    {loading ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Pesan</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
