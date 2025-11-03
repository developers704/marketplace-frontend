import DownloadApps from '@components/common/download-apps';
import { Metadata } from 'next';
import ToolsPageContent from './tool-page-content';

export const metadata: Metadata = {
  title: 'Tool Finding',
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
      <ToolsPageContent lang={lang} />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}
