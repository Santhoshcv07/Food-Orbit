// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Toaster } from "sonner";

// Using Inter font for a clean, modern startup aesthetic
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodOrbit | Three-Tier Food Rescue Network",
  description: "Systematically redirecting surplus event food to NGOs, farmers, and compost agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-transparent text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950`}>
        <AuroraBackground>
          <div className="flex flex-col min-h-screen">
            {/* Navigation Bar */}
            <Navbar />
            <Toaster theme="dark" position="bottom-right" richColors />

            {/* Main Page Content */}
            <main className="flex-1 relative z-10">
              {children}
            </main>

            {/* Master Footer */}
            <Footer />
          </div>
        </AuroraBackground>
      </body>
    </html>
  );
}