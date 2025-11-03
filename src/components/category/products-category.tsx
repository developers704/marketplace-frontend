'use client';
import React, { useEffect, useState } from 'react';
import CategoryCard from './category-card';
import ShowMoreDropdown from '../ui/show-more-dropdown';
import { useCategoriesQuery } from '@/framework/basic-rest/category/get-all-categories';
import { useRouter } from 'next/navigation';
import {
  fetchSubCategories,
  useSubCategoriesQuery,
} from '@/framework/basic-rest/category/get-all-sub-categories';
import DebounceSearch from '../common/debounceSearch';
import { CategoriesSkeletons } from '../ui/skeletons';
import DisableInspectElement from '@/utils/DisableInspectElement';
import PreventScreenCapture from '@/utils/PreventScreenShots';

interface ProductsCategoryProps {
  lang: string;
  className?: string;
  variant?: string;
}

const ProductsCategory = ({ lang }: ProductsCategoryProps) => {
  const moreItems = [9, 14, 20, 25];
  const router = useRouter();
  const {
    data: allCategories,
    isLoading,
    error,
  } = useCategoriesQuery({ limit: 2 });

  const [limit, setLimit] = useState<number | any>(moreItems[0]);
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const categoriesToDisplay = allCategories?.slice(0, limit);

  // console.log(allCategories, '===>>>. allCategories');
  // console.log(allSubCategories, '===>>>. subCategories');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

  const categoryRouteHandler = async (
    categoryName?: string,
    categoryId?: string,
  ) => {
    const subCate = await fetchSubCategories(categoryId);
    // console.log(categoryId, '===>>>. categoryId');
    // console.log(subCate);
    if (subCate.length > 0) {
      router.push(`/${lang}/${categoryName}`);
    } else {
      // /${lang}/${category}/${item.name.toLowerCase()}?id=${item._id},${item.parentCategory._id}
      router.push(`/${lang}/${categoryName}/${categoryName}?id=${categoryId}`);
    }
    // const categoryProducts = await fetchProductsByCategory(categoryName, categoryId);
  };

  // Function to filter products & categories based on search input
  const filteredCategories = allCategories?.filter((category) =>
    category.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  // console.log(filteredCategories, '===>>>. filteredCategories111');



  if (isLoading) return <CategoriesSkeletons />;

  return (
    <section className="my-10">
      {/* <DisableInspectElement /> */}
      {/* <PreventScreenCapture /> */}
      <div id="top" className="flex items-center justify-between mb-3">
        <div className="leftSide">
          <h1 className="md:text-3xl text-xl font-bold">Products Category</h1>
        </div>
        <div className="rightSide flex items-center justify-center space-x-4">
          {/* Search */}

          <DebounceSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* End of Search */}

          {/* <Search
            searchId="product-search"
            className="hidden lg:flex lg:max-w-[650px] 2xl:max-w-[800px]"
            variant="fill"
            lang={lang}
          /> */}
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
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {(debouncedQuery ? filteredCategories : categoriesToDisplay)?.map(
          (item: any) => {
            return (
              <div
                // href={`/${lang}/${item.name}`}
                onClick={() => categoryRouteHandler(item.name, item._id)}
                key={item._id}
                className="border-[1px] rounded-xl border-transparent transition-all duration-300 ease-in-out hover:border-gray-600 cursor-pointer"
              >
                <CategoryCard item={item} />
              </div>
            );
          },
        )}
      </div>
    </section>
  );
};

export default ProductsCategory;
