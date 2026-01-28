'use client';
import { useTranslation } from '@/app/i18n/client';
import Container from '@/components/ui/container';
import React, { useEffect, useState, useMemo } from 'react';
import Breadcrumb from '@/components/ui/breadcrumb';
import useBreadcrumb from '@/utils/use-breadcrumb';
import { useAllSpecialProductQuery } from '@/framework/basic-rest/specialProducts/specialProductsApi';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import SuppliesCard from '@/components/cards/suppliesCard';
import DebounceSearch from '@/components/common/debounceSearch';
import { SpecialProductSkeletons } from '@/components/ui/skeletons';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const SuppliesPageContent = ({ lang }: any) => {
  const { t } = useTranslation(lang, 'supplies');
  const [selectedItem, setSelectedItem] = useState('All');
  const [updateList, setUpdateList] = useState(false);
  const [wishlistProductIds, setWishlistProductIds] = useState<any>();
  const [wishlist, setWishlist] = useState<any>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: specialProducts, isLoading } =
    useAllSpecialProductQuery('supplies');

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!specialProducts || specialProducts.length === 0) return [];
    
    const categoryMap = new Map();
    
    // Add "All" category with default image
    categoryMap.set('all', {
      _id: 'all',
      name: 'All',
      image: '/uploads/images/category-placeholder.png', // Default image path
      productCount: specialProducts.length,
    });

    // Extract unique categories from products
    specialProducts.forEach((product: any) => {
      if (product.specialCategory && product.specialCategory._id) {
        const catId = product.specialCategory._id;
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            _id: catId,
            name: product.specialCategory.name,
            image: product.specialCategory.image,
            productCount: 0,
          });
        }
        // Count products per category
        const category = categoryMap.get(catId);
        category.productCount += 1;
      }
    });

    return Array.from(categoryMap.values());
  }, [specialProducts]);

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (!specialProducts) return [];
    
    let filtered = specialProducts;
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(
        (product: any) => product.specialCategory?._id === selectedCategory
      );
    }
    
    // Filter by search query
    if (debouncedQuery.trim()) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [specialProducts, selectedCategory, debouncedQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

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

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category._id);
    setSelectedCategoryData(category);
    setViewMode('products');
  };

  const handleBack = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSelectedCategoryData(null);
  };

  if (isLoading) return <SpecialProductSkeletons />;

  return (
    <Container>
      <section className="my-10">
        {/* Breadcrupms */}
        <Breadcrumb lang={lang} />
        <div
          id="top"
          className="flex md:items-center md:justify-between md:flex-row flex-col gap-3 items-center mb-6"
        >
          <div className="leftSide">
            <h1 className="md:text-[40px] text-[20px] font-bold capitalize">
              {t('Supplies')}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4">
            <DebounceSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder={'Search Products'}
            />
          </div>
        </div>

        {/* Category Cards View */}
        {viewMode === 'categories' && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {categories.map((category) => {
                return (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      {category._id === 'all' ? (
                        // Default gradient for "All" category
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue to-blue-600">
                          
                          <span className="text-white text-2xl font-bold">All</span>

                        </div>
                      ) : category.image ? (
                        <Image
                          src={getImageUrl(BASE_API, category.image)}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:opacity-90 transition-opacity"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500 text-xs font-semibold">{category.name}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 line-clamp-2">
                      {category.name}
                    </h3>
                    {category.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Products View */}
        {viewMode === 'products' && (
          <>
            {/* Back Button and Breadcrumb */}
            {selectedCategoryData && (
              <div className="mb-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors mb-2"
                >
                  <ArrowLeft size={18} />
                  <span className="text-sm font-medium">Back to Categories</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{selectedCategoryData.name}</span>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div
              id="bottom"
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item: any) => {
                  const isInWishlist = wishlistProductIds?.includes(item._id);
                  return (
                    <div key={item._id}>
                      <SuppliesCard
                        data={item}
                        lang={lang}
                        setUpdateList={setUpdateList}
                        updateList={updateList}
                        isInWishlist={isInWishlist}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No Products Found</p>
                  <button
                    onClick={handleBack}
                    className="mt-4 text-brand-blue hover:underline"
                  >
                    Back to Categories
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Show message when in categories view */}
        {viewMode === 'categories' && (
          <div className="text-center py-12 text-gray-500">
            <p>Select a category to view products</p>
          </div>
        )}
      </section>
    </Container>
  );
};

export default SuppliesPageContent;
