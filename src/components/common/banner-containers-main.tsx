'use client';

import BannerHeroGrid from '@components/common/banner-hero-grid';
import { useBannersQuery } from '@/framework/basic-rest/banners/main';
import ProductCardLoader from '../ui/loaders/product-card-loader';

interface BannerContainerProps {
  lang: string;
}

export default function BannerContainer({ lang }: BannerContainerProps) {
  const { data: bannerData, isLoading } = useBannersQuery();

  console.log('data of banners', bannerData);
  const transformedBanners = bannerData?.desktop?.map((banner, index) => ({
    id: banner._id,
    type: 'medium',
    image: {
      mobile: {
        url: bannerData?.mobile?.[index]?.imageUrl || banner.imageUrl,
        width: 450,
        height: 465, // Adjusted height for smaller screen images
      },
      desktop: {
        url: banner.imageUrl,
        width: 1190,
        height: 300, // Reduced height for large screen images
      },
    },
  }));

  if (isLoading) {
    return (
      <div className="h-[200px] sm:h-[250px] md:h-[280px] lg:h-[300px] max-w-[1920px] mx-auto">
        <ProductCardLoader uniqueKey="banner-loader" />
      </div>
    );
  }

  return (
    <BannerHeroGrid
      data={transformedBanners}
      className="my-3 md:my-4 lg:mt-0 lg:mb-5 xl:mb-6"
      lang={lang}
    />
  );
}
