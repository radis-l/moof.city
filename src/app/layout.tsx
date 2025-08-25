import type { Metadata } from "next";
import { Kanit, MuseoModerno, Work_Sans } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const museoModerno = MuseoModerno({
  variable: "--font-museo-moderno",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${kanit.variable} ${museoModerno.variable} ${workSans.variable} font-kanit antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
