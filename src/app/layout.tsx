import type { Metadata } from "next";
import { Kanit, MuseoModerno, Maitree } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/sonner';

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
        {children}
        <Toaster />

        {/* Google Analytics 4 Integration */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* Vercel Speed Insights - Free tier, production only */}
        {process.env.NODE_ENV === 'production' && <SpeedInsights />}
        
        {/* Vercel Analytics - Free tier, production only */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        
      </body>
    </html>
  );
}
