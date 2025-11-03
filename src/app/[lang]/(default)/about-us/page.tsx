import DownloadApps from '@components/common/download-apps';
import { Metadata } from 'next';
import AboutPageContent from './about-page-content';

export const metadata: Metadata = {
  title: 'About Us',
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
      <AboutPageContent lang={lang} />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}
