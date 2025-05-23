// In src/app/layout.tsx
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DNASEQ - DNA Analyzer',
  description: 'Nucleotide Frequency Analysis in DNA Sequences',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans relative min-h-screen`}>
        {/* Video background container */}
        <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-black">
          <video 
            className="w-full h-full object-cover opacity-70"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}