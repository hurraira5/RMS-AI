import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/components/features/FirebaseProvider';
import { CartProvider } from '@/components/features/CartProvider';
import ErrorBoundary from '@/components/features/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Fuse Food Delivery',
  description: 'Premium fast-food ordering and delivery platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        <ErrorBoundary>
          <FirebaseProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
