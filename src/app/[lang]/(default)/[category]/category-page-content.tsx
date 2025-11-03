'use client';
import { useTranslation } from '@/app/i18n/client';
import CategoryCard from '@/components/category/category-card';
import DebounceSearch from '@/components/common/debounceSearch';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { CategoriesSkeletons } from '@/components/ui/skeletons';
import {
  useSubCategoriesQuery,
} from '@/framework/basic-rest/category/get-all-sub-categories';
import useBreadcrumb from '@/utils/use-breadcrumb';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const CategoryPageContent = ({ lang }: any) => {
  const { t } = useTranslation(lang, 'category');
  const router = useRouter();
  const breadcrupms = useBreadcrumb();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id'); // Extracting 'id' query parameter
  const params = useParams();
  const { category } = params;
  // console.log(params, '===>>> params');
  const [subCateory, setSubCategory] = useState<any>([]);
  // const { id, name } = router;
  // console.log(categoryId, '===>>>. Category Id');
  const PageTitle = decodeURIComponent(`${category}`);
  const { data, isLoading, error } = useSubCategoriesQuery(categoryId);
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

  // console.log(data,"sub categories");

  const filteredCategory = data?.filter(
    (item: any) => item.parentCategory.name === PageTitle,
  );

  // Function to filter products & categories based on search input
  const filteredCategoriesSearch = filteredCategory?.filter((category) =>
    category.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  if (isLoading) return <CategoriesSkeletons />;

  return (
    <Container>
      <section className="my-10">
        {/* Breadcrupms */}
        <Breadcrumb lang={lang} />
        <div id="top" className="flex items-center justify-between">
          <div className="leftSide">
            <h1 className="md:text-[40px] text-xl font-bold">{PageTitle}</h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4">
            <DebounceSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </div>
        <div
          id="bottom"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4"
        >
          {/* (debouncedQuery ? filteredCategoriesSearch : filteredCategory) */}
          {(debouncedQuery ? filteredCategoriesSearch : filteredCategory)?.map(
            (item: any) => {
              return (
                <Link
                  href={`/${lang}/${category}/${item.name.toLowerCase()}?id=${item.parentCategory._id},${item._id}`}
                  // onClick={() =>
                  //   router.push(
                  //     `/${lang}/${category}/${item.name.toLowerCase()}`,
                  //     {
                  //       categoryId: item.parentCategory._id,
                  //       subCategoryId: item._id,
                  //     },
                  //   )
                  // }
                  key={item?.name}
                >
                  <CategoryCard item={item} />
                </Link>
              );
            },
          )}
        </div>
      </section>
    </Container>
  );
};

export default CategoryPageContent;
