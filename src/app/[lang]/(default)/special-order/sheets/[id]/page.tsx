import { Metadata } from 'next';
import SheetViewContent from './sheet-view-content';

export const metadata: Metadata = {
  title: 'PNL Report',
};

export default function Page({
  params: { lang, id },
}: {
  params: { lang: string; id: string };
}) {
  return <SheetViewContent lang={lang} id={id} />;
}
