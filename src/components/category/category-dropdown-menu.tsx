'use client';
import CategoryListCardLoader from '@components/ui/loaders/category-list-card-loader';
import { useCategoriesQuery } from '@framework/category/get-all-categories';
import { useEffect, useState } from 'react';
import { useSubCategoriesQuery } from '@/framework/basic-rest/category/get-all-sub-categories';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

interface CategoryDropdownProps {
  className?: string;
  lang?: string;
}

export default function CategoryDropdownMenu({
  className,
  lang = 'en',
}: CategoryDropdownProps) {
  const { data, isLoading, error } = useCategoriesQuery({ limit: 2 });
  // console.log(categories, '===>>> categories from props');
  const [categories, setCategories] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(
    categories[0]?.name,
  );
  const [filteredCategoryData, setFilteredCategoryData] = useState([]);
  const { data: subCategory, isLoading: subIsLoading } = useSubCategoriesQuery(
    selectedCategory?._id,
  );

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  const getSubCategories = (category: string) => {
    setSelectedCategory(category);

    const filteredCategory: any = subCategory?.filter(
      (item: any) => item.parentCategory.name === category,
    );
    setFilteredCategoryData(filteredCategory);
  };

  // if (isLoading) {
  //   return <div>Loading...</div>; // Show a loading spinner or placeholder
  // }

  // if (subIsLoading) {
  //   return <div>Loading...</div>; // Show a loading spinner or placeholder
  // }

  // console.log(categories, '===>>> categories');
  // console.log(filteredCategoryData, '===>>> filteredCategoryData');
  // console.log(subCategory, '===>>> subCategory');

  return (
    <div className="flex w-[95vw] border border-gray-300 top-[55px] shadow-md absolute z-50">
      {/* Left Sidebar */}
      {isLoading ? (
        <CategoryListCardLoader
          key={`category-list`}
          uniqueKey="category-list-card-loader"
        />
      ) : (
        <div className="w-1/4 bg-white p-4">
          <ul className="space-y-4">
            {categories?.map((category: any) => (
              <li
                key={category.name}
                className={`cursor-pointer font-semibold ${
                  selectedCategory === category?.name
                    ? 'text-blue-600'
                    : 'text-black'
                }`}
                onMouseEnter={() => getSubCategories(category.name)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Right Subcategories Section */}

      {subIsLoading ? (
        <CategoryListCardLoader
          key={`category-list`}
          uniqueKey="category-list-card-loader"
        />
      ) : (
        <div className="w-3/4 bg-gray-100 p-6 flex flex-wrap gap-4">
          {/*  href={`/${lang}/${category}/${item.name.toLowerCase()}?id=${item.parentCategory._id},${item._id}`} */}
          {filteredCategoryData?.length > 0 ? (
            filteredCategoryData?.map((sub: any) => (
              <Link
                key={sub?.name}
                // href={`/${lang}`}
                href={`/${lang}/${sub.parentCategory.name}/${sub.name.toLowerCase()}?id=${sub.parentCategory._id},${sub._id}`}
                className="relative w-40 h-28 bg-gray-400 rounded-lg flex items-center justify-center text-white text-center hover:bg-blue-500 transition"
              >
                <img
                  src={getImageUrl(BASE_API as string, `/uploads/images/${sub?.image}`, '/assets/images/placeholder-image.jpg')}
                  alt={sub?.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-lg"
                />
                <span className="relative z-10">{sub?.name}</span>
              </Link>
            ))
          ) : (
            <p className="text-gray-600">No subcategories available</p>
          )}
        </div>
      )}
    </div>
  );
}
