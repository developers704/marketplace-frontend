'use client';

import { useSessionStorage } from 'react-use';
// import Link from '@components/ui/link';
import HighlightedBar from '@components/common/highlighted-bar';
// import { IoChevronForwardCircleOutline } from 'react-icons/io5';
import Header from '@layouts/elegant/header';
// import Footer from '@layouts/footer/footer';
import MobileNavigation from '@layouts/mobile-navigation/mobile-navigation';
import { useIsMounted } from '@utils/use-is-mounted';
import { useTranslation } from 'src/app/i18n/client';
import NewFooter from '../footer/new-footer';
import { usePathname } from 'next/navigation';
import PermissionRouteGuard from '@/components/auth/permission-route-guard';

function ClientRenderedHightLightedBar({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, 'common');
  const [highlightedBar, setHighlightedBar] = useSessionStorage(
    'borobazar-highlightedBar',
    'false',
  );
  return (
    <>
      <HighlightedBar variant="luxury">
        <div className="text-center text-sm font-medium">
          {'Special Collection - Free Shipping On All Orders'}
        </div>
      </HighlightedBar>
    </>
  );
}

export default function ElegantLayout({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const isMounted = useIsMounted();
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/signin');

  return (
    <div className="flex flex-col min-h-screen">
      <PermissionRouteGuard lang={lang} />
      {/* Fixed header at top of viewport */}
      {!isAuthPage && <Header lang={lang} />}
      {/* Page scroll on body; main has no overflow so sticky works relative to viewport */}
      <main
        className="relative flex-grow "
      >
        {children}
      </main>
      {/* <Footer lang={lang} /> */}
      {!isAuthPage && <NewFooter lang={lang} />}
      {!isAuthPage && <MobileNavigation lang={lang} />}
    </div>
  );
}
