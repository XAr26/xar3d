import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-darker pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center font-bold text-white">
                X
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                XAR <span className="text-brand-muted font-medium">3D HUB</span>
              </span>
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed mb-6">
              The premium marketplace and community for 3D creators. Discover, buy, and sell high-quality Blender assets.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/explore" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">All Assets</Link></li>
              <li><Link href="/explore?category=karakter" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Characters</Link></li>
              <li><Link href="/explore?category=lingkungan" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Environments</Link></li>
              <li><Link href="/explore?category=prop-objek" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Props & Objects</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Creators</h3>
            <ul className="space-y-3">
              <li><Link href="/upload" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Sell your 3D models</Link></li>
              <li><Link href="/creators" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Creator Dashboard</Link></li>
              <li><Link href="/guidelines" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Quality Guidelines</Link></li>
              <li><Link href="/payouts" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Payouts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Contact</Link></li>
              <li><Link href="/privacy" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-brand-muted hover:text-brand-blue transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-muted text-sm text-center md:text-left">
            © {new Date().getFullYear()} XAR 3D HUB. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-blue transition-colors flex items-center justify-center cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-blue transition-colors flex items-center justify-center cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-brand-blue transition-colors flex items-center justify-center cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
