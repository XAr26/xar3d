import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAR 3D HUB - Premium 3D Asset Marketplace",
  description: "Discover, download, and sell high-quality 3D assets for Blender. A premium community for 3D creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
