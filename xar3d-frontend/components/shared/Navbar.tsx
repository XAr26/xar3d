'use client';

import Link from 'next/link';
import { Search, Menu, Upload, X, LogOut, LayoutDashboard, User, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import axios from '@/lib/axios';
import NotificationBell from '@/components/shared/NotificationBell';

interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch authenticated user on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    axios.get('/api/v1/auth/user')
      .then((res) => setUser(res.data.data))
      .catch((err) => {
        // Only clear token if server explicitly says unauthorized
        if (err.response?.status === 401) {
          localStorage.removeItem('auth_token');
        }
        setUser(null);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (_) {}
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/';
  };

  // Get initials from name
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent',
        isScrolled || isMobileMenuOpen ? 'glass border-white/10 shadow-lg py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.7)] transition-all">
            X
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            XAR <span className="text-brand-muted font-medium">3D HUB</span>
          </span>
        </Link>

        {/* Search Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-brand-muted group-focus-within:text-brand-blue transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search premium 3D assets..."
            className="w-full bg-brand-dark/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all"
          />
        </div>

        {/* Nav Links Desktop */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/explore" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
            Explore
          </Link>
          <Link href="/creators" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
            Creators
          </Link>

          <div className="h-6 w-px bg-white/10" />

          {user ? (
            <>
              {/* Upload button for creators */}
              {user.role === 'creator' && (
                <Link href="/upload" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all border border-white/10">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.4)] ring-2 ring-white/10 group-hover:ring-brand-blue/50 transition-all">
                    {getInitials(user.username || user.name)}
                  </div>
                  <span className="text-sm font-medium text-white hidden lg:block">@{user.username || user.name.split(' ')[0]}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 glass rounded-2xl border border-white/10 shadow-2xl py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-brand-muted truncate">{user.email}</p>
                      <span className={cn(
                        "inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium",
                        user.role === 'creator' ? 'bg-brand-purple/20 text-purple-400' : 'bg-brand-blue/20 text-blue-400'
                      )}>
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                        {user.role === 'admin' ? (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-white hover:bg-red-500/10 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        ) : (
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                        )}
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-muted hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        <User className="w-4 h-4" /> Edit Profil
                      </Link>
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white hover:text-brand-blue transition-colors">
                Log in
              </Link>
              <Link href="/register" className="flex items-center gap-2 bg-white text-brand-darker px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-blue hover:text-white transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-darker/97 backdrop-blur-xl border-b border-white/10 shadow-2xl py-6 px-4 flex flex-col gap-3">
          {user && (
            <div className="flex items-center gap-3 p-3 glass rounded-2xl border border-white/10 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold shrink-0">
                {getInitials(user.username || user.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">@{user.username || user.name}</p>
                <p className="text-xs text-brand-muted truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Link href="/explore" className="text-base font-medium text-white hover:text-brand-blue py-2" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
          <Link href="/creators" className="text-base font-medium text-white hover:text-brand-blue py-2" onClick={() => setIsMobileMenuOpen(false)}>Creators</Link>

          <div className="h-px w-full bg-white/10 my-1" />

          {user ? (
            <>
              <Link href="/dashboard" className="text-base font-medium text-white hover:text-brand-blue py-2" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/profile" className="text-base font-medium text-white hover:text-brand-blue py-2" onClick={() => setIsMobileMenuOpen(false)}>Edit Profil</Link>
              {user.role === 'creator' && (
                <Link href="/upload" className="flex items-center justify-center gap-2 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 px-4 py-3 rounded-xl font-semibold mt-1" onClick={() => setIsMobileMenuOpen(false)}>
                  <Upload className="w-4 h-4" /> Upload Asset
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-400 border border-red-500/30 px-4 py-3 rounded-xl font-semibold bg-red-500/10 mt-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium text-white hover:text-brand-blue py-2" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              <Link href="/register" className="flex items-center justify-center gap-2 bg-brand-blue text-white px-4 py-3 rounded-xl font-semibold mt-1" onClick={() => setIsMobileMenuOpen(false)}>
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
