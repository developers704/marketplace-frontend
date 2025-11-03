import SectionHeader from '@components/common/section-header';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import Alert from '@components/ui/alert';
import { Product } from '@framework/types';
import NewCarousel from '@/components/ui/carousel/NewCarousel';
import ProductListCard from '@/components/cards/product-list-card';

interface ProductsProps {
  lang: string;
  sectionHeading: string;
  sectionSubHeading?: string;
  headingPosition?: 'left' | 'center';
  className?: string;
  products?: Product[];
  loading: boolean;
  error?: string;
  limit?: number;
  uniqueKey?: string;
  variant?: string;
}

const ProductsBlockAutoPlay: React.FC<ProductsProps> = ({
  sectionHeading,
  sectionSubHeading,
  headingPosition = 'left',
  className = 'mb-12 lg:mb-14 xl:mb-16',
  products,
  loading,
  error,
  limit,
  uniqueKey,
  variant,
  lang,
}) => {
  return (
    <div className={`${className}`}>
      <SectionHeader
        sectionHeading={sectionHeading}
        sectionSubHeading={sectionSubHeading}
        headingPosition={headingPosition}
        lang={lang}
      />
      {error ? (
        <Alert message={error} className="col-span-full" />
      ) : loading && !products?.length ? (
        <div className="flex justify-center">
          {Array.from({ length: limit! }).map((_, idx) => (
            <ProductCardLoader
              key={`${uniqueKey}-${idx}`}
              uniqueKey={`${uniqueKey}-${idx}`}
            />
          ))}
        </div>
      ) : products?.length ? (
        <NewCarousel>
          {products.map((product: any) => (
            <div
              className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0" // Ensures 5 products show at once
              // key={`${uniqueKey}-${product._id}`}
              key={`${uniqueKey}-${product.id}`}
            >
              <ProductListCard
                type="STANDARD"
                data={product}
                standardClassName= '!w-[250px]'
              />
            </div>
          ))}
        </NewCarousel>
      ) : (
        <Alert message="No products found" className="col-span-full" />
      )}
    </div>
  );
};

export default ProductsBlockAutoPlay;
