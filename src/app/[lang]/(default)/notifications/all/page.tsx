import { Metadata } from 'next';
import NotificationsPageContent from './notificationsPageContent';

export const metadata: Metadata = {
  title: 'Notifications',
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
      <NotificationsPageContent lang={lang} />
    </>
  );
}
