import { Metadata } from 'next';
import MarketingPageContent from './marketing-page-content';

export const metadata: Metadata = {
  title: 'Marketing',
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
      <MarketingPageContent lang={lang} />
    </>
  );
}
