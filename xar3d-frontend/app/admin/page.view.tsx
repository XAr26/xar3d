'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Package, Loader2, Users, Ban, BadgeCheck, Info, BarChart3, Download, TrendingUp, Wallet } from 'lucide-react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

interface Asset {
  id: string; title: string; thumbnail_url: string | null;
  price: number; category: { name: string; slug: string };
  user: { name: string; username?: string; id: string };
  created_at: string;
}

interface UserData {
  id: string; name: string; username?: string; email: string; role: string;
  is_banned: boolean; is_verified: boolean; created_at: string;
  balance?: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'users' | 'refunds'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [pendingAssets, setPendingAssets] = useState<Asset[]>([]);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [refundsList, setRefundsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [topupAmount, setTopupAmount] = useState('');

  const fetchStats = () => {
    setIsLoading(true);
    axios.get('/api/v1/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { router.push('/login'); return; }

    axios.get('/api/v1/auth/user')
      .then(res => {
        if (res.data.data.role !== 'admin') {
          router.push('/dashboard');
        } else {
          fetchStats();
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchPendingAssets = () => {
    axios.get('/api/v1/admin/assets/pending')
      .then(res => setPendingAssets(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const fetchUsers = () => {
    setIsLoading(true);
    axios.get('/api/v1/admin/users')
      .then(res => setUsersList(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const fetchRefunds = () => {
    setIsLoading(true);
    axios.get('/api/v1/admin/refunds')
      .then(res => setRefundsList(res.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'assets') fetchPendingAssets();
    else if (activeTab === 'refunds') fetchRefunds();
    else if (activeTab === 'overview' && !stats) fetchStats();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await axios.post(`/api/v1/admin/assets/${id}/approve`);
      setPendingAssets(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Gagal menyetujui aset.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Anda yakin ingin menolak dan menghapus aset ini secara permanen?')) return;
    setProcessingId(id);
    try {
      await axios.delete(`/api/v1/admin/assets/${id}/reject`);
      setPendingAssets(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      alert('Gagal menolak aset.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleBan = async (id: string) => {
    if (!confirm('Ubah status BAN pengguna ini?')) return;
    setProcessingId(id);
    try {
      const res = await axios.patch(`/api/v1/admin/users/${id}/ban`);
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_banned: res.data.user.is_banned } : u));
      if (selectedUser?.id === id) setSelectedUser(res.data.user);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengubah status ban.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleVerify = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await axios.patch(`/api/v1/admin/users/${id}/verify`);
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_verified: res.data.user.is_verified } : u));
      if (selectedUser?.id === id) setSelectedUser(res.data.user);
    } catch (e) {
      alert('Gagal memverifikasi pengguna.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTopup = async (id: string) => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount < 1000) { alert('Minimal top-up adalah Rp 1.000'); return; }
    if (!confirm(`Top-up Rp ${amount.toLocaleString('id-ID')} ke akun ini?`)) return;
    setProcessingId(id);
    try {
      const res = await axios.post(`/api/v1/admin/users/${id}/topup`, { amount });
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, balance: res.data.user.balance } : u));
      if (selectedUser?.id === id) setSelectedUser({ ...selectedUser!, balance: res.data.user.balance });
      setTopupAmount('');
      alert(`Saldo berhasil ditambahkan Rp ${amount.toLocaleString('id-ID')}`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal top-up.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveRefund = async (id: string) => {
    const note = prompt("Catatan Admin untuk Persetujuan Refund:");
    if (note === null) return;
    setProcessingId(id);
    try {
      await axios.post(`/api/v1/admin/refunds/${id}/approve`, { admin_note: note });
      alert("Refund disetujui.");
      fetchRefunds();
    } catch(e: any) { alert(e.response?.data?.message || 'Gagal approve refund'); }
    finally { setProcessingId(null); }
  };

  const handleRejectRefund = async (id: string) => {
    const note = prompt("Alasan Penolakan Refund (Wajib):");
    if (!note) return;
    setProcessingId(id);
    try {
      await axios.post(`/api/v1/admin/refunds/${id}/reject`, { admin_note: note });
      alert("Refund ditolak.");
      fetchRefunds();
    } catch(e: any) { alert(e.response?.data?.message || 'Gagal menolak refund'); }
    finally { setProcessingId(null); }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (isLoading) return (
    <><Navbar /><div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin" />
    </div><Footer /></>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-brand-dark">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" /> Admin Panel
              </h1>
              <p className="text-brand-muted mt-2">Pusat kendali moderasi aset dan pengguna platform.</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 overflow-x-auto">
              <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20' : 'text-brand-muted hover:text-white'}`}>
                <BarChart3 className="w-4 h-4" /> Overview
              </button>
              <button onClick={() => setActiveTab('assets')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'assets' ? 'bg-white/10 text-white shadow-md' : 'text-brand-muted hover:text-white'}`}>
                <Package className="w-4 h-4" /> Moderasi Aset
              </button>
              <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white/10 text-white shadow-md' : 'text-brand-muted hover:text-white'}`}>
                <Users className="w-4 h-4" /> Manajemen Pengguna
              </button>
              <button onClick={() => setActiveTab('refunds')} className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'refunds' ? 'bg-white/10 text-white shadow-md' : 'text-brand-muted hover:text-white'}`}>
                <Wallet className="w-4 h-4" /> Refund
              </button>
            </div>
          </motion.div>

          <div className="glass rounded-3xl border border-white/10 p-6 md:p-8">
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Sistem Statistik</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-brand-muted text-sm font-medium">Total Pengguna</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <Ban className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-brand-muted text-sm font-medium">Pengguna Banned</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.banned_users}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <Package className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-brand-muted text-sm font-medium">Aset Terpublikasi</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.total_assets}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Download className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-brand-muted text-sm font-medium">Total Unduhan</p>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.total_downloads}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" /> Moderasi Menunggu
                    </h3>
                    <p className="text-brand-muted text-sm mb-4">Terdapat <strong>{stats.pending_assets}</strong> aset yang membutuhkan persetujuan Anda segera.</p>
                    <button 
                      onClick={() => setActiveTab('assets')}
                      className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    >
                      Tinjau Aset Sekarang
                    </button>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" /> Status Server
                    </h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-muted">Kesehatan API</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1"><Check className="w-4 h-4" /> Optimal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-muted">Penyimpanan (Storage)</span>
                        <span className="text-white font-medium">Normal</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-muted">Mode Perbaikan</span>
                        <span className="text-brand-muted font-medium">Nonaktif</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'assets' && (
              <>
                <h2 className="text-xl font-bold text-white mb-6">Aset Menunggu Persetujuan ({pendingAssets.length})</h2>

            {pendingAssets.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <Check className="w-16 h-16 text-emerald-500/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Semua Bersih!</h3>
                <p className="text-brand-muted">Tidak ada aset baru yang perlu dimoderasi saat ini.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssets.map((asset, i) => (
                  <motion.div key={asset.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                    
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-black/40 shrink-0 relative">
                      {asset.thumbnail_url ? (
                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${asset.thumbnail_url}`} alt={asset.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-white/20" /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left">
                      <p className="text-xs text-brand-blue font-medium mb-1 uppercase tracking-wider">{asset.category?.name}</p>
                      <h4 className="text-lg font-bold text-white mb-1 truncate">{asset.title}</h4>
                      <p className="text-sm text-brand-muted mb-2">Diunggah oleh <span className="text-white font-medium">@{asset.user.username || asset.user.name}</span> pada {formatDate(asset.created_at)}</p>
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {asset.price > 0 ? `Rp ${Number(asset.price).toLocaleString('id-ID')}` : 'Gratis'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                      <button
                        onClick={() => handleReject(asset.id)}
                        disabled={processingId === asset.id}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                      >
                        <X className="w-4 h-4" /> Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(asset.id)}
                        disabled={processingId === asset.id}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                      >
                        {processingId === asset.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Setujui</>}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </>
            )}
            
            {activeTab === 'users' && (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Daftar Pengguna ({usersList.length})</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-brand-muted text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium">Nama & Email</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white flex items-center gap-1">
                              @{user.username || user.name} 
                              {user.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400" />}
                            </span>
                          </div>
                          <div className="text-sm text-brand-muted">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : user.role === 'creator' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.is_banned ? (
                            <span className="text-red-400 text-sm font-semibold flex items-center gap-1"><Ban className="w-4 h-4"/> Banned</span>
                          ) : (
                            <span className="text-emerald-400 text-sm font-semibold">Active</span>
                          )}
                        </td>
                        <td className="p-4 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-xl border border-white/10 text-brand-muted hover:text-white transition-all bg-white/5 hover:bg-white/10"
                            title="Informasi & Aksi"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
            )}

            {/* Refund List */}
            {activeTab === 'refunds' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-brand-muted text-sm">
                      <th className="py-4 px-4 font-medium">Pembeli</th>
                      <th className="py-4 px-4 font-medium">Aset</th>
                      <th className="py-4 px-4 font-medium">Alasan</th>
                      <th className="py-4 px-4 font-medium">Bukti</th>
                      <th className="py-4 px-4 font-medium">Status</th>
                      <th className="py-4 px-4 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundsList.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-brand-muted">Tidak ada pengajuan refund</td></tr>
                    ) : refundsList.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4"><span className="text-white text-sm">{r.user?.name}</span></td>
                        <td className="py-4 px-4"><span className="text-white text-sm">{r.asset?.title}</span></td>
                        <td className="py-4 px-4"><p className="text-sm text-brand-muted max-w-xs truncate">{r.reason}</p></td>
                        <td className="py-4 px-4">
                          {r.proof_image && <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${r.proof_image}`} target="_blank" className="text-blue-400 text-sm hover:underline">Lihat Bukti</a>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {r.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleApproveRefund(r.id)} disabled={processingId === r.id} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50" title="Setujui">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRejectRefund(r.id)} disabled={processingId === r.id} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50" title="Tolak">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* User Info Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-brand-dark border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 text-brand-muted hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">Informasi Pengguna</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Nama</p>
                <p className="text-white font-medium text-lg flex items-center gap-2">
                  {selectedUser.name}
                  {selectedUser.is_verified && <BadgeCheck className="w-5 h-5 text-blue-400" />}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Email</p>
                <p className="text-white/80">{selectedUser.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Role</p>
                  <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wider inline-block ${selectedUser.role === 'admin' ? 'bg-red-500/20 text-red-400' : selectedUser.role === 'creator' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Status</p>
                  {selectedUser.is_banned ? (
                    <span className="text-red-400 text-sm font-semibold flex items-center gap-1"><Ban className="w-4 h-4"/> Banned</span>
                  ) : (
                    <span className="text-emerald-400 text-sm font-semibold">Active</span>
                  )}
                </div>
              </div>
              {selectedUser.balance !== undefined && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                  <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">Saldo Saat Ini</p>
                  <p className="text-emerald-400 font-bold text-lg">Rp {Number(selectedUser.balance).toLocaleString('id-ID')}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Top-Up Saldo */}
              {selectedUser.role !== 'admin' && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="text-xs text-brand-muted mb-2 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Top-Up Saldo</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={topupAmount}
                      onChange={e => setTopupAmount(e.target.value)}
                      placeholder="Nominal (min. 1000)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      onClick={() => handleTopup(selectedUser.id)}
                      disabled={processingId === selectedUser.id}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processingId === selectedUser.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Top-Up'}
                    </button>
                  </div>
                </div>
              )}

              {/* If Creator, show Verify button */}
              {selectedUser.role === 'creator' && (
                <button
                  onClick={() => handleToggleVerify(selectedUser.id)}
                  disabled={processingId === selectedUser.id}
                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                    selectedUser.is_verified 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <BadgeCheck className="w-5 h-5" /> 
                  {selectedUser.is_verified ? 'Hapus Status Verified' : 'Berikan Status Verified'}
                </button>
              )}

              {/* Prevent banning admins */}
              {selectedUser.role !== 'admin' && (
                <button
                  onClick={() => handleToggleBan(selectedUser.id)}
                  disabled={processingId === selectedUser.id}
                  className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                    selectedUser.is_banned 
                      ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  <Ban className="w-5 h-5" /> 
                  {selectedUser.is_banned ? 'Lepaskan Ban (Unban)' : 'Banned Pengguna Ini'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
