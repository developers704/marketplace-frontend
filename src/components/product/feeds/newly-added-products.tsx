'use client';
import React from 'react';
import Link from 'next/link';
import { useUI } from '@/contexts/ui.context';
import { useProductsQuery } from '@framework/product/get-all-products';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import MarketplaceProductCard from '@/components/marketplace/marketplace-product-card';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import cn from 'classnames';

const NewlyAddedProduct = ({ lang }: any) => {
  const { isAuthorized } = useUI();

  // Fetch newest products from v2Catalog (sorted by createdAt desc by default)
  const {
    data,
    isLoading,
    error,
  } = useProductsQuery({
    limit: 24, // Show 10 newest products
    newQuery: {},
  } as any);

  // Extract products from all pages
  const products: VendorProductListItem[] = React.useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page?.data || []).slice(0, 24);
  }, [data]);

  if (!isAuthorized) {
    return (
      <section className="my-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Newly Added Inventory</h1>
        </div>
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-lg text-gray-600">Please log in to view newly added inventory items</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newly Added Inventory</h1>
          <p className="text-sm text-gray-600 mt-1">
            Latest vendor-model listings added to the inventory
          </p>
        </div>
        {products.length > 0 && (
          <Link
            href={`/${lang}/marketplace`}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            View All →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div
          className={cn(
            'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-5',
          )}
        >
          {Array.from({ length: 24 }).map((_, idx) => (
            <ProductCardLoader key={`newly-added-loader-${idx}`} uniqueKey={`newly-added-loader-${idx}`} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600 font-semibold">Failed to load products</p>
          <p className="text-sm text-red-500 mt-1">{error?.message || 'Please try again later'}</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div
            className={cn(
              'grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6  lg:grid-cols-8 xl:grid-cols-12 2xl:grid-cols-12 gap-3 md:gap-4 2xl:gap-5',
            )}
          >
            {products.map((product: VendorProductListItem) => (
              <MarketplaceProductCard
                key={product._id}
                product={product}
                lang={lang}
              />
            ))}
          </div>
          {products.length >= 24 && (
            <div className="mt-8 text-center">
              <Link
                href={`/${lang}/marketplace`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6f4e37] text-[#EDE8D0] rounded-lg hover:bg-[#6f4e37] transition-colors font-semibold"
              >
                View All Products
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-600">No newly added products available</p>
        </div>
      )}
    </section>
  );
};

export default NewlyAddedProduct;
