import { Metadata } from 'next';
import AboutUsPageContent from './AboutUsPageContent';

export const metadata: Metadata = {
  title: 'About Us',
};

export default function Page() {
  return (
    <>
      <AboutUsPageContent />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}
