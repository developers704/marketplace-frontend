'use client';

import Heading from '@components/ui/heading';
import Image from '@components/ui/image';
import Link from '@components/ui/link';
import { LinkProps } from 'next/link';
import Text from '@components/ui/text';

import { collectionPlaceholder } from '@assets/placeholders';
import { useTranslation } from 'src/app/i18n/client';

interface Props {
  imgWidth?: number | string;
  imgHeight?: number | string;
  href?: LinkProps['href'];
  lang: string;
  cardIndex: number;
  collection: {
    image: string;
    title: string;
    description?: string;
  };
}

const CollectionCard: React.FC<Props> = ({
  collection,
  imgWidth = 440,
  imgHeight = 280,
  cardIndex,
  href,
  lang,
}) => {
  const { image, title, description } = collection;
  const { t } = useTranslation(lang, 'common');
  const borderColor = (() => {
    switch (cardIndex) {
      case 0:
        return 'border-green-300';
      case 1:
        return 'border-blue-300';
      case 2:
        return 'border-yellow-300';
      case 3:
        return 'border-red-300';
      default:
        return 'border-black';
    }
  })();
  return (
    <Link
      href={`/${lang}${href}`}
      className={`flex flex-col overflow-hidden rounded-t-md group shadow-card border-b-2 ${borderColor}`}
    >
      <Image
        src={image ?? collectionPlaceholder}
        alt={t(title) || t('text-card-thumbnail')}
        width={imgWidth as number}
        height={imgHeight as number}
        style={{ width: 'auto' }}
        className="object-cover transition duration-300 ease-in-out transform bg-fill-thumbnail group-hover:opacity-90 group-hover:scale-105"
      />
      <div className="flex flex-col px-4 pt-4 pb-4 lg:px-5 xl:px-6 lg:pt-5 md:pb-5 lg:pb-6 xl:pb-7">
        <Heading
          variant="title"
          className="mb-1 lg:mb-1.5 truncate transition-colors group-hover:text-brand-button-hover"
        >
          {t(title)}
        </Heading>
        {/* <Text
          variant="medium"
          className="text-center h-20 md:h-20 line-clamp-3"
        > */}
        {/* {t(`${description}`)}
        </Text> */}
      </div>
    </Link>
  );
};

export default CollectionCard;
