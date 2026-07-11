'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Package, Search, Star, Download, UserCircle, Sparkles } from 'lucide-react';
import axios from '@/lib/axios';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Creator {
  id: string; name: string; created_at: string;
  creator_profile: { bio: string | null; avatar_url: string | null } | null;
  assets_count: number;
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/v1/creators')
      .then(res => setCreators(res.data.data))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = creators.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = (d: string) => new Date(d).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Creator XAR 3D HUB</h1>
            <p className="text-brand-muted">Temukan dan ikuti creator 3D terbaik Indonesia</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-md mx-auto mb-10 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari creator..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all" />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 border border-white/10 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-4" />
                  <div className="h-4 bg-white/5 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <UserCircle className="w-16 h-16 text-brand-muted/20 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">Belum ada creator</h3>
              <p className="text-brand-muted">Jadilah yang pertama bergabung sebagai Creator!</p>
              <Link href="/register" className="inline-flex items-center gap-2 mt-6 bg-brand-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-blue-hover transition-all">Daftar Creator</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((creator, i) => (
                <motion.div key={creator.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/creators/${creator.id}`}>
                    <div className="glass-hover glass rounded-2xl p-5 border border-white/10 hover:border-brand-blue/30 transition-all text-center group">
                      {creator.creator_profile?.avatar_url ? (
                        <img src={`http://127.0.0.1:8000${creator.creator_profile.avatar_url}`} alt={creator.name}
                          className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 ring-2 ring-brand-blue/20 group-hover:ring-brand-blue/50 transition-all" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
                          {getInitials(creator.name)}
                        </div>
                      )}
                      <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-brand-blue transition-colors flex items-center justify-center gap-1">
                        {creator.name}
                        {creator.assets_count >= 10 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        {new Date().getTime() - new Date(creator.created_at).getTime() < 30 * 24 * 60 * 60 * 1000 && <Sparkles className="w-3 h-3 text-emerald-400" />}
                      </h3>
                      <p className="text-brand-muted text-xs mb-3">Sejak {memberSince(creator.created_at)}</p>
                      {creator.creator_profile?.bio && (
                        <p className="text-brand-muted text-xs line-clamp-2 mb-3">{creator.creator_profile.bio}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 text-xs text-brand-muted">
                        <Package className="w-3 h-3" /> {creator.assets_count} aset
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
