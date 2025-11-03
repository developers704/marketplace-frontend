import { Metadata } from 'next';
import PackagingPageContent from './packaging-page-content';

export const metadata: Metadata = {
  title: 'GWP',
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
      <PackagingPageContent lang={lang} />
    </>
  );
}
