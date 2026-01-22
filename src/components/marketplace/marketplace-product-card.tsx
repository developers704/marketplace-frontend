'use client';

import cn from 'classnames';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { productPlaceholder } from '@assets/placeholders';
import { useRouter } from 'next/navigation';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import InventoryStatusBadge from './inventory-status-badge';

const buildImageUrl = (baseApi: string | undefined, src: string | undefined) => {
  if (!src) return productPlaceholder;
  const s = String(src).trim();
  if (!s) return productPlaceholder;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (!baseApi) return s.startsWith('/') ? s : `/${s}`;
  if (s.startsWith('/')) return `${baseApi}${s}`;
  return `${baseApi}/${s}`;
};

export default function MarketplaceProductCard({
  lang,
  product,
  className,
}: {
  lang: string;
  product: VendorProductListItem;
  className?: string;
}) {
  const router = useRouter();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
// console.log('product in card', product);
  const title = product?.title || "-";
  const brand = product?.brand || '';
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

  return (
    <article
      className={cn(
        'bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer h-full flex flex-col',
        className,
      )}
      onClick={() => product?._id && router.push(`/${lang}/marketplace/${product._id}`)}
      title={title}
    >
      <div className="relative">
        <div className="relative w-full aspect-square bg-gray-50">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
        <div className="absolute top-3 right-2">
          <InventoryStatusBadge quantity={totalQty} />
        </div>
       
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm font-bold text-gray-900 line-clamp-2">{title}</div>
        <div className="mt-3 flex items-center justify-between">
        {brand ? <div className="text-xs text-gray-500 mt-1">Brand: {brand}</div> : null}
         <div className="">
          <span className="text-xs text-gray-500 mt-1">
            Qty: {totalQty}
          </span>
        </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-brand-dark">
            {minAmount === maxAmount ? minPrice : `${minPrice} - ${maxPrice}`}
          </div>
          <div className="text-xs text-gray-500">{product?.skuCount ?? 0} SKUs</div>
        </div>
      </div>
    </article>
  );
}


