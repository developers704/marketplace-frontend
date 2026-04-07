'use client';
import React, { useEffect, useState } from 'react';
import ShowMoreDropdown from '../ui/show-more-dropdown';
import { useV2CategoriesQuery, type V2Category } from '@/framework/basic-rest/catalogV2/get-categories';
import { useRouter } from 'next/navigation';
import DebounceSearch from '../common/debounceSearch';
import { CategoriesSkeletons } from '../ui/skeletons';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

interface ProductsCategoryProps {
  lang: string;
  className?: string;
  variant?: string;
}

const ProductsCategory = ({ lang }: ProductsCategoryProps) => {
  const moreItems = [8, 12, 16, 20];
  const router = useRouter();
  const {
    data: categories,
    isLoading,
    error,
  } = useV2CategoriesQuery();

  const [limit, setLimit] = useState<number | any>(moreItems[0]);
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';

  const categoriesToDisplay = categories?.slice(0, limit);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

  const categoryRouteHandler = (category: V2Category) => {
    // Navigate to marketplace with category selected
    router.push(`/${lang}/marketplace?category=${category._id}`);
  };

  // Function to filter categories based on search input
  const filteredCategories = categories?.filter((category: V2Category) =>
    category.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  if (isLoading) return <CategoriesSkeletons />;

  return (
    <section className="my-10">
      <div id="top" className="flex items-center justify-between mb-3">
        <div className="leftSide">
          <h1 className="md:text-3xl text-xl font-bold">Inventory Categories</h1>
        </div>
        <div className="rightSide flex items-center justify-center space-x-4">
          {/* Search */}
          <DebounceSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          {/* End of Search */}
          <p>Show: </p>
          <div className="flex items-center justify-center">
            <ShowMoreDropdown
              items={moreItems}
              setLimit={setLimit}
              initial={limit}
            />
          </div>
        </div>
      </div>
      <div
        id="bottom"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 md:gap-4"
      >
        {(debouncedQuery ? filteredCategories : categoriesToDisplay)?.map(
          (category: V2Category) => {
            return (
              <button
                key={category._id}
                onClick={() => categoryRouteHandler(category)}
                className="group text-center cursor-pointer transition-transform hover:scale-105"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                  <Image
                    src={getImageUrl(BASE_API, `/uploads/images/${category.image || 'category-placeholder.png'}`)}
                    alt={category.name}
                    fill
                    loading="lazy"
                    priority={false}
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 line-clamp-2">{category.name}</h3>
                {/* {category.productCount !== undefined && (
                  <p className="text-xs text-gray-500 mt-0.5">{category.productCount} products</p>
                )} */}
              </button>
            );
          },
        )}
      </div>
      {categories && categories.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-8">No categories available</p>
      )}
    </section>
  );
};

export default ProductsCategory;
