import { Metadata } from 'next';
import ItemListPageContent from './item-list-page-content';

export const metadata: Metadata = {
  title: 'Products',
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
      <ItemListPageContent lang={lang} />
    </>
  );
}
