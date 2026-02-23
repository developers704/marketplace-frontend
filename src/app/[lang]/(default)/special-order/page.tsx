import { Metadata } from 'next';
import SpecialOrderPageContent from './special-order-page-content';

export const metadata: Metadata = {
  title: 'Special Order',
};

export default async function Page({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <SpecialOrderPageContent lang={lang} />;
}
