import { Metadata } from 'next';
import SheetsPageContent from './sheets-page-content';

export const metadata: Metadata = {
  title: 'PNL Reports',
};

export default function Page({
  params: { lang },
}: {
  params: { lang: string };
}) {
  return <SheetsPageContent lang={lang} />;
}
