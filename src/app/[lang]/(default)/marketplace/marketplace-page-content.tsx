'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Container from '@components/ui/container';
import Button from '@components/ui/button';
import Alert from '@components/ui/alert';
import cn from 'classnames';
import Link from 'next/link';
import { ShoppingCart, Search, X, Filter } from 'lucide-react';
import { useProductsQuery } from '@framework/product/get-all-products';
import { LIMITS } from '@framework/utils/limits';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import MarketplaceProductCard from '@components/marketplace/marketplace-product-card';
import B2BCartDrawer from '@components/marketplace/b2b-cart-drawer';
import { useQuery } from '@tanstack/react-query';
import { getB2BCart } from '@/framework/basic-rest/catalogV2/b2b-cart';

export default function MarketplacePageContent({ lang }: { lang: string }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (selectedCategory) query.category = selectedCategory;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    return query;
  }, [debouncedSearchText, selectedBrand, selectedCategory, minPrice, maxPrice]);

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

  // Extract unique brands and categories from products
  const { brands, categories } = useMemo(() => {
    const brandSet = new Set<string>();
    const categorySet = new Set<string>();
    
    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        if (product.brand) brandSet.add(product.brand);
        if (product.category) categorySet.add(product.category);
      });
    });

    return {
      brands: Array.from(brandSet).sort(),
      categories: Array.from(categorySet).sort(),
    };
  }, [data]);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setDebouncedSearchText('');
    setSelectedBrand('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const hasActiveFilters = debouncedSearchText || selectedBrand || selectedCategory || minPrice || maxPrice;

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
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-sm text-gray-600 mt-1">
              Vendor-model listings with real-time stock visibility (SKU inventory aggregated).
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}/marketplace/store-inventory`}
              className="text-sm font-semibold text-brand-blue underline"
            >
              My Store Inventory
            </Link>
            <button
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
            </button>
          </div>
        </div>

        {/* Search Bar and Filters */}
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
                    {categories.map((category) => (
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
      </div>

      {/* B2B Cart Drawer */}
      <B2BCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} lang={lang} />
    </Container>
  );
}



