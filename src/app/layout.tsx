import { Inter, Jost, Manrope } from 'next/font/google';
import { Metadata } from 'next';

import './[lang]/globals.css';
import Providers from './provider/provider';
import { ManagedUIContext } from '@/contexts/ui.context';

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jost = Jost({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-Jost',
});

const manrope = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Valliani Jewellery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jost.variable}>{children}</body>
    </html>
  );
}
