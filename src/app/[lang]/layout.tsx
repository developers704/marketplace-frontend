// import ManagedModal from '@components/common/modal/managed-modal';
import { ManagedUIContext } from '@contexts/ui.context';
import { Inter, Manrope, Jost } from 'next/font/google';
import { dir } from 'i18next';
import { languages } from '../i18n/settings';
// import ManagedDrawer from '@components/common/drawer/managed-drawer';
import { Metadata } from 'next';
import ToasterProvider from 'src/app/provider/toaster-provider';
import Providers from 'src/app/provider/provider';

// external
import 'react-toastify/dist/ReactToastify.css';

// base css file
import '@assets/css/scrollbar.css';
import '@assets/css/swiper-carousel.css';
import '@assets/css/custom-plugins.css';
import './globals.css';
import '@assets/css/rc-drawer.css';
import ElegantLayout from '@layouts/elegant/layout';
import RootClientLayout from '@/components/layouts/RootClientLayout';
import { ProfileProvider } from '@/contexts/profileContext';
import { WishlistProvider } from '@/contexts/wishlistContext';
import { PermissionsProvider } from '@/contexts/permissionsContext';
import PreventScreenCapture from '@/utils/PreventScreenShots';

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
  title: 'Valliani',
};

export async function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <html lang={lang} dir={dir(lang)}>
      <body className={jost.variable}>
        <RootClientLayout>
          <Providers>
            <PermissionsProvider>
              <WishlistProvider>
                <ProfileProvider>
                  <ManagedUIContext>
                    <div className="w-full overflow-x-hidden">
                      <PreventScreenCapture />
                      <ElegantLayout lang={lang}>{children}</ElegantLayout>
                      {/* <ManagedModal lang={lang} />
                  <ManagedDrawer lang={lang} /> */}
                      <ToasterProvider />
                    </div>
                  </ManagedUIContext>
                </ProfileProvider>
              </WishlistProvider>
            </PermissionsProvider>
          </Providers>
        </RootClientLayout>
      </body>
    </html>
  );
}
