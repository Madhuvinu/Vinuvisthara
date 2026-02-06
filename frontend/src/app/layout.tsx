import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { SidePanelProvider } from '@/hooks/useSidePanel';
import { HeaderColorProvider } from '@/contexts/HeaderColorContext';
import Header from '@/components/Header';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';

// PWA Service Worker Registration
function ServiceWorkerRegistration() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
        return;
      }

      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('SW registered: ', registration);
          }
        })
        .catch((registrationError) => {
          // Only log errors in production for debugging
          if (process.env.NODE_ENV === 'development') {
            console.error('SW registration failed: ', registrationError);
          }
        });
    });
  }
  return null;
}

export const metadata: Metadata = {
  title: 'Vinuvisthara - Premium Sarees',
  description: 'Traditional Indian Saree E-Commerce Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vinuvisthara',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1f2937',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-white min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <LoadingScreen />
        <ServiceWorkerRegistration />
        <HeaderColorProvider>
          <SidePanelProvider>
            <Header />
            <SidePanel />
            <main className="pt-0 mt-0">
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
