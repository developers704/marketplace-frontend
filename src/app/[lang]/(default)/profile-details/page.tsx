import { Metadata } from 'next';
import ProfileDetailContent from './profile-detail-content';

export const metadata: Metadata = {
  title: 'Profile Detail',
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
      <ProfileDetailContent lang={lang} />
    </>
  );
}
