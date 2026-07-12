'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, Filter, Grid3X3, List, Star, Download,
  SlidersHorizontal, X, ChevronLeft, ChevronRight, Package
} from 'lucide-react';
import axios from '@/lib/axios';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Asset {
  id: string; title: string; slug: string; description: string;
  price: number; thumbnail_url: string | null; average_rating: number;
  download_count: number; license_type: string; blender_version: string | null;
  user: { id: string; name: string };
  category: { id: string; name: string; slug: string };
}
interface Category { id: string; name: string; slug: string; }
interface Meta { current_page: number; last_page: number; total: number; }

const SORT_OPTIONS = [
  { value: '', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'price_asc', label: 'Harga: Termurah' },
  { value: 'price_desc', label: 'Harga: Termahal' },
];

export default function ExplorePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (search) params.q = search;
      if (activeCategory) params.category = activeCategory;
      if (sort) params.sort = sort;
      const res = await axios.get('/api/v1/assets', { params });
      setAssets(res.data.data);
      setMeta({ current_page: res.data.current_page, last_page: res.data.last_page, total: res.data.total });
    } catch { setAssets([]); }
    finally { setIsLoading(false); }
  }, [search, activeCategory, sort, page]);

  useEffect(() => { axios.get('/api/v1/assets/categories').then(r => setCategories(r.data.data)); }, []);
  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => { setPage(1); }, [search, activeCategory, sort]);

  const formatPrice = (price: any) => {
    const num = Number(price);
    return num === 0 ? 'Gratis' : `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Jelajahi Aset 3D</h1>
            <p className="text-brand-muted">Temukan ribuan aset Blender premium dari creator terbaik</p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari aset 3D..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-blue transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-brand-muted hover:text-white" />
                </button>
              )}
            </div>
            <select
              value={sort} onChange={e => setSort(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-blue transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-brand-dark">{o.label}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-brand-blue/20 border-brand-blue/50 text-brand-blue' : 'bg-white/5 border-white/10 text-brand-muted hover:text-white'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="flex border border-white/10 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-3 transition-all ${viewMode === 'grid' ? 'bg-brand-blue/20 text-brand-blue' : 'text-brand-muted hover:text-white'}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-3 transition-all ${viewMode === 'list' ? 'bg-brand-blue/20 text-brand-blue' : 'text-brand-muted hover:text-white'}`}><List className="w-4 h-4" /></button>
            </div>
          </motion.div>

          {/* Category Filter */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden">
                <div className="flex flex-wrap gap-2 pb-4">
                  <button onClick={() => setActiveCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeCategory === '' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white/5 text-brand-muted border-white/10 hover:border-white/20 hover:text-white'}`}>
                    Semua
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.slug === activeCategory ? '' : cat.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeCategory === cat.slug ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white/5 text-brand-muted border-white/10 hover:border-white/20 hover:text-white'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result count */}
          <div className="text-brand-muted text-sm mb-6">
            {isLoading ? 'Memuat...' : `${meta.total} aset ditemukan`}
            {activeCategory && <span> · Kategori: <span className="text-white capitalize">{activeCategory}</span></span>}
            {search && <span> · Pencarian: <span className="text-white">"{search}"</span></span>}
          </div>

          {/* Assets Grid / List */}
          {isLoading ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden border border-white/10 animate-pulse">
                  <div className={`bg-white/5 ${viewMode === 'grid' ? 'h-40' : 'h-24'}`} />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-16 h-16 text-brand-muted/30 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">Tidak ada aset ditemukan</h3>
              <p className="text-brand-muted">Coba ubah filter atau kata kunci pencarian</p>
              <button onClick={() => { setSearch(''); setActiveCategory(''); setSort(''); }}
                className="mt-6 px-6 py-2.5 bg-brand-blue/20 border border-brand-blue/40 text-brand-blue rounded-xl text-sm font-medium hover:bg-brand-blue/30 transition-all">
                Reset Filter
              </button>
            </div>
          ) : (
            <motion.div layout
              className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {assets.map((asset, i) => (
                <motion.div key={asset.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={`/assets/${asset.id}`}>
                    <div className={`glass-hover glass rounded-2xl overflow-hidden border border-white/10 hover:border-brand-blue/30 transition-all group ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
                      {/* Thumbnail */}
                      <div className={`bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 ${viewMode === 'grid' ? 'h-40' : 'w-32 h-24 shrink-0'} relative overflow-hidden`}>
                        {asset.thumbnail_url ? (
                          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} alt={asset.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-brand-muted/30" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            asset.price === 0 ? 'bg-emerald-500/80 text-white' : 'bg-brand-blue/80 text-white'
                          }`}>{formatPrice(asset.price)}</span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-4 flex-1 min-w-0">
                        <p className="text-xs text-brand-muted mb-1">{asset.category?.name}</p>
                        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
                          {asset.title}
                        </h3>
                        <p className="text-brand-muted text-xs mt-1">by {asset.user?.name}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-brand-muted">
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{asset.average_rating > 0 ? asset.average_rating.toFixed(1) : '—'}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{asset.download_count}</span>
                          {asset.blender_version && <span className="hidden sm:inline">v{asset.blender_version}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-white/10 text-sm text-brand-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <span className="text-sm text-brand-muted px-3">
                Halaman {meta.current_page} / {meta.last_page}
              </span>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-white/10 text-sm text-brand-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
