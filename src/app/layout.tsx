import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Corrected import, Geist_Mono is not needed for sans-serif only
import './globals.css';
import { AuthProvider } from '@/contexts/auth-provider';
import Navbar from '@/components/layout/navbar';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/layout/footer';

const geistSans = Geist({ // Use Geist directly
  variable: '--font-geist-sans', // Ensure this matches tailwind.config.ts if font-family is set there
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: "Bubba's Friend",
  description: 'Your emotional support journaling and conversation companion.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="antialiased font-sans">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );