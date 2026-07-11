import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
            <h1 className="text-4xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
            <p className="text-brand-muted mb-8">Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID')}</p>
            
            <div className="space-y-6 text-brand-muted text-base leading-relaxed">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">1. Penerimaan Syarat</h2>
                <p>Dengan mengakses atau menggunakan platform XAR 3D HUB, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini serta seluruh peraturan dan perundang-undangan yang berlaku. Jika Anda tidak setuju dengan ketentuan ini, Anda dilarang menggunakan platform kami.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">2. Akun Pengguna</h2>
                <p>Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi akun Anda dan membatasi akses ke komputer atau perangkat seluler Anda. Anda setuju untuk menerima tanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">3. Konten Kreator & Hak Cipta</h2>
                <p>Jika Anda mengunggah aset 3D ke platform kami:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Anda <strong>wajib memastikan</strong> bahwa Anda memegang semua hak lisensi dan kekayaan intelektual atas karya tersebut.</li>
                  <li>Mengunggah karya hasil plagiasi atau yang melanggar hak cipta pihak ketiga akan berakibat pada pemblokiran akun permanen tanpa pemberitahuan.</li>
                  <li>Anda memberikan lisensi non-eksklusif kepada kami untuk mendistribusikan aset tersebut di platform.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">4. Pembelian Aset</h2>
                <p>Pembelian aset 3D bersifat final. Pengembalian dana (refund) hanya dapat diproses jika aset terbukti cacat teknis secara fatal atau tidak sesuai dengan deskripsi awal, asalkan Anda melaporkannya dalam kurun waktu 7 hari setelah pembelian.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
