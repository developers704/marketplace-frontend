'use client';

import cn from 'classnames';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { productPlaceholder } from '@assets/placeholders';
import { useRouter } from 'next/navigation';
import type { VendorProductListItem } from '@framework/types/catalogV2';

interface VendorProductCardProps {
  lang: string;
  product: VendorProductListItem;
  className?: string;
}

const slugify = (value: string) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildImageUrl = (baseApi: string | undefined, src: string | undefined) => {
  if (!src) return productPlaceholder;
  const s = String(src).trim();
  if (!s) return productPlaceholder;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (!baseApi) return s.startsWith('/') ? s : `/${s}`;
  if (s.startsWith('/')) return `${baseApi}${s}`;
  return `${baseApi}/${s}`;
};

const VendorProductCardAlpine: React.FC<VendorProductCardProps> = ({ product, className, lang }) => {
  const router = useRouter();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const title = product?.title || product?.vendorModel || 'Product';
  const vendorModel = product?.vendorModel || '';
  const skuCount = product?.skuCount ?? 0;
  const totalInventory = product?.totalInventory ?? 0;

  const defaultSkuPrice = Number(product?.defaultSku?.price ?? 0);
  const rawMin = Number(product?.minPrice ?? 0);
  const rawMax = Number(product?.maxPrice ?? 0);
  const minAmount = rawMin > 0 ? rawMin : defaultSkuPrice;
  const maxAmount = rawMax > 0 ? rawMax : defaultSkuPrice;
  const currencyCode = product?.defaultSku?.currency ?? 'USD';

  const { price: minPrice } = usePrice({ amount: minAmount, currencyCode });
  const { price: maxPrice } = usePrice({ amount: maxAmount, currencyCode });

  const defaultImage = product?.defaultSku?.images?.[0];
  const imageUrl = buildImageUrl(BASE_API, defaultImage);

  const slug = slugify(title || vendorModel || String(product?._id || 'product'));

  const openDetails = () => {
    if (!product?._id) return;
    const lng = String(lang || 'en');
    router.push(`/${lng}/products/${slug}?id=${product._id}&catalog=v2`);
  };

  return (
    <article
      className={cn(
        'flex flex-col group overflow-hidden rounded-md cursor-pointer transition-all duration-300 shadow-card hover:shadow-xl hover:-translate-y-1 relative h-full bg-white',
        className,
      )}
      onClick={openDetails}
      title={title}
    >
      <div className="relative shrink-0">
        <div className="overflow-hidden mx-auto w-full sm:w-[180px] h-[180px] md:w-[200px] md:h-[200px] transition duration-200 ease-in-out transform group-hover:scale-105 relative">
          <Image
            src={imageUrl}
            alt={title}
            quality={100}
            priority={false}
            fill
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            className="object-cover bg-fill-thumbnail"
          />
        </div>
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[11px] md:text-xs font-bold text-white uppercase inline-block bg-brand-blue rounded-full px-2.5 pt-1 pb-[3px] shadow-sm">
            Vendor Model
          </span>
        </div>
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[11px] md:text-xs font-semibold text-gray-700 inline-block bg-white/95 rounded-full px-2.5 pt-1 pb-[3px] shadow-sm border">
            Qty: {totalInventory}
          </span>
        </div>
      </div>

      <div className="flex flex-col px-3 md:px-4 lg:px-[18px] pb-5 lg:pb-6 lg:pt-2 h-full">
        <div className="mb-1.5 -mx-1">
          <span className="inline-block mx-1 text-sm font-semibold sm:text-15px lg:text-base text-brand-dark">
            {minAmount === maxAmount ? minPrice : `${minPrice} - ${maxPrice}`}
          </span>
        </div>
        <h2 className="text-brand-dark text-13px sm:text-sm lg:text-15px leading-5 sm:leading-6 mb-1 transition duration-300 line-clamp-2">
          {title}
        </h2>
        <div className="text-xs text-gray-500 line-clamp-1">{vendorModel ? `Model: ${vendorModel}` : ''}</div>
        <div className="mt-auto flex items-center justify-between text-xs text-gray-500 pt-2">
          <span>{skuCount} SKUs</span>
          <span className="text-brand-blue font-semibold">Select Options</span>
        </div>
      </div>
    </article>
  );
};

export default VendorProductCardAlpine;


