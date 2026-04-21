'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import Container from '@components/ui/container';
import Alert from '@components/ui/alert';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import MarketplaceProductCard from '@/components/marketplace/marketplace-product-card';
import { useProductsQuery } from '@framework/product/get-all-products';
import { LIMITS } from '@framework/utils/limits';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import { ArrowLeft } from 'lucide-react';

export default function NewlyAddedPageContent({ lang }: { lang: string }) {
  const {
    data,
    isFetching: isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    error,
  } = useProductsQuery({
    limit: LIMITS.PRODUCTS_LIMITS,
    newQuery: { sort: 'new-arrivals' },
  } as any);

  const products: VendorProductListItem[] = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page: any) => page?.data || []);
  }, [data]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !loadingMore && !isLoading) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );
    const node = loadMoreRef.current;
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [fetchNextPage, hasNextPage, isLoading, loadingMore]);

  return (
    <Container>
      <section className="pt-6 pb-10">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Newly Added Inventory</h1>
            <p className="mt-1 text-sm text-gray-600">
              Latest products sorted by newest first
            </p>
          </div>
        </div>
          <span className=' flex items-center mb-6 '>
          <Link href={`/${lang}/`} className="flex items-center text-sm font-semibold gap-2 ">
           <ArrowLeft size={16} className="shrink-0" /> 
           Back to Marketplace
          </Link>
         </span>


        {error ? (
          <Alert message={error?.message} />
        ) : (
          <>
            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-5'
              )}
            >
              {isLoading && products.length === 0
                ? Array.from({ length: LIMITS.PRODUCTS_LIMITS }).map((_, idx) => (
                    <ProductCardLoader key={`newly-added-page-loader-${idx}`} uniqueKey={`newly-added-page-loader-${idx}`} />
                  ))
                : products.map((product) => (
                    <MarketplaceProductCard key={product?._id} product={product} lang={lang} />
                  ))}
            </div>

            {hasNextPage && (
              <div ref={loadMoreRef} className="pt-8 pb-4 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading more products...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </Container>
  );
}
