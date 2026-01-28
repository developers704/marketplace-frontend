'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Container from '@components/ui/container';
import Button from '@components/ui/button';
import Alert from '@components/ui/alert';
import cn from 'classnames';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, Search, X, Filter, ArrowLeft } from 'lucide-react';
import { useProductsQuery } from '@framework/product/get-all-products';
import { LIMITS } from '@framework/utils/limits';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import MarketplaceProductCard from '@components/marketplace/marketplace-product-card';
import B2BCartDrawer from '@components/marketplace/b2b-cart-drawer';
import { useQuery } from '@tanstack/react-query';
import { getB2BCart } from '@/framework/basic-rest/catalogV2/b2b-cart';
import {
  useV2CategoriesQuery,
  useV2SubcategoriesByCategoryQuery,
  useV2SubSubcategoriesBySubCategoryQuery,
  type V2Category,
  type V2SubCategory,
  type V2SubSubCategory,
} from '@/framework/basic-rest/catalogV2/get-categories';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

export default function MarketplacePageContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'categories' | 'subcategories' | 'subsubcategories' | 'products'>('categories');
  const [selectedCategoryData, setSelectedCategoryData] = useState<V2Category | null>(null);
  const [selectedSubcategoryData, setSelectedSubcategoryData] = useState<V2SubCategory | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useV2CategoriesQuery();

  // Handle category from URL query parameter (from home page)
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categories && categories.length > 0) {
      const category = categories.find(c => c._id === categoryId);
      if (category) {
        setSelectedCategoryData(category);
        setSelectedCategory(category._id);
        setViewMode('subcategories');
      }
    }
  }, [searchParams, categories]);
  
  // Fetch subcategories when category is selected
  const { data: subcategories, isLoading: subcategoriesLoading } = useV2SubcategoriesByCategoryQuery(
    selectedCategoryData?._id || null
  );

  // Fetch sub-subcategories when subcategory is selected
  const { data: subsubcategories, isLoading: subsubcategoriesLoading } = useV2SubSubcategoriesBySubCategoryQuery(
    selectedSubcategoryData?._id || null
  );

  // Debounce search text - wait 500ms after user stops typing
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    // Cleanup on unmount or when searchText changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  // Build filter query object using debounced search text
  const filterQuery = useMemo(() => {
    const query: any = {};
    if (debouncedSearchText.trim()) query.search = debouncedSearchText.trim();
    if (selectedBrand) query.brand = selectedBrand;
    // Use ObjectId for category filtering if available
    if (selectedSubsubcategory) {
      query.subsubcategory = selectedSubsubcategory;
    } else if (selectedSubcategory) {
      query.subcategory = selectedSubcategory;
    } else if (selectedCategory) {
      query.category = selectedCategory;
    }
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    return query;
  }, [debouncedSearchText, selectedBrand, selectedCategory, selectedSubcategory, selectedSubsubcategory, minPrice, maxPrice]);

  const {
    isFetching: isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = useProductsQuery({
    limit: LIMITS.PRODUCTS_LIMITS,
    newQuery: filterQuery,
  } as any);

  // Extract unique brands and category names from products (for filter dropdown)
  const { brands, productCategories } = useMemo(() => {
    const brandSet = new Set<string>();
    const categorySet = new Set<string>();
    
    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        if (product.brand) brandSet.add(product.brand);
        // Handle both string and object category
        const categoryName = typeof product.category === 'string' 
          ? product.category 
          : (product.category as any)?.name || '';
        if (categoryName) categorySet.add(categoryName);
      });
    });

    return {
      brands: Array.from(brandSet).sort(),
      productCategories: Array.from(categorySet).sort(),
    };
  }, [data]);

  // Handle category click
  const handleCategoryClick = useCallback((category: V2Category) => {
    setSelectedCategoryData(category);
    setSelectedCategory(category._id);
    setSelectedSubcategory('');
    setSelectedSubsubcategory('');
    setSelectedSubcategoryData(null);
    setViewMode('subcategories');
  }, []);

  // Handle subcategory click
  const handleSubcategoryClick = useCallback((subcategory: V2SubCategory) => {
    setSelectedSubcategoryData(subcategory);
    setSelectedSubcategory(subcategory._id);
    setSelectedSubsubcategory('');
    // Check if subcategory has sub-subcategories
    if (subcategories && subcategories.some(sc => sc._id === subcategory._id && (sc as any).subSubcategories?.length > 0)) {
      setViewMode('subsubcategories');
    } else {
      setViewMode('products');
    }
  }, [subcategories]);

  // Handle sub-subcategory click
  const handleSubSubcategoryClick = useCallback((subsubcategory: V2SubSubCategory) => {
    setSelectedSubsubcategory(subsubcategory._id);
    setViewMode('products');
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (viewMode === 'subsubcategories') {
      setViewMode('subcategories');
      setSelectedSubsubcategory('');
    } else if (viewMode === 'subcategories') {
      setViewMode('categories');
      setSelectedCategory('');
      setSelectedCategoryData(null);
      setSelectedSubcategory('');
      setSelectedSubcategoryData(null);
    } else if (viewMode === 'products') {
      if (selectedSubsubcategory) {
        setViewMode('subsubcategories');
        setSelectedSubsubcategory('');
      } else if (selectedSubcategory) {
        setViewMode('subcategories');
        setSelectedSubcategory('');
        setSelectedSubcategoryData(null);
      } else {
        setViewMode('categories');
        setSelectedCategory('');
        setSelectedCategoryData(null);
      }
    }
  }, [viewMode, selectedSubcategory, selectedSubsubcategory]);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setDebouncedSearchText('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedSubsubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setViewMode('categories');
    setSelectedCategoryData(null);
    setSelectedSubcategoryData(null);
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const hasActiveFilters = debouncedSearchText || selectedBrand || selectedCategory || selectedSubcategory || selectedSubsubcategory || minPrice || maxPrice;

  // Fetch cart to show item count
  const { data: cart } = useQuery({
    queryKey: ['v2-b2b-cart'],
    queryFn: getB2BCart,
    // refetchInterval: 5000, // Refresh every 5 seconds
  });

  const cartItemCount = cart?.items?.length || 0;

  // IntersectionObserver for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        // Only fetch if:
        // 1. Element is intersecting (visible)
        // 2. There's a next page
        // 3. Not currently loading
        if (
          firstEntry?.isIntersecting &&
          hasNextPage &&
          !loadingMore &&
          !isLoading
        ) {
          fetchNextPage();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, loadingMore, isLoading, fetchNextPage]);

  return (
    <Container>
      <div className="pt-6 pb-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            {/* <p className="text-sm text-gray-600 mt-1">
              Vendor-model listings with real-time stock visibility (SKU inventory aggregated).
            </p> */}
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}/marketplace/store-inventory`}
              className="text-sm font-semibold text-brand-blue underline"
            >
              My Store Inventory
            </Link>
            {/* <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-brand-blue transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button> */}
          </div>
        </div>

        {/* Category Navigation */}
        {viewMode === 'categories' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Categories</h2>
            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      <Image
                        src={getImageUrl(BASE_API, `/uploads/images/${category.image || 'category-placeholder.png'}`)}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{category.name}</h3>
                    {/* {category.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{category.productCount} products</p>
                    )} */}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No categories available</p>
            )}
          </div>
        )}

        {/* Subcategory Navigation */}
        {viewMode === 'subcategories' && selectedCategoryData && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Categories</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subcategories</h2>
            {subcategoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : subcategories && subcategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory._id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      <Image
                        src={getImageUrl(BASE_API, `/uploads/images/${subcategory.image || 'category-placeholder.png'}`)}
                        alt={subcategory.name}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{subcategory.name}</h3>
                    {subcategory.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{subcategory.productCount} products</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No subcategories available</p>
                <button
                  onClick={() => setViewMode('products')}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
                >
                  View Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sub-Subcategory Navigation */}
        {viewMode === 'subsubcategories' && selectedSubcategoryData && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Subcategories</span>
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sub-Subcategories</h2>
            {subsubcategoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : subsubcategories && subsubcategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {subsubcategories.map((subsubcategory) => (
                  <button
                    key={subsubcategory._id}
                    onClick={() => handleSubSubcategoryClick(subsubcategory)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      <Image
                        src={getImageUrl(BASE_API, `/uploads/images/${subsubcategory.image || 'category-placeholder.png'}`)}
                        alt={subsubcategory.name}
                        fill
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{subsubcategory.name}</h3>
                    {subsubcategory.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{subsubcategory.productCount} products</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No sub-subcategories available</p>
                <button
                  onClick={() => setViewMode('products')}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
                >
                  View Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Breadcrumb for Products View */}
        {viewMode === 'products' && (selectedCategory || selectedSubcategory || selectedSubsubcategory) && (
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors mb-2"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">
                {selectedSubsubcategory ? 'Back to Sub-Subcategories' : selectedSubcategory ? 'Back to Subcategories' : 'Back to Categories'}
              </span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {selectedCategoryData && (
                <>
                  <span>{selectedCategoryData.name}</span>
                  {selectedSubcategoryData && (
                    <>
                      <span>/</span>
                      <span>{selectedSubcategoryData.name}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Bar and Filters */}
        {viewMode === 'products' && (
          <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by vendor model, SKU, brand, or category..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Filter Toggle and Active Filters */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                showFilters
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-blue'
              )}
            >
              <Filter size={18} />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-brand-blue/20 text-brand-blue text-xs font-semibold rounded-full">
                  Active
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-blue transition-colors"
              >
                <X size={16} />
                <span>Clear all</span>
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                  >
                    <option value="">All Categories</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Price (USD)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Price (USD)</label>
                  <input
                    type="number"
                    placeholder="No limit"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Products Grid - Only show when in products view */}
        {viewMode === 'products' && (
          <>
            {error ? (
              <Alert message={error?.message} />
            ) : (
              <>
                <div
                  className={cn(
                    'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-5',
                  )}
                >
              {isLoading && !data?.pages?.length ? (
                Array.from({ length: 20 }).map((_, idx) => (
                  <ProductCardLoader key={`marketplace-loader-${idx}`} uniqueKey={`marketplace-loader-${idx}`} />
                ))
              ) : (
                data?.pages?.map((page: any, idx: number) => (
                  <div
                    key={`marketplace-page-${idx}`}
                    className="contents"
                  >
                    {(page?.data || [])?.map((product: VendorProductListItem) => (
                      <MarketplaceProductCard key={product?._id} product={product} lang={lang} />
                    ))}
                  </div>
                ))
              )}
            </div>

            {/* Infinite Scroll Trigger - IntersectionObserver */}
            {hasNextPage && (
              <div
                ref={loadMoreRef}
                className="pt-8 pb-4 flex items-center justify-center"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading more products...</span>
                  </div>
                )}
              </div>
            )}
              </>
            )}
          </>
        )}

        {/* Show message when in category navigation mode */}
        {viewMode !== 'products' && (
          <div className="text-center py-12 text-gray-500">
            <p>Select a category to view products</p>
          </div>
        )}
      </div>

      {/* B2B Cart Drawer */}
      <B2BCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} />
    </Container>
  );
}



