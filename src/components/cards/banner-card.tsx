'use client';

import Link from '@components/ui/link';
import Image from 'next/image';
import useWindowSize from '@utils/use-window-size';
import cn from 'classnames';

interface BannerProps {
  lang: string;
  banner: any;
  variant?: 'rounded' | 'default';
  effectActive?: boolean;
  className?: string;
  classNameInner?: string;
}

function getImage(deviceWidth: number, imgObj: any) {
  return deviceWidth < 480 ? imgObj.mobile : imgObj.desktop; // Adjust for mobile size < 768px
}

const BannerCard: React.FC<BannerProps> = ({
  lang,
  banner,
  className,
  variant = 'default',
  effectActive = true,
  classNameInner,
}) => {
  const { width }: any = useWindowSize();
  const { slug, title, image } = banner;
  const selectedImage = getImage(width!, image);
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  return (
    <></>
    // <div className={cn('mx-auto', className)}>
    //   <Link
    //     href={`/`}
    //     className={cn(
    //       'h-full group flex justify-center relative overflow-hidden',
    //       'md:h-[300px] xl:h-[450px]',
    //       classNameInner,
    //     )}
    //   >
    //     <Image
    //       src={`${BASE_API}${selectedImage.url}`}
    //       // src={`${selectedImage.url}`}
    //       width={selectedImage.width}
    //       height={selectedImage.height}
    //       alt={'banner-image'}
    //       quality={100}
    //       priority
    //       className={cn('bg-fill-thumbnail object-cover w-full', {
    //         'rounded-md': variant === 'rounded',
    //       })}
    //     />
    //     {effectActive && (
    //       <div className="absolute top-0 block w-1/2 h-full transform -skew-x-12 ltr:-left-full rtl:-right-full z-5 bg-gradient-to-r from-transparent to-white opacity-30 group-hover:animate-shine" />
    //     )}
    //   </Link>
    // </div>
  );
};

export default BannerCard;
