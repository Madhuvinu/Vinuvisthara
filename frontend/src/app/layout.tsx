import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { SidePanelProvider } from '@/hooks/useSidePanel';
import { HeaderColorProvider } from '@/contexts/HeaderColorContext';
import Header from '@/components/Header';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Vinuvisthara - Premium Sarees',
  description: 'Traditional Indian Saree E-Commerce Platform',
  manifest: '/manifest.json',
  themeColor: '#1f2937',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vinuvisthara',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vinuvisthara" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <HeaderColorProvider>
          <SidePanelProvider>
            <Header />
            <SidePanel />
            <main className="pt-20">
              {children}
            </main>
            <Footer />
          </SidePanelProvider>
        </HeaderColorProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
