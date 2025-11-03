

// import DownloadApps from '@components/common/download-apps';
import { Metadata } from 'next';
import SuppliesPageContent from './supplies-page-content';

export const metadata: Metadata = {
  title: 'Supplies',
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
      <SuppliesPageContent lang={lang} />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}

