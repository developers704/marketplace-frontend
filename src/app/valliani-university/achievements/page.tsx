import { Metadata } from 'next';
import AchievementPageContent from './AchievementPageContent';

export const metadata: Metadata = {
  title: 'Achievements',
};

export default function Page() {
  return (
    <>
      <AchievementPageContent />
      {/* <DownloadApps lang={lang} /> */}
    </>
  );
}
