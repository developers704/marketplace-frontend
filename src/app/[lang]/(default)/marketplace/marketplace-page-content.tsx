'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Container from '@components/ui/container';
import Button from '@components/ui/button';
import Alert from '@components/ui/alert';
import cn from 'classnames';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search, X, Filter, ArrowLeft, ChevronDown ,Check } from 'lucide-react';
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
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function MarketplacePageContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minQuantity, setMinQuantity] = useState('');
  const [metalColor, setMetalColor] = useState('');
  const [metalType, setMetalType] = useState('');
  const [size, setSize] = useState('');
  const [stonetype, setStonetype] = useState('');
  const [centerclarity, setCenterclarity] = useState('');
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'subcategories' | 'subsubcategories' | 'products'>('categories');
  const [selectedCategoryData, setSelectedCategoryData] = useState<V2Category | null>(null);
  const [selectedSubcategoryData, setSelectedSubcategoryData] = useState<V2SubCategory | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useV2CategoriesQuery();

  const KNOWN_URL_PARAMS = new Set([
    'view', 'category', 'subcategory', 'subsubcategory', 'search', 'brand', 'sort',
    'minPrice', 'maxPrice', 'minQuantity', 'metalColor', 'metalType', 'size', 'stonetype', 'centerclarity',
  ]);
  // Restore state from URL (e.g. when returning from product detail via Back)
  useEffect(() => {
    const view = searchParams.get('view');
    const categoryId = searchParams.get('category');
    const subcategoryId = searchParams.get('subcategory');
    const subsubcategoryId = searchParams.get('subsubcategory');
    if (view === 'products') {
      setViewMode('products');
      if (categoryId) setSelectedCategory(categoryId);
      if (subcategoryId) setSelectedSubcategory(subcategoryId);
      if (subsubcategoryId) setSelectedSubsubcategory(subsubcategoryId);
      const sp = searchParams.get('search');
      if (sp != null) {
        setSearchText(sp);
        setDebouncedSearchText(sp);
      }
      const brand = searchParams.get('brand');
      if (brand != null) setSelectedBrand(brand);
      const sort = searchParams.get('sort');
      if (sort != null) setSortBy(sort);
      const minP = searchParams.get('minPrice');
      if (minP != null) setMinPrice(minP);
      const maxP = searchParams.get('maxPrice');
      if (maxP != null) setMaxPrice(maxP);
      const minQ = searchParams.get('minQuantity');
      if (minQ != null) setMinQuantity(minQ);
      const mc = searchParams.get('metalColor');
      if (mc != null) setMetalColor(mc);
      const mt = searchParams.get('metalType');
      if (mt != null) setMetalType(mt);
      const sz = searchParams.get('size');
      if (sz != null) setSize(sz);
      const st = searchParams.get('stonetype');
      if (st != null) setStonetype(st);
      const cc = searchParams.get('centerclarity');
      if (cc != null) setCenterclarity(cc);
      const attrFromUrl: Record<string, string[]> = {};
      searchParams.forEach((value, key) => {
        if (KNOWN_URL_PARAMS.has(key)) return;
        const vals = value.split(',').map((s) => s.trim()).filter(Boolean);
        if (vals.length) attrFromUrl[key] = vals;
      });
      if (Object.keys(attrFromUrl).length) setAttributeFilters(attrFromUrl);
    }
  }, [searchParams]);

  // Set category/subcategory data when IDs restored from URL
  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId && categories?.length) {
      const category = categories.find(c => c._id === categoryId);
      if (category) {
        setSelectedCategoryData(category);
        setSelectedCategory(category._id);
      }
    }
  }, [searchParams, categories]);

  // Handle category from URL (from home page link - no view param)
  useEffect(() => {
    const categoryId = searchParams.get('category');
    const view = searchParams.get('view');
    if (view === 'products') return;
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

  // Set subcategory data when ID restored from URL (after subcategories loaded)
  useEffect(() => {
    const subcategoryId = searchParams.get('subcategory');
    if (subcategoryId && subcategories?.length) {
      const sub = subcategories.find(s => s._id === subcategoryId);
      if (sub) {
        setSelectedSubcategoryData(sub);
        setSelectedSubcategory(sub._id);
      }
    }
  }, [searchParams, subcategories]);

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
    if (sortBy && sortBy !== 'featured') query.sort = sortBy;
    if (minQuantity) query.minQuantity = minQuantity;
    if (metalColor) query.metalColor = metalColor;
    if (metalType) query.metalType = metalType;
    if (size) query.size = size;
    if (stonetype) query.stonetype = stonetype;
    if (centerclarity) query.centerclarity = centerclarity;
    Object.entries(attributeFilters).forEach(([key, values]) => {
      if (values.length) query[key] = values.length === 1 ? values[0] : values.join(',');
    });
    return query;
  }, [debouncedSearchText, selectedBrand, selectedCategory, selectedSubcategory, selectedSubsubcategory, minPrice, maxPrice, sortBy, minQuantity, metalColor, metalType, size, stonetype, centerclarity, attributeFilters]);

  // Sync products view state to URL so Back from product detail can restore
  const listingQueryString = useMemo(() => {
    if (viewMode !== 'products') return '';
    const params = new URLSearchParams();
    params.set('view', 'products');
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (selectedSubsubcategory) params.set('subsubcategory', selectedSubsubcategory);
    if (debouncedSearchText.trim()) params.set('search', debouncedSearchText.trim());
    if (selectedBrand) params.set('brand', selectedBrand);
    if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (minQuantity) params.set('minQuantity', minQuantity);
    if (metalColor) params.set('metalColor', metalColor);
    if (metalType) params.set('metalType', metalType);
    if (size) params.set('size', size);
    if (stonetype) params.set('stonetype', stonetype);
    if (centerclarity) params.set('centerclarity', centerclarity);
    Object.entries(attributeFilters).forEach(([key, values]) => {
      if (values.length) params.set(key, values.join(','));
    });
    return params.toString();
  }, [viewMode, selectedCategory, selectedSubcategory, selectedSubsubcategory, debouncedSearchText, selectedBrand, sortBy, minPrice, maxPrice, minQuantity, metalColor, metalType, size, stonetype, centerclarity, attributeFilters]);

  useEffect(() => {
    if (viewMode !== 'products' || !listingQueryString) return;
    router.replace(`${pathname}?${listingQueryString}`, { scroll: false });
  }, [viewMode, listingQueryString, pathname, router]);

  const returnUrl = viewMode === 'products' && listingQueryString
    ? `${pathname}?${listingQueryString}`
    : `${pathname}?view=products`;

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

  // Dynamic attribute filters: derive from current products' defaultSku.attributes (dropdown/checkbox options)
  const SKIP_ATTRIBUTE_KEYS = new Set(['featureimageslink', 'galleryimagelink', 'descriptionname', 'stonetype', 'centerclarity']);
  const availableAttributes = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        const attrs = (product?.defaultSku as any)?.attributes;
        if (!attrs || typeof attrs !== 'object') return;
        Object.entries(attrs).forEach(([key, value]) => {
          if (SKIP_ATTRIBUTE_KEYS.has(key)) return;
          const v = String(value ?? '').trim();
          if (!v) return;
          if (!map.has(key)) map.set(key, new Set());
          map.get(key)!.add(v);
        });
      });
    });
    return Array.from(map.entries()).map(([id, set]) => ({
      _id: id,
      values: Array.from(set).sort((a, b) => String(a).localeCompare(String(b))),
    }));
  }, [data]);

  // Dynamic Metal options from defaultSku (show Metal section only if any exist)
  const { metalColors, metalTypes, sizes, hasMetal } = useMemo(() => {
    const colors = new Set<string>();
    const types = new Set<string>();
    const sz = new Set<string>();
    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        const sku = product?.defaultSku as any;
        if (!sku) return;
        if (sku.metalColor != null && String(sku.metalColor).trim()) colors.add(String(sku.metalColor).trim());
        if (sku.metalType != null && String(sku.metalType).trim()) types.add(String(sku.metalType).trim());
        if (sku.size != null && String(sku.size).trim()) sz.add(String(sku.size).trim());
      });
    });
    return {
      metalColors: Array.from(colors).sort((a, b) => a.localeCompare(b)),
      metalTypes: Array.from(types).sort((a, b) => a.localeCompare(b)),
      sizes: Array.from(sz).sort((a, b) => a.localeCompare(b)),
      hasMetal: colors.size > 0 || types.size > 0 || sz.size > 0,
    };
  }, [data]);

  // Dynamic Stone & Clarity from defaultSku.attributes (show section only if any exist)
  const { stoneTypes, centerClarities, hasStoneClarity } = useMemo(() => {
    const st = new Set<string>();
    const cc = new Set<string>();
    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        const attrs = (product?.defaultSku as any)?.attributes;
        if (!attrs || typeof attrs !== 'object') return;
        if (attrs.stonetype != null && String(attrs.stonetype).trim()) st.add(String(attrs.stonetype).trim());
        if (attrs.centerclarity != null && String(attrs.centerclarity).trim()) cc.add(String(attrs.centerclarity).trim());
      });
    });
    return {
      stoneTypes: Array.from(st).sort((a, b) => a.localeCompare(b)),
      centerClarities: Array.from(cc).sort((a, b) => a.localeCompare(b)),
      hasStoneClarity: st.size > 0 || cc.size > 0,
    };
  }, [data]);

  const options = [
  { value: "featured", label: "Featured" },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "price-asc", label: "Price: Low to High" },
];

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
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
    setMinQuantity('');
    setMetalColor('');
    setMetalType('');
    setSize('');
    setStonetype('');
    setCenterclarity('');
    setAttributeFilters({});
    setViewMode('products');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFilters(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showFilters]);

  const hasActiveFilters = debouncedSearchText || selectedBrand || minPrice || maxPrice || minQuantity || metalColor || metalType || size || stonetype || centerclarity || Object.values(attributeFilters).some((arr) => arr.length > 0);

  // Fetch cart to show item count
  const { data: cart } = useQuery({
    queryKey: ['v2-b2b-cart'],
    queryFn: getB2BCart,
    // refetchInterval: 5000, // Refresh every 5 seconds
  });

  const cartItemCount = cart?.items?.length || 0;

  // Restore scroll position when returning from product detail (Back to listing)
  useEffect(() => {
    if (viewMode !== 'products') return;
    const raw = sessionStorage.getItem('marketplaceScrollPosition');
    if (raw === null) return;
    sessionStorage.removeItem('marketplaceScrollPosition');
    const y = parseInt(raw, 10);
    if (isNaN(y) || y < 0) return;
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, data?.pages?.length]);

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
        root: null, 
        rootMargin: '200px', 
        threshold: 0.1, 
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
    <>
      {/* Filter bar: luxury alignment, responsive spacing, directly under header */}
      {viewMode === 'products' && (
        <div
          className="sticky w-full z-40  bg-white/50 backdrop-blur-xl border-b  border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-2"
          style={{ top: 'var(--header-height)' }}
        >
          <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 ">
            {/* Row 1: Back + breadcrumb — single line, responsive gaps */}
            {(selectedCategory || selectedSubcategory || selectedSubsubcategory) && (
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 mb-3 sm:mb-2 pl-4 sm:mt-2 md:mt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-brand-blue transition-colors duration-200 shrink-0 py-0.5"
                >
                  <ArrowLeft size={16} className="shrink-0" />
                  <span className="text-xs sm:text-sm font-medium tracking-tight">
                    {selectedSubsubcategory ? 'Back to Sub-Subcategories' : selectedSubcategory ? 'Back to Subcategories' : 'Back to Categories'}
                  </span>
                </button>
                {selectedCategoryData && (
                  <>
                    <span className="text-gray-300 shrink-0 hidden sm:inline" aria-hidden>·</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 min-w-0 truncate tracking-tight">
                      <span className="truncate">{selectedCategoryData?.name || '-'}</span>
                      {selectedSubcategoryData && (
                        <>
                          <span className="text-gray-300 shrink-0">/</span>
                          <span className="truncate">{selectedSubcategoryData?.name || '-'}</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

           
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6  md:p-2 lg:pl-4 lg:pr-4 lg:p-1  ">
              <div className="relative w-full sm:max-w-[320px] md:max-w-[360px] lg:max-w-[700px] shrink-0 order-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 sm:py-2.5 text-sm border border-gray-200/90 rounded-xl bg-white/95 shadow-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-200 placeholder:text-gray-400"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between  gap-2 sm:gap-3 lg:gap-4 order-2 ">
                {/* <label htmlFor="sort-by" className="text-xs font-medium text-gray-500 tracking-tight whitespace-nowrap sr-only sm:not-sr-only">
                  Sort
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 sm:py-2 text-sm border border-gray-200/90 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-200 text-gray-800 min-w-[130px] sm:min-w-[140px]"
                >
                  <option value="featured">Featured</option>
                  <option value="best-sellers">Best Sellers</option>
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="price-asc">Price: Low to High</option>
                </select> */}
                <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm hover:border-gray-300 min-w-[170px]">
                    {options.find(o => o.value === sortBy)?.label || "Sort"}
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    side="bottom"
                  sideOffset={6}
                  collisionPadding={10}
                  className="z-[9999] bg-white rounded-xl shadow-xl border border-gray-200 p-1 min-w-[180px]"
                  >
                    {options.map((item) => (
                      <DropdownMenu.Item
                        key={item.value}
                        onClick={() => setSortBy(item.value)}
                        className="flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-100 "
                      >
                        {item.label}
                        {sortBy === item.value && <Check size={14} />}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium rounded-xl border transition-all duration-200',
                    showFilters
                      ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200/90 hover:border-brand-blue/50 hover:bg-gray-50/80 shadow-sm'
                  )}
                >
                  <Filter size={16} className="shrink-0" />
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <span className="px-2 py-0.5 bg-brand-blue/15 text-brand-blue text-xs font-semibold rounded-full">
                      Active
                    </span>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-blue transition-colors duration-200 py-2 px-1"
                  >
                    <X size={14} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
            ) : categories && categories?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      <Image
                        src={getImageUrl(BASE_API, `/uploads/images/${category?.image || 'category-placeholder.png'}`)}
                        alt={category?.name}
                        fill
                        loading="lazy"
                        priority={false}
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{category?.name || "-"}</h3>
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
                        src={getImageUrl(BASE_API, `/uploads/images/${subcategory?.image || 'category-placeholder.png'}`)}
                        alt={subcategory?.name}
                        fill
                        loading="lazy"
                        priority={false}
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{subcategory?.name || "-"}</h3>
                    {subcategory?.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{subcategory?.productCount || "-"} products</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No subcategories availab</p>
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
            ) : subsubcategories && subsubcategories?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {subsubcategories.map((subsubcategory) => (
                  <button
                    key={subsubcategory?._id}
                    onClick={() => handleSubSubcategoryClick(subsubcategory)}
                    className="group text-center cursor-pointer transition-transform hover:scale-105"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                      <Image
                        src={getImageUrl(BASE_API, `/uploads/images/${subsubcategory?.image || 'category-placeholder.png'}`)}
                        alt={subsubcategory?.name}
                        fill
                        loading="lazy"
                        priority={false}
                        className="object-cover group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-2">{subsubcategory?.name || "-"}</h3>
                    {subsubcategory.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{subsubcategory?.productCount || "-"} products</p>
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

        {/* Filter Drawer — slides in from right, luxury overlay */}
        {viewMode === 'products' && (
          <>
            {/* Backdrop */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Close filters"
              onClick={() => setShowFilters(false)}
              onKeyDown={(e) => e.key === 'Escape' && setShowFilters(false)}
              className={cn(
                'fixed inset-0 z-[100] transition-opacity duration-300 ease-out',
                showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
              style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            />
            {/* Panel: right → left slide */}
            <div
              className={cn(
                'fixed top-0 right-0 bottom-0 z-[101] w-full max-w-[420px] bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)]',
                'flex flex-col rounded-l-2xl overflow-hidden transition-transform duration-300 ease-out',
                showFilters ? 'translate-x-0' : 'translate-x-full'
              )}
            >
              <div className="flex-shrink-0 px-5 py-4 border-b border-[#e8e8e8] bg-[#fafafa]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500">Filters</p>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 -mr-2 rounded-full text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
                    aria-label="Close filters"
                  >
                    <X size={20} strokeWidth={1.8} />
                  </button>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <div className="divide-y divide-[#e8e8e8]">
                {[
                  {
                    key: 'brand',
                    label: 'Brand',
                    hasActive: !!selectedBrand,
                    content: (
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30 transition-colors"
                      >
                        <option value="">All Brands</option>
                        {brands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    ),
                  },
                  {
                    key: 'price',
                    label: 'Price Range',
                    hasActive: !!(minPrice || maxPrice),
                    content: (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Min (USD)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min={0}
                            step={0.01}
                            className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max (USD)</label>
                          <input
                            type="number"
                            placeholder="—"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min={0}
                            step={0.01}
                            className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                          />
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'quantity',
                    label: 'Min. Quantity',
                    hasActive: !!minQuantity,
                    content: (
                      <input
                        type="number"
                        placeholder="Any"
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(e.target.value)}
                        min={0}
                        step={1}
                        className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                      />
                    ),
                  },
                  ...(hasMetal
                    ? [
                        {
                          key: 'metal',
                          label: 'Metal',
                          hasActive: !!(metalColor || metalType || size),
                          content: (
                            <div className="space-y-3">
                              {metalColors.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                                  <select
                                    value={metalColor}
                                    onChange={(e) => setMetalColor(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  >
                                    <option value="">All</option>
                                    {metalColors?.map((c) => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {metalTypes?.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                                  <select
                                    value={metalType}
                                    onChange={(e) => setMetalType(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  >
                                    <option value="">All</option>
                                    {metalTypes?.map((t) => (
                                      <option key={t} value={t}>{t || "-"}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {sizes?.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                                  <select
                                    value={size}
                                    onChange={(e) => setSize(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  >
                                    <option value="">All</option>
                                    {sizes?.map((s) => (
                                      <option key={s} value={s}>{s || "-"}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(hasStoneClarity
                    ? [
                        {
                          key: 'stone',
                          label: 'Stone & Clarity',
                          hasActive: !!(stonetype || centerclarity),
                          content: (
                            <div className="space-y-3">
                              {stoneTypes.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Stone Type</label>
                                  <select
                                    value={stonetype}
                                    onChange={(e) => setStonetype(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  >
                                    <option value="">All</option>
                                    {stoneTypes.map((v) => (
                                      <option key={v} value={v}>{v || "-"}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {centerClarities.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Center Clarity</label>
                                  <select
                                    value={centerclarity}
                                    onChange={(e) => setCenterclarity(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  >
                                    <option value="">All</option>
                                    {centerClarities.map((v) => (
                                      <option key={v} value={v}>{v || "-"}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                    ...availableAttributes.map((attr) => {
                    const selected = attributeFilters[attr?._id] ?? [];
                    const label = attr._id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                    return {
                      key: `attr-${attr?._id}`,
                      label,
                      hasActive: selected?.length > 0,
                      content: (
                        <div className="max-h-44 overflow-y-auto pr-1 space-y-1.5">
                          {attr.values.slice(0, 50).map((val) => (
                            <label
                              key={val}
                              className={cn(
                                'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                selected.includes(val) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(val)}
                                onChange={() => {
                                  setAttributeFilters((prev) => {
                                    const arr = prev[attr?._id] ?? [];
                                    const next = arr?.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
                                    const nextState = { ...prev };
                                    if (next.length) nextState[attr?._id] = next;
                                    else delete nextState[attr?._id];
                                    return nextState;
                                  });
                                }}
                                className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                              />
                              <span className="text-gray-800 truncate">{val}</span>
                            </label>
                          ))}
                          {attr?.values?.length > 50 && (
                            <p className="text-xs text-gray-400 pt-1 px-2.5">+{attr?.values?.length - 50} more</p>
                          )}
                        </div>
                      ),
                    };
                  }),
                ].map((item) => {
                  const isOpen = openFilterKey === item?.key;
                  return (
                    <div key={item.key} className="bg-white">
                      <button
                        type="button"
                        onClick={() => setOpenFilterKey((k) => (k === item?.key ? null : item?.key))}
                        className={cn(
                          'w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors',
                          isOpen ? 'bg-[#f5f5f5]' : 'hover:bg-[#fafafa]',
                          item.hasActive && 'font-medium'
                        )}
                      >
                        <span className="text-sm text-gray-800">{item?.label || "-"}</span>
                        <span className="flex items-center gap-2">
                          {item?.hasActive && (
                            <span className="w-2 h-2 rounded-full bg-[#1a1a1a]" aria-hidden />
                          )}
                          <ChevronDown
                            size={18}
                            className={cn('text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')}
                          />
                        </span>
                      </button>
                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-200 ease-out',
                          isOpen ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'
                        )}
                      >
                        <div className="px-5 pb-4 pt-1 border-t border-[#eee] bg-white">
                          {item?.content || "-"}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
              <div className="flex-shrink-0 px-5 py-4 border-t border-[#e8e8e8] bg-[#fafafa]">
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 text-sm font-medium text-white bg-[#1a1a1a] rounded-xl hover:bg-[#2d2d2d] transition-colors"
                >
                  View results
                </button>
              </div>
            </div>
          </>
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
                      <MarketplaceProductCard key={product?._id} product={product} lang={lang} returnUrl={returnUrl} />
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
    </>
  );
}



