// Route group (main) - provides Navbar + Footer for inner pages like /explore, /assets, etc.
// The root "/" is handled by app/page.tsx directly.
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  );
}
