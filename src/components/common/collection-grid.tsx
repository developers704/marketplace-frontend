'use client';

import CollectionCard from '@components/cards/collection-card';
import SectionHeader from '@components/common/section-header';
import Container from '@components/ui/container';
import useWindowSize from '@utils/use-window-size';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from '@components/ui/carousel/slider';
import { ROUTES } from '@utils/routes';
import Image from 'next/image';

const data = [
  {
    id: 1,
    slug: 'feel-the-thirsty-in-summer-anytime',
    image: '/assets/images/collection/1.jpg',
    title: 'Eternal grace, captured in diamonds.',
    description:
      'Satisfy your savory cravings with our range of chips, crackers, and nuts.',
  },
  {
    id: 2,
    slug: 'most-popular-item-for-Fast-food',
    image: '/assets/images/collection/2.jpg',
    title: 'Shimmering elegance for every occasion',
    description:
      'Discover a diverse selection of meals, snacks, and ingredients that cater to every taste and dietary preference.',
  },
  {
    id: 3,
    slug: 'authentic-japanese-food-in-real-taste',
    image: '/assets/images/collection/3.jpg',
    title: 'Pure radiance, crafted for eternity',
    description:
      'Stay hydrated with our delicious and refreshing juice options, perfect for any time of day.',
  },
  {
    id: 4,
    slug: 'explore-our-family-of-freshest®-foods',
    image: '/assets/images/collection/4.jpg',
    title: 'Unveiling the sparkle of forever',
    description: 'collection-description-four',
  },
  {
    id: 5,
    slug: 'explore-our-family-of-freshest®-foods',
    image: '/assets/images/collection/6.jpg',
    title: 'Your perfect pair, timelessly radiant.',
    description: 'collection-description-four',
  },
  {
    id: 6,
    slug: 'explore-our-family-of-freshest®-foods',
    image: '/assets/images/collection/6.jpg',
    title: 'Your perfect pair, timelessly radiant.',
    description: 'collection-description-four',
  },
];

interface Props {
  lang: string;
  className?: string;
  headingPosition?: 'left' | 'center';
}

const breakpoints = {
  '1024': {
    slidesPerView: 3,
  },
  '768': {
    slidesPerView: 3,
  },
  '540': {
    slidesPerView: 2,
  },
  '0': {
    slidesPerView: 1,
  },
};

const CollectionGrid: React.FC<Props> = ({
  className = 'mb-12 lg:mb-14 xl:mb-16 2xl:mb-20 pb-1 lg:pb-0 3xl:pb-2.5',
  headingPosition = 'left',
  lang,
}) => {
  const { width } = useWindowSize();
  return (
    <div className={className}>
      <Container>
        {/* <SectionHeader
          sectionHeading="On Sale"
          // sectionSubHeading="text-categories-grocery-items"
          headingPosition={headingPosition}
          lang={lang}
        /> */}
        {width! < 1536 ? (
          <Carousel
            breakpoints={breakpoints}
            autoplay={false}
            prevButtonClassName="ltr:-left-2.5 rtl:-right-2.5"
            nextButtonClassName="ltr:-right-2.5 rtl:-left-2.5"
            className="-mx-1.5 md:-mx-2 xl:-mx-2.5 -my-4"
            prevActivateId="collection-carousel-button-prev"
            nextActivateId="collection-carousel-button-next"
            lang={lang}
          >
            {data?.map((item, index) => (
              <SwiperSlide
                key={`collection-key-${item}`}
                className="px-1.5 md:px-2 xl:px-2.5 py-4 w-fit"
              >
                <div className='shadow-md !w-fit'>
                  <Image
                    src={`/assets/images/products/item1.png`}
                    alt="Profile"
                    className=""
                    width={150}
                    height={150}
                    objectFit="contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Carousel>
        ) : (
          <div className="gap-5 2xl:grid 2xl:grid-cols-4 3xl:gap-7">
            {data?.map((item, index) => (
              <CollectionCard
                key={item.id}
                collection={item}
                href={`${ROUTES.BUNDLE}/${item.slug}`}
                lang={lang}
                cardIndex={index}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default CollectionGrid;
