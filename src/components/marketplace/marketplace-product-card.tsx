'use client';

import cn from 'classnames';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { productPlaceholder } from '@assets/placeholders';
import { useRouter } from 'next/navigation';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

const buildImageUrl = (baseApi: string | undefined, src: string | undefined) => {
  if (!src) return productPlaceholder;
  const s = String(src).trim();
  if (!s) return productPlaceholder;
  if (s.startsWith('http')) return s;
  if (!baseApi) return s.startsWith('/') ? s : `/${s}`;
  if (s.startsWith('/')) return `${baseApi}${s}`;
  return `${baseApi}/${s}`;
};

export default function MarketplaceProductCard({
  lang,
  product,
  className,
  returnUrl,
}: {
  lang: string;
  product: VendorProductListItem;
  className?: string;
  returnUrl?: string;
}) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const sortParam = searchParams.get('sort');
  const filterMainParam = searchParams.get('filterMain');
  const filterOwnParam = searchParams.get('filterOwn');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const title = product?.title || "-";
  const brand = product?.brand || '';
  const vendorLabel = (product?.vendorModelKey || product?.vendorModel || '').trim();
  const totalQty = product?.totalInventory ?? 0;

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

  const productHref = product?._id
    ? `/${lang}/marketplace/${product._id}${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`
    : '#';

const handleClick = () => {
  if (!product?._id) return;

  const currentUrl = new URL(window.location.href);
  const sortParam = currentUrl.searchParams.get('sort');

  const params = new URLSearchParams();

  if (sortParam === 'isMain' || filterMainParam === 'true') {
    params.set('filterMain', 'true');
  }
  if (sortParam === 'own-inventory' || filterOwnParam === 'true') {
    params.set('filterOwn', 'true');
  }

  if (returnUrl) {
    params.set('returnUrl', returnUrl);
  }

  const queryString = params.toString();

  const url = `/${lang}/marketplace/${product._id}${queryString ? `?${queryString}` : ''}`;

  router.push(url);
};

  const inStock = totalQty > 0;

  return (
    <article
      onClick={handleClick}
      className={cn(
        `
        group relative flex flex-col h-full cursor-pointer
        rounded-2xl border border-neutral-200 bg-white
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        `,
        className
      )}
    >

      {/* Hover glow overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-brand/10 via-transparent to-black/5 pointer-events-none" />

      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl bg-neutral-100">

        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Stock badge NEW */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition duration-300">
          <div className={cn(
            "flex items-center  gap-1 px-2 py-1 rounded-full text-xs  backdrop-blur-md border shadow-sm transition",
            inStock
              ? " text-black "
              : "bg-red-500/90 text-white border-red-400"
          )}>
            {inStock ? <FaCheckCircle /> : <FaTimesCircle />}
            {inStock ? "In Stock" : "Out"}
          </div>

        </div>
       
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2 ">
        {/* Title with hover color change */}
        <div className=" text-xs font-bold  text-neutral-900 line-clamp-2 tracking-tight group-hover:text-brand transition-colors duration-300">{title}</div>
        {vendorLabel ? (
          <div className="text-[11px] font-medium text-neutral-600 truncate" title={vendorLabel}>
            {vendorLabel}
          </div>
        ) : null}
        <div className=" flex items-center  justify-between ">
        
        {brand && (<div className="text-xs text-gary-900 font-medium tracking-wide uppercase">{brand}</div>)}
         <div className="">
          <span className="text-xs text-gray-500 mt-1">
            Qty: {totalQty || "-"}
          </span>
        </div>
        </div>
        <div className="mt-auto flex items-center justify-between ">
          <div className="text-sm font-semibold tracking-tight text-neutral-900 group-hover:text-brand transition-colors">
            {minAmount === maxAmount ? minPrice : `${minPrice} - ${maxPrice}`}
          </div>
          <div className="text-sm text-gray-500">{product?.skuCount ?? 0} SKUs</div>
        </div>
      </div>
    </article>
  );
}
