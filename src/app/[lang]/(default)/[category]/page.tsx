import { Metadata } from 'next';
import CategoryPageContent from './category-page-content';

export const metadata: Metadata = {
  title: 'Category',
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
      <CategoryPageContent lang={lang} />
    </>
  );
}
