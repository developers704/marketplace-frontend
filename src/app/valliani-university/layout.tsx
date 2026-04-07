// import React from 'react';
import './globals.css';
import { Jost, Style_Script } from 'next/font/google';
import { Metadata } from 'next';
import ClientLayout from '@/layouts/university/UniversityLayout';
import Providers from '../provider/provider';
import { PermissionsProvider } from '@/contexts/permissionsContext';
import { ManagedUIContext } from '@/contexts/ui.context';
import ToasterProvider from '../provider/toaster-provider';
import 'react-toastify/dist/ReactToastify.css';
import useInactivityLogout from '@/utils/useInactivityLogout';
import PreventScreenCapture from '@/utils/PreventScreenShots';
// import RootClientLayout from '@/components/layouts/RootClientLayout';
// import { WishlistProvider } from '@/contexts/wishlistContext';
// import { ProfileProvider } from '@/contexts/profileContext';

export const metadata: Metadata = {
  title: 'Valliani University',
};
const jost = Jost({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-Jost',
});
const styleScript = Style_Script({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-Style_Script',
});
const UniversityLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    // <div className={jost.variable}>
    //   <ClientLayout>{children}</ClientLayout>
    // </div>
    <>
      {/* <RootClientLayout> */}
      <Providers>
        <PermissionsProvider>
          {/* <WishlistProvider> */}
          {/* <ProfileProvider> */}
          <ManagedUIContext>
            <div className={`${jost.variable} ${styleScript.variable}`}>
              <PreventScreenCapture />
              <ClientLayout>{children}</ClientLayout>
              {/* <ManagedModal lang={lang} />
                   <ManagedDrawer lang={lang} /> */}
              <ToasterProvider />
            </div>
          </ManagedUIContext>
          {/* </ProfileProvider> */}
          {/* </WishlistProvider> */}
        </PermissionsProvider>
      </Providers>
      {/* </RootClientLayout> */}
    </>
  );
};

export default UniversityLayout;
