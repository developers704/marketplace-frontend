import Wishlist from '@components/my-account/wishlist';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist',
};

export default async function WishlistPage({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  return <Wishlist lang={lang} />;
}
