'use client';

import { useSearchParams } from 'next/navigation';
import ProductSingleDetails from '@components/product/product';
import VendorProductSingleDetails from '@components/product/vendor-product';

const ProductDetailsRouter: React.FC<{ lang: string }> = ({ lang }) => {
  const searchParams = useSearchParams();
  const catalog = (searchParams.get('catalog') || searchParams.get('v') || '').toLowerCase();

  if (catalog === 'v2' || catalog === '2') {
    return <VendorProductSingleDetails lang={lang} />;
  }

  return <ProductSingleDetails lang={lang} />;
};

export default ProductDetailsRouter;


