import DownloadApps from '@components/common/download-apps';
import { Metadata } from 'next';
import CartPageContent from './cart-page-content';

export const metadata: Metadata = {
  title: 'Your Cart',
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
      <CartPageContent lang={lang} />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}
