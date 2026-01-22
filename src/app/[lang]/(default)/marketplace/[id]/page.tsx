import type { Metadata } from 'next';
import MarketplaceDetailPageContent from './marketplace-detail-page-content';

export const metadata: Metadata = {
  title: 'Marketplace Product',
};

export default function Page({
  params: { lang, id },
}: {
  params: { lang: string; id: string };
}) {
  return <MarketplaceDetailPageContent lang={lang} vendorProductId={id} />;
}


