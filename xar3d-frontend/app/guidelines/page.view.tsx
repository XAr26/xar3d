import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { ShieldCheck } from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 text-center">
            <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Quality Guidelines</h1>
            <p className="text-brand-muted text-lg mb-8 max-w-2xl mx-auto">
              Panduan kualitas untuk kreator sedang dalam penyusunan. Kami berkomitmen untuk memastikan semua aset yang dijual di XAR 3D HUB memenuhi standar industri tertinggi.
            </p>
            <div className="inline-block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">
              Segera Hadir
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
