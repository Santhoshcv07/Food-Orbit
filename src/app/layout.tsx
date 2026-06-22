// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950`}>
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Master Footer */}
        <Footer />
      </body>
    </html>
  );
}