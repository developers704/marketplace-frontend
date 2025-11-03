'use client';

import ProductCardLoader from '../ui/loaders/product-card-loader';
import BannerGridTwo from './banner-grid-two';
import { useBannersLoyalQuery } from '@/framework/basic-rest/banners/loyal';

interface BannerContainerProps {
  lang: string;
}

export default function BannerLoyalContainer({ lang }: BannerContainerProps) {
  const { data: bannerData, isLoading } = useBannersLoyalQuery();

  const transformedBanners = bannerData?.map((banner) => ({
    id: banner._id,
    slug: 'default-slug',
    image: banner.imageUrl,
    title: 'bundle-title',
  }));

  if (isLoading) {
    return (
      <div className="h-[200px] sm:h-[250px] md:h-[280px] lg:h-[300px] max-w-[1920px] mx-auto">
        <ProductCardLoader uniqueKey="loyal-banner-loader" />
      </div>
    );
  }

  return (
    <BannerGridTwo
      data={transformedBanners}
      className="mb-12 lg:mb-14 xl:mb-16 2xl:mb-20"
      lang={lang}
    />
  );
}
