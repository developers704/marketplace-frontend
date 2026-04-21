import type { Metadata } from 'next';
import NewlyAddedPageContent from './newly-added-page-content';

export const metadata: Metadata = {
  title: 'Newly Added Inventory',
};

export default function Page({ params: { lang } }: { params: { lang: string } }) {
  return <NewlyAddedPageContent lang={lang} />;
}
