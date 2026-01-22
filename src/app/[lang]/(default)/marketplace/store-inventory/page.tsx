import type { Metadata } from 'next';
import StoreInventoryPageContent from './store-inventory-page-content';

export const metadata: Metadata = {
  title: 'My Store Inventory',
};

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return <StoreInventoryPageContent lang={lang} />;
}


