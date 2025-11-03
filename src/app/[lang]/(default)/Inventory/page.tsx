import { Metadata } from 'next';
import InventoryPageContent from './inventory-page-content';

export const metadata: Metadata = {
  title: 'Inventory',
};

export default async function Page({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  return (
    <>
      <InventoryPageContent lang={lang} />
    </>
  );
}
