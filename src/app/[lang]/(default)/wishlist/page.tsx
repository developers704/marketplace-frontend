import { Metadata } from 'next';
import WishlistPageContent from './wishlist-page-content';

export const metadata: Metadata = {
  title: 'Your Wishlist',
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
      <WishlistPageContent lang={lang} />
    </>
  );
}
