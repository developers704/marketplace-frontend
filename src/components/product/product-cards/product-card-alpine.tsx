import cn from 'classnames';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { Product } from '@framework/types';
import { useModalAction } from '@components/common/modal/modal.context';
import useWindowSize from '@utils/use-window-size';
import { Eye } from '@components/icons/eye-icon';
import { useCart } from '@contexts/cart/cart.context';
import { IoMdAdd } from 'react-icons/io'; // Import the plus icon

import { productPlaceholder } from '@assets/placeholders';
import dynamic from 'next/dynamic';
import { useTranslation } from 'src/app/i18n/client';
const AddToCart = dynamic(() => import('@components/product/add-to-cart'), {
  ssr: false,
});

interface ProductProps {
  lang: string;
  product: Product;
  className?: string;
}
function RenderPopupOrAddToCart({ props }: { props: Object }) {
  let { data, lang }: any = props;
  // console.log(variant);
  const { t } = useTranslation(lang, 'common');
  const { id, quantity, product_type } = data ?? {};
  const { width } = useWindowSize();
  const { openModal } = useModalAction();
  const { isInCart, isInStock } = useCart();
  const iconSize = width! > 1024 ? '19' : '17';
  const outOfStock = isInCart(id) && !isInStock(id);
  function handlePopupView() {
    openModal('PRODUCT_VIEW', data);
  }
  if (Number(quantity) < 1 || outOfStock) {
    return (
      <span className="text-[11px] md:text-xs font-bold text-brand-light uppercase inline-block bg-brand-danger rounded-full px-2.5 pt-1 pb-[3px] mx-0.5 sm:mx-1">
        {t('text-out-stock')}
      </span>
    );
  }
  if (product_type === 'variable') {
    return (
      <button
        className="inline-flex items-center justify-center w-8 h-8 text-4xl rounded-full bg-brand-button-hover lg:w-10 lg:h-10 text-brand-light focus:outline-none focus-visible:outline-none" aria-label="Count Button"
        onClick={handlePopupView}
      >
        <IoMdAdd className="w-6 h-6 text-white" />
      </button>
    );
  }
  return <AddToCart data={data} variant="mercury" lang={lang} />;
}
const ProductCardAlpine: React.FC<ProductProps> = ({
  product,
  className,
  lang,
}) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const { name, image, unit, product_type } = product ?? {};
  const { openModal } = useModalAction();
  const { t } = useTranslation(lang, 'common');
  const { price, basePrice } = usePrice({
    amount: product?.discountedPrice?.amount ?? product?.price?.amount ?? 0,
    baseAmount: product?.originalPrice?.amount ?? 0,
    currencyCode: product?.price?.currency ?? 'USD',
  });

  const { price: minPrice } = usePrice({
    amount: product?.min_price ?? 0,
    currencyCode: product?.price?.currency ?? 'USD',
  });
  const { price: maxPrice } = usePrice({
    amount: product?.max_price ?? 0,
    currencyCode: product?.price?.currency ?? 'USD',
  });

  function handlePopupView() {
    openModal('PRODUCT_VIEW', product);
  }
  return (
    <article
      className={cn(
        'flex flex-col group overflow-hidden rounded-md cursor-pointer transition-all duration-300 shadow-card hover:shadow-xl hover:-translate-y-1 relative h-full bg-white',
        className,
      )}
      onClick={handlePopupView}
      title={name}
    >
      <div className="relative shrink-0">
        <div className="overflow-hidden mx-auto w-full sm:w-[180px] h-[180px] md:w-[200px] md:h-[200px] transition duration-200 ease-in-out transform group-hover:scale-105 relative">
          <Image
            src={image && typeof image !== 'string' && image.thumbnail ? image.thumbnail : productPlaceholder}
            alt={name || 'Product Image'}
            quality={100}
            priority
            fill
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            className="object-cover bg-fill-thumbnail"
          />
        </div>
        <div className="w-full h-full absolute top-0 pt-2.5 md:pt-3.5 px-3 md:px-4 lg:px-[18px] z-10 -mx-0.5 sm:-mx-1">
          {product?.discountedPrice && (
            <span className="text-[11px] md:text-xs font-bold text-white uppercase inline-block bg-purple-600 rounded-full px-2.5 pt-1 pb-[3px] mx-0.5 sm:mx-1 shadow-sm">
              {t('text-on-sale')}
            </span>
          )}
          <div className={`block product-count-button-position`}>
            <RenderPopupOrAddToCart props={{ data: product, lang: lang }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col px-3 md:px-4 lg:px-[18px] pb-5 lg:pb-6 lg:pt-1.5 h-full">
        {/* Price section with enhanced styling */}
        <div className="mb-1 lg:mb-1.5 -mx-1">
          <span className="inline-block mx-1 text-sm font-semibold sm:text-15px lg:text-base text-brand-dark">
            {product_type === 'variable' ? `${minPrice} - ${maxPrice}` : price}
          </span>
          {basePrice && (
            <del className="mx-1 text-sm text-gray-400">
              {basePrice}
            </del>
          )}
        </div>
        <h2 className="text-brand-dark text-13px sm:text-sm lg:text-15px leading-5 sm:leading-6 mb-1.5  transition duration-300 line-clamp-2">
          {name}
        </h2>
        <div className="mt-auto text-13px sm:text-sm text-gray-500">{`1 each`}</div>
      </div>
    </article>
  );
};
export default ProductCardAlpine;
