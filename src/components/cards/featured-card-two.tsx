import Heading from '@components/ui/heading';
import cn from 'classnames';
import { useTranslation } from 'src/app/i18n/client';
import Text from '@components/ui/text';

interface ItemProps {
  icon: JSX.Element;
  title: string;
  description: string;
  bgColor?: string;
  hoverBgColor?: string;
}

interface Props {
  lang: string;
  className?: string;
  item: ItemProps;
}

const FeaturedCard: React.FC<Props> = ({ lang, item, className }) => {
  const { t } = useTranslation(lang, 'common');
  const { icon, title, description, bgColor = 'bg-[#F4F2EB]', hoverBgColor = 'hover:bg-brand' } = item;

  return (
    <div
      className={cn(
        'group p-5 md:px-6 xl:px-7 3xl:px-9 flex items-center justify-between',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
        'hover:-translate-y-1',
        'cursor-pointer',
        bgColor,
        hoverBgColor,
        className
      )}
    >
      <div className="ltr:pr-4 rtl:pl-4 md:ltr:pr-5 md:rtl:pl-5 lg:ltr:pr-4 lg:rtl:pl-4 3xl:ltr:pr-10 3xl:rtl:pl-10">
        <Heading
          variant="title"
          className="mb-1.5 -mt-0.5 text-brand-dark  transition-colors duration-300"
        >
          {t(title)}
        </Heading>
        <Text className="text-brand-dark text-opacity-70  group-hover:text-opacity-90 transition-colors duration-300">
          {t(description)}
        </Text>
      </div>
      <div className="flex shrink-0 items-center justify-center bg-white rounded-full w-[80px] xl:w-24 3xl:w-[110px] h-[80px] xl:h-24 3xl:h-[110px] shadow-sm transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
    </div>
  );
};

export default FeaturedCard;
