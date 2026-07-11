import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Tentang Kami</h1>
            <div className="space-y-6 text-brand-muted text-lg leading-relaxed">
              <p>
                Selamat datang di <strong className="text-white">XAR 3D HUB</strong>, platform inovatif yang dirancang khusus untuk memfasilitasi kebutuhan para desainer, animator, pengembang game, dan seniman 3D di seluruh dunia.
              </p>
              <p>
                Misi kami adalah menjembatani jarak antara kreativitas dan teknologi dengan menyediakan *marketplace* 3D yang aman, cepat, dan transparan. Di sini, siapa pun dapat menemukan aset berkualitas tinggi atau bahkan memonetisasi karya luar biasa mereka.
              </p>
              <div className="border-l-4 border-brand-purple pl-6 py-2 my-8">
                <h3 className="text-xl font-semibold text-white mb-2">Visi Kami</h3>
                <p className="text-base">Menjadi pusat ekosistem 3D terdepan di Asia yang memberdayakan komunitas digital melalui teknologi yang canggih dan berkelanjutan.</p>
              </div>
              <p>
                Terima kasih telah menjadi bagian dari perjalanan kami. Mari terus berinovasi dan berkarya tanpa batas.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
