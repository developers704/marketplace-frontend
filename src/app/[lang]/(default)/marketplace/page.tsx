import type { Metadata } from 'next';
import MarketplacePageContent from './marketplace-page-content';

export const metadata: Metadata = {
  title: 'Marketplace',
};

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return <MarketplacePageContent lang={lang} />;
}


