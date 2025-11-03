'use client';

import type { FC } from 'react';
import { useBestSellerGroceryProductsQuery } from '@framework/product/get-all-best-seller-grocery-products';
import ProductsGridBlock from '../products-grid-block';
import { LIMITS } from '@framework/utils/limits';
import { useBestSellerProductsQuery } from '@/framework/basic-rest/product/get-all-best-seller-products';

interface ProductFeedProps {
  lang: string;
  className?: string;
  variant?: string;
}

const BestSellerGroceryProductFeed: FC<ProductFeedProps> = ({
  lang,
  className,
  variant,
}) => {
  // only bestSeller products display
  // const { data, isLoading, error } = useBestSellerProductsQuery({
  //   limit: LIMITS.BEST_SELLER_PRODUCTS_LIMITS,
  // });
  const { data, isLoading, error } = useBestSellerGroceryProductsQuery({
    limit: LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS,
  });
  return (
    <ProductsGridBlock
      sectionHeading="Featured Collection"
      // sectionSubHeading="We Provide Best Quality Products Near Your Location"
      className={className}
      products={data}
      loading={isLoading}
      error={error?.message}
      limit={LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS}
      uniqueKey="best-sellers"
      variant={variant}
      lang={lang}
    />
  );
};
export default BestSellerGroceryProductFeed;
