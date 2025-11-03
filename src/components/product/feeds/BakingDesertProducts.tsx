'use client';

import type { FC } from 'react';
import { useBestSellerGroceryProductsQuery } from '@framework/product/get-all-best-seller-grocery-products';
import { LIMITS } from '@framework/utils/limits';
import ProductsBlockAutoPlay from './ProductsBlockAutoPlay';
import { useProductsByCategoryQuery } from '@/framework/basic-rest/product/get-products-by-category';

interface ProductFeedProps {
  lang: string;
  className?: string;
  variant?: string;
}

const BakingDesertProducts: FC<ProductFeedProps> = ({
  lang,
  className,
  variant,
}) => {
  // const { data, isLoading, error } = useProductsByCategoryQuery(
  //   {
  //     limit: LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS,
  //   },
  //   'Baking & Desert',
  // );
  const { data, isLoading, error } = useBestSellerGroceryProductsQuery({
    limit: LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS,
  });
  return (
    <ProductsBlockAutoPlay
      sectionHeading="On Sale"
      className={className}
      products={data}
      loading={isLoading}
      error={error?.message}
      limit={LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS}
      uniqueKey="baby-care"
      variant={variant}
      lang={lang}
    />
  );
};
export default BakingDesertProducts;
