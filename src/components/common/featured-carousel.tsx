'use client';

import FeaturedCard from '@components/cards/featured-card-two';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from '@components/ui/carousel/slider';
import Heading from '../ui/heading';
import Image from 'next/image';

const data = [
  {
    id: 1,
    icon: "/assets/images/3pl/categories/Untitled-1-01.png",
    title: 'Diamond Collection',

  },
  {
    id: 2,
    icon: "/assets/images/3pl/categories/Untitled-1-05.png",
    title: 'Birthstone Jewelry',
  },
  {
    id: 3,
    icon: "/assets/images/3pl/categories/Untitled-1-04.png",
    title: 'Gold Collection',
  },
  {
    id: 4,
    icon: '/assets/images/3pl/categories/Untitled-1-02.png',
    title: 'Silver Artistry',
  },
  {
    id: 5,
    icon: '/assets/images/3pl/categories/Untitled-1-06.png',
    title: 'Tungsten Collection',
  },
  {
    id: 6,
    icon: '/assets/images/3pl/categories/Untitled-1-03.png',
    title: 'Luxury Watches',
  },
];

interface Props {
  lang: string;
  className?: string;
}

const breakpoints = {
  '1400': {
    slidesPerView: 4,
    spaceBetween: 24,
  },
  '1024': {
    slidesPerView: 3,
    spaceBetween: 16,
  },
  '768': {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  '640 ': {
    slidesPerView: 2,
    spaceBetween: 12,
  },
  '0': {
    slidesPerView: 1,
  },
};

const CategoryItem = ({ item }: { item: typeof data[0] }) => (
  <div className="flex flex-col items-center group cursor-pointer ">
    <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center bg-[#FDF1E3] mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#373535] translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0" />
      <Image
        src={item.icon}
        alt={item.title}
        width={120}
        height={120}
        className="object-contain transform scale-75 xl:scale-90 3xl:scale-100 relative z-10 transition-transform duration-500 group-hover:scale-95"
      />
    </div>
    <h3 className="text-base w-[100px] text-center text-brand-dark transition-colors duration-300 group-hover:text-brand-button-hover">
      {item.title}
    </h3>
  </div>
);


const FeatureCarousel: React.FC<Props> = ({
  lang,
  className = 'mb-12 md:mb-14 xl:mb-[74px]',
}) => {
  return (
    <div className="container mx-auto md:mb-16">
      {/* Add this new title section */}
      <div className="text-center mb-8 md:my-12">
        <div className="group inline-block">
          <Heading variant="heading" className="mb-4 -mt-1.5 3xl:text-[25px] 3xl:leading-9 hover:cursor-pointer">
            Discover Our Collections
          </Heading>
          <div className="h-1 bg-brand-underline_color w-[40px] mx-auto transition-all duration-300 ease-in-out group-hover:w-full"></div>
        </div>
      </div>

      {/* update carousel code */}
      {/* <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-2  max-w-[1000px] mx-auto">
        {data?.map((item) => (
          <CategoryItem key={`category-${item.id}`} item={item} />
        ))}
      </div> */}

      {/* Mobile Carousel View */}
      {/* <div className={`md:hidden ${className}`}>
        <Carousel
          autoplay={true}
          breakpoints={{
            '0': {
              slidesPerView: 1,
            },
            '480': {
              slidesPerView: 2,
            },
            '640': {
              slidesPerView: 3,
            }
          }}
          prevActivateId="featured-carousel-button-prev"
          nextActivateId="featured-carousel-button-next"
          lang={lang}
        >
          {data?.map((item) => (
            <SwiperSlide key={`featured-key-${item.id}`}>
              <CategoryItem item={item} />
            </SwiperSlide>
          ))}
        </Carousel>
      </div> */}
    </div>
  );
};

export default FeatureCarousel;
