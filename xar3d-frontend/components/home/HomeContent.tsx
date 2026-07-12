'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Star, Download, Sparkles, TrendingUp, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from '@/lib/axios';

interface Asset {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string | null;
  download_count: number;
  average_rating: number;
  category: { name: string; slug: string };
  user: { name: string; username: string; id: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  assets_count?: number;
}

export default function HomeContent() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/v1/assets?per_page=4'),
      axios.get('/api/v1/assets/categories')
    ])
      .then(([assetsRes, catsRes]) => {
        // Handle assets
        const data = assetsRes.data?.data?.data || assetsRes.data?.data || assetsRes.data || [];
        setAssets(Array.isArray(data) ? data : []);
        // Handle categories
        const catData = catsRes.data?.data || catsRes.data || [];
        setCategories(Array.isArray(catData) ? catData : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-3/4 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-blue text-xs md:text-sm font-medium mb-4 md:mb-8"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span>Discover the next generation of 3D assets</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 md:mb-8 leading-tight max-w-4xl mx-auto"
          >
            Premium 3D Assets for <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              World-Class Creators
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-xl text-brand-muted mb-6 md:mb-12 max-w-2xl mx-auto"
          >
            Elevate your Blender projects with our curated collection of high-quality characters, environments, and props.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto"
          >
            <div className="relative w-full sm:w-2/3">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-brand-muted" />
              </div>
              <input 
                type="text" 
                placeholder="Search assets (e.g. 'Sci-Fi Character')..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-brand-muted focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              />
            </div>
            <button className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-hover text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              Search Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* TRENDING ASSETS */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2 mb-2">
              <TrendingUp className="text-brand-blue" />
              Trending Assets
            </h2>
            <p className="text-brand-muted">Most popular models downloaded this week.</p>
          </div>
          <Link href="/explore" className="hidden sm:flex items-center gap-1 text-brand-blue hover:text-white transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand-blue" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <Link href={`/assets/${asset.id}`} key={asset.id}>
                <div className="group glass rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full flex flex-col">
                  <div className="aspect-square bg-black/40 relative overflow-hidden shrink-0">
                    {asset.thumbnail_url ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} 
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <Package className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {asset.average_rating > 0 ? Number(asset.average_rating).toFixed(1) : 'New'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-brand-blue transition-colors line-clamp-1">{asset.title}</h3>
                      <p className="text-brand-muted text-sm mb-4 flex items-center justify-between">
                        <span>by <span className="text-white">@{asset.user.username || asset.user.name}</span></span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3"/> {asset.download_count}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-bold">
                        {asset.price > 0 ? `Rp ${Number(asset.price).toLocaleString('id-ID')}` : 'Gratis'}
                      </span>
                      <button className="text-xs font-semibold bg-white/10 hover:bg-brand-blue text-white px-3 py-1.5 rounded-full transition-colors shrink-0">
                        Lihat Aset
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-10 text-center">Explore Categories</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-blue" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (
              <Link href={`/explore?category=${category.slug}`} key={category.id}>
                <div className="glass-hover rounded-xl p-8 text-center cursor-pointer transition-all group h-full">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-blue group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl opacity-50 group-hover:opacity-100">✨</span>
                  </div>
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-brand-muted text-sm mt-1">{category.assets_count || 0} Assets</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* STATISTICS */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="glass rounded-3xl p-8 md:p-16 border border-brand-blue/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/10 to-brand-purple/10"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50k+</div>
              <div className="text-brand-muted">Premium Assets</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">12k+</div>
              <div className="text-brand-muted">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">2M+</div>
              <div className="text-brand-muted">Downloads</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-brand-muted">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-8 pb-20 md:py-16 md:pb-32">
        <div className="bg-gradient-to-tr from-brand-blue/20 to-brand-purple/20 border border-brand-blue/30 rounded-3xl p-8 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-5xl font-bold text-white mb-4 md:mb-6">Ready to share your creations?</h2>
            <p className="text-brand-muted text-lg mb-8 max-w-2xl mx-auto">
              Join our community of elite 3D artists. Sell your assets, build your portfolio, and earn a living doing what you love.
            </p>
            <Link href="/register">
              <button className="bg-white text-brand-darker hover:bg-gray-200 px-8 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Become a Creator
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
