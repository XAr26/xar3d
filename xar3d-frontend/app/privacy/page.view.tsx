import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
            <h1 className="text-4xl font-bold text-white mb-2">Kebijakan Privasi</h1>
            <p className="text-brand-muted mb-8">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID')}</p>
            
            <div className="space-y-6 text-brand-muted text-base leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
                <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda mendaftar, membuat profil, melakukan pembelian, atau menghubungi dukungan pelanggan. Informasi ini dapat mencakup nama, alamat email, kata sandi, dan informasi pembayaran.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">2. Penggunaan Informasi</h2>
                <p>Informasi yang kami kumpulkan digunakan untuk:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                  <li>Memproses transaksi dan mengirimkan pemberitahuan terkait pesanan Anda.</li>
                  <li>Memastikan keamanan akun Anda.</li>
                  <li>Meningkatkan pengalaman pengguna secara keseluruhan.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">3. Keamanan Data</h2>
                <p>Kami menerapkan langkah-langkah keamanan teknis dan administratif yang dirancang untuk melindungi informasi pribadi Anda dari kehilangan, pencurian, atau akses yang tidak sah. Meskipun demikian, tidak ada transmisi data melalui internet yang dapat dijamin 100% aman.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">4. Hak Anda</h2>
                <p>Anda berhak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda kapan saja melalui pengaturan profil akun Anda. Jika Anda memerlukan bantuan lebih lanjut, Anda dapat menghubungi kami melalui halaman kontak.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
