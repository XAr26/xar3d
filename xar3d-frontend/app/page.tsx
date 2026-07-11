import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import HomeContent from "@/components/home/HomeContent";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
