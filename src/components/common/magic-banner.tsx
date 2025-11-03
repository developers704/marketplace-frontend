import Image from 'next/image';
import { useTranslation } from 'src/app/i18n/client';
// import gift_image from '@assets/images/banner/Magic_banner.jpg';
interface BannerProps {
    lang: string;
}

const BannerMagicContainer = ({ lang }: { lang: any }) => {
    return (
        <div className="mb-12 lg:mb-14 xl:mb-16 px-2.5 grid grid-cols-1">
            <div className="mx-auto relative">
                <Image
                    src="/assets/images/banner/Magic_Banner.jpg"
                    alt={'gift-banner'}
                    width={1800}
                    height={570}
                    priority
                    quality={100}
                    className="rounded-md object-cover"
                />
            </div>
        </div>
    );
};
export default BannerMagicContainer;
