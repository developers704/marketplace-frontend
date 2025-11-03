'use client';

import { useBannersMiddleQuery } from '@/framework/basic-rest/banners/middle';
import BundleGrid from '../bundle/bundle-grid-two';

interface BannerContainerProps {
  lang: string;
}

const customBanners = [
  {
    id: '1',
    slug: 'special-offer-1',
    image: '/assets/images/banner/discount/offer_1.png',
    title: 'Special Offer 1',
  },
  {
    id: '2',
    slug: 'special-offer-2',
    image: '/assets/images/banner/discount/offer_2.png',
    title: 'Special Offer 2',
  }
];


export default function BannerMiddleContainer({ lang }: BannerContainerProps) {
  const { data: bannerData, isLoading } = useBannersMiddleQuery();
  console.log('bannerData to check in middle ', bannerData);

  const transformedBanners = bannerData?.map((banner) => ({
    id: banner._id,
    slug: 'default-slug',
    image: banner.imageUrl,
    title: 'bundle-title',
  }));

  if (isLoading) return <div>Loading...</div>;

  return (
    <BundleGrid
      className="mb-12 lg:mb-14 xl:mb-16 2xl:mb-20"
      data={customBanners}
      lang={lang}
    />
  );
}
