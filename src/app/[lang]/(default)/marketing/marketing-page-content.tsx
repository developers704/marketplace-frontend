'use client';
import { useTranslation } from '@/app/i18n/client';
import MarketingCard from '@/components/cards/marketingCard';
import DebounceSearch from '@/components/common/debounceSearch';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { SpecialProductSkeletons } from '@/components/ui/skeletons';
import { useAllSpecialProductQuery } from '@/framework/basic-rest/specialProducts/specialProductsApi';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import React, { useEffect, useState } from 'react';

const MarketingPageContent = ({ lang }: { lang: string }) => {
  const { t } = useTranslation(lang, 'inventory orders');
  const [updateList, setUpdateList] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState<any>();
  const [wishlist, setWishlist] = useState<any>();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [specialCategory, setSpecialCategory] = useState<any[]>([
    { _id: 'all', name: 'All' },
  ]);
  const [productsList, setProductsList] = useState<any[]>();
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: specialProducts, isLoading } =
    useAllSpecialProductQuery('marketing');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

  const filteredProducts = specialProducts?.filter((product: any) =>
    product.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  // console.log(specialProducts);

  useEffect(() => {
    const fetchWishlist = async () => {
      const response = await getWishListItem(); // Fetch wishlist API
      // setWishlist(response); // ✅ Update state

      if (response) {
        // setProducts(response.products);
        setWishlistProductIds(
          response?.products?.map((item: any) => item?.product?._id) || [],
        );
        setWishlist(response.products);
      }
    };
    fetchWishlist();
  }, [updateList]);

  useEffect(() => {
    if (!isLoading && specialProducts?.length > 0) {
      const specialCategories = specialProducts
        .map((item: any) => item.specialCategory) // Extract specialCategory
        .filter((category: any) => category && category._id) // Remove undefined/null values
        .reduce((acc: any, category: any) => {
          if (!acc.some((item: any) => item._id === category._id)) {
            acc.push(category);
          }
          return acc;
        }, []);

      // console.log(specialCategories, 'filters');
      // setSpecialCategory(specialCategories);

      const updatedCategories = [
        { _id: 'all', name: 'All' },
        ...specialCategories,
      ];
      setSpecialCategory(updatedCategories);
      setProductsList(specialProducts);
    }
  }, [isLoading]); // ✅ Added dependencies

  const filterCateBySpecialCategory = (category: any) => {
    setSelectedCategory(category.name);
    if (category.name === 'All') {
      setProductsList(specialProducts);
    } else {
      const filteredProducts = specialProducts.filter(
        (item: any) => item.specialCategory._id === category._id,
      );
      setProductsList(filteredProducts);
    }
  };

  // console.log(specialCategory, 'specialCategory');

  if (isLoading) return <SpecialProductSkeletons />;

  return (
    <Container>
      <section className="my-10">
        {/* Breadcrupms */}
        <Breadcrumb lang={lang} />
        <div
          id="top"
          className="flex md:items-center md:justify-between md:flex-row flex-col gap-3 items-center"
        >
          <div className="leftSide">
            <h1 className="md:text-[40px] text-[20px] font-bold capitalize">
              {t('Marketing')}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4">
            {specialCategory?.map((item: any) => {
              const isSelected = selectedCategory === item.name;
              return (
                <div
                  className={`cursor-pointer  ${isSelected ? 'bg-brand-blue' : 'bg-transparent'} ${isSelected ? 'text-white' : 'text-black'} border-[1px] border-[#92898266] py-[10px] px-[15px] whitespace-nowrap`}
                  onClick={() => filterCateBySpecialCategory(item)}
                  key={item.id}
                >
                  {item.name}
                </div>
              );
            })}
            <DebounceSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder={'Search Products'}
            />
          </div>
        </div>
        <div
          id="bottom"
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {(debouncedQuery ? filteredProducts : productsList)?.map(
            (item: any) => {
              const isInWishlist = wishlistProductIds?.includes(item._id);
              return (
                <div
                // href={`/${lang}/inventory-orders/${item.name}`}
                >
                  <MarketingCard
                    data={item}
                    lang={lang}
                    setUpdateList={setUpdateList}
                    updateList={updateList}
                    isInWishlist={isInWishlist}
                    wishlist={wishlist}
                    setWishlist={setWishlist}
                  />
                  {/* hello */}
                </div>
              );
            },
          )}
        </div>
      </section>
    </Container>
  );
};

export default MarketingPageContent;
