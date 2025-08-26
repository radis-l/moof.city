import type { Metadata } from "next";
import { Kanit, MuseoModerno, Maitree } from "next/font/google";
import "./globals.css";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"], // Reduced weight variants
  display: 'swap', // Add font-display swap
  preload: true, // Preload primary font
});

const museoModerno = MuseoModerno({
  variable: "--font-museo-moderno",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Reduced weight variants
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'], // Add fallbacks
});

const maitree = Maitree({
  variable: "--font-maitree",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"], // Reduced weight variants
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Free Fortune Tell - Get Your Personalized Reading",
  description: "Discover your future with our free personalized fortune telling. Get lucky numbers and predictions for relationships, work, and health.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} ${museoModerno.variable} ${maitree.variable} font-kanit antialiased`}
      >
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
