'use client';

import BundleCardGrid from '@components/cards/bundle-card-grid';
import useWindowSize from '@utils/use-window-size';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from '@components/ui/carousel/slider';
import { ROUTES } from '@utils/routes';

interface BannerProps {
  lang: string;
  data: any;
  className?: string;
}

const BannerGridTwo: React.FC<BannerProps> = ({
  lang,
  data,
  className = 'mb-3 md:mb-4 lg:mb-5 xl:mb-6',
}) => {
  const { width } = useWindowSize();
  const breakpoints = {
    '1536': {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    '1024': {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    '768': {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    '680': {
      slidesPerView: 2,
      spaceBetween: 12,
    },
    '0': {
      slidesPerView: 1,
    },
  };

  return (
    <div className={className}>
      <Carousel
        breakpoints={breakpoints}
        prevActivateId="banner-carousel-button-prev"
        nextActivateId="banner-carousel-button-next"
        lang={lang}
      >
        {data?.map((banner: any) => (
          <SwiperSlide key={`banner-key-${banner.id}`}>
            <BundleCardGrid
              bundle={banner}
              href={`${ROUTES.BUNDLE}/${banner.slug}`}
              lang={lang}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerGridTwo;
