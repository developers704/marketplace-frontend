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
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

const RANGE_ATTRIBUTE_FILTER_KEYS = ['avgweight', 'centercarat', '99price', 'sidecarat'] as const;
const RANGE_ATTRIBUTE_FILTER_KEY_SET = new Set<string>(RANGE_ATTRIBUTE_FILTER_KEYS);

/** Large brand lists: require typing before showing full search results */
const BRAND_SEARCH_MIN_CHARS = 2;
const BRAND_RESULT_CAP = 500;
const BRAND_LARGE_LIST_THRESHOLD = 200;

type RangeAttributeMeta = {
  values: Array<{ raw: string; num: number }>;
  min: number;
  max: number;
};

type ListingFilters = {
  brands: string[];
  metalColors: string[];
  metalTypes: string[];
  sizes: string[];
  stoneTypes: string[];
  centerClarities: string[];
  availableAttributes: Array<{ _id: string; values: string[] }>;
  priceRange?: { min: number; max: number };
};

const areQueriesEqual = (a: Record<string, any>, b: Record<string, any>) => {
  const aKeys = Object.keys(a || {}).sort();
  const bKeys = Object.keys(b || {}).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (key !== bKeys[i]) return false;
    if (String(a[key] ?? '') !== String(b[key] ?? '')) return false;
  }
  return true;
};

export default function MarketplacePageContent({ lang }: { lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubsubcategory, setSelectedSubsubcategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<string>('isMain');
  const [minQuantity, setMinQuantity] = useState('');
  const [metalColor, setMetalColor] = useState<string[]>([]);
  const [metalType, setMetalType] = useState<string[]>([]);
  const [size, setSize] = useState<string[]>([]);
  const [stonetype, setStonetype] = useState<string[]>([]);
  const [centerclarity, setCenterclarity] = useState<string[]>([]);
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  const [attributeRangeFilters, setAttributeRangeFilters] = useState<Record<string, { min: number; max: number }>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'subcategories' | 'subsubcategories' | 'products'>('categories');
  const [selectedCategoryData, setSelectedCategoryData] = useState<V2Category | null>(null);
  const [selectedSubcategoryData, setSelectedSubcategoryData] = useState<V2SubCategory | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInternalQuerySyncRef = useRef('');
  const lastKnownCategoryIdRef = useRef('');
  const shouldHydrateCommittedFiltersRef = useRef(false);
  const [committedFilterQuery, setCommittedFilterQuery] = useState<Record<string, any>>({});
  const [categoryScopedFilters, setCategoryScopedFilters] = useState<ListingFilters | null>(null);

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';

  const { data: user, isLoading: userLoading } = useUserDataQuery();
  const isSuperAdmin = useMemo(
    () => String(user?.role?.role_name ?? '').trim().toLowerCase() === 'super admin',
    [user?.role?.role_name]
  );

  const [brandSearchDraft, setBrandSearchDraft] = useState('');
  const [vendorSearchDraft, setVendorSearchDraft] = useState('');
  const [metalColorSearchDraft, setMetalColorSearchDraft] = useState('');
  const [metalTypeSearchDraft, setMetalTypeSearchDraft] = useState('');
  const [sizeSearchDraft, setSizeSearchDraft] = useState('');
  const [stoneTypeSearchDraft, setStoneTypeSearchDraft] = useState('');
  const [centerClaritySearchDraft, setCenterClaritySearchDraft] = useState('');
  const [attributeOptionSearchDrafts, setAttributeOptionSearchDrafts] = useState<Record<string, string>>({});

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useV2CategoriesQuery();

  const KNOWN_URL_PARAMS = new Set([
    'view', 'category', 'subcategory', 'subsubcategory', 'search', 'brand', 'vendor', 'sort',
    'minPrice', 'maxPrice', 'minQuantity', 'metalColor', 'metalType', 'size', 'stonetype', 'centerclarity',
    ...RANGE_ATTRIBUTE_FILTER_KEYS.flatMap((key) => [`${key}Min`, `${key}Max`]),
  ]);
  // Restore state from URL (e.g. when returning from product detail via Back)
  useEffect(() => {
    if (!selectedCategory) return;
    lastKnownCategoryIdRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    const currentQueryString = searchParams.toString();
    if (currentQueryString && currentQueryString === lastInternalQuerySyncRef.current) {
      return;
    }
    shouldHydrateCommittedFiltersRef.current = true;
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
      if (brand != null) setSelectedBrand(brand.split(',').map((v) => v.trim()).filter(Boolean));
      const vendor = searchParams.get('vendor');
      if (vendor != null) setSelectedVendor(vendor.split(',').map((v) => v.trim()).filter(Boolean));
      const sort = searchParams.get('sort');
      if (sort != null) setSortBy(sort);
      const minP = searchParams.get('minPrice');
      if (minP != null) setMinPrice(minP);
      const maxP = searchParams.get('maxPrice');
      if (maxP != null) setMaxPrice(maxP);
      const minQ = searchParams.get('minQuantity');
      if (minQ != null) setMinQuantity(minQ);
      const mc = searchParams.get('metalColor');
      if (mc != null) setMetalColor(mc.split(',').map((v) => v.trim()).filter(Boolean));
      const mt = searchParams.get('metalType');
      if (mt != null) setMetalType(mt.split(',').map((v) => v.trim()).filter(Boolean));
      const sz = searchParams.get('size');
      if (sz != null) setSize(sz.split(',').map((v) => v.trim()).filter(Boolean));
      const st = searchParams.get('stonetype');
      if (st != null) setStonetype(st.split(',').map((v) => v.trim()).filter(Boolean));
      const cc = searchParams.get('centerclarity');
      if (cc != null) setCenterclarity(cc.split(',').map((v) => v.trim()).filter(Boolean));
      const attrFromUrl: Record<string, string[]> = {};
      searchParams.forEach((value, key) => {
        if (KNOWN_URL_PARAMS.has(key)) return;
        const vals = value.split(',').map((s) => s.trim()).filter(Boolean);
        if (vals.length) attrFromUrl[key] = vals;
      });
      if (Object.keys(attrFromUrl).length) setAttributeFilters(attrFromUrl);
      const rangeFromUrl: Record<string, { min: number; max: number }> = {};
      RANGE_ATTRIBUTE_FILTER_KEYS.forEach((attrKey) => {
        const minRaw = searchParams.get(`${attrKey}Min`);
        const maxRaw = searchParams.get(`${attrKey}Max`);
        if (minRaw == null || maxRaw == null) return;
        const minVal = Number(minRaw);
        const maxVal = Number(maxRaw);
        if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return;
        rangeFromUrl[attrKey] = {
          min: Math.min(minVal, maxVal),
          max: Math.max(minVal, maxVal),
        };
      });
      setAttributeRangeFilters(rangeFromUrl);
    }
  }, [searchParams]);

  // Vendor filter is Super Admin only: strip selections + API param for everyone else
  useEffect(() => {
    if (userLoading) return;
    if (isSuperAdmin) return;
    setSelectedVendor([]);
    setVendorSearchDraft('');
    setCommittedFilterQuery((prev) => {
      if (prev?.vendor == null || String(prev.vendor).trim() === '') return prev;
      const next = { ...prev };
      delete next.vendor;
      return next;
    });
  }, [userLoading, isSuperAdmin]);

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
    selectedCategory || null
  );

  // Fetch sub-subcategories when subcategory is selected
  const { data: subsubcategories, isLoading: subsubcategoriesLoading } = useV2SubSubcategoriesBySubCategoryQuery(
    selectedSubcategory || null
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
  const pendingFilterQuery = useMemo(() => {
    const query: any = {};
    if (debouncedSearchText.trim()) query.search = debouncedSearchText.trim();
    if (selectedBrand.length) query.brand = selectedBrand.join(',');
    if (isSuperAdmin && selectedVendor.length) query.vendor = selectedVendor.join(',');
    // Keep full hierarchy in URL/state so back-navigation can always restore parent context.
    if (selectedCategory) query.category = selectedCategory;
    if (selectedSubcategory) query.subcategory = selectedSubcategory;
    if (selectedSubsubcategory) query.subsubcategory = selectedSubsubcategory;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    /** Always send sort so facet scope + API stay in sync (featured = All Inventory, same as backend default). */
    if (sortBy) query.sort = sortBy;
    if (minQuantity) query.minQuantity = minQuantity;
    if (metalColor.length) query.metalColor = metalColor.join(',');
    if (metalType.length) query.metalType = metalType.join(',');
    if (size.length) query.size = size.join(',');
    if (stonetype.length) query.stonetype = stonetype.join(',');
    if (centerclarity.length) query.centerclarity = centerclarity.join(',');
    Object.entries(attributeFilters).forEach(([key, values]) => {
      if (key === 'vendor') return;
      if (values.length) query[key] = values.length === 1 ? values[0] : values.join(',');
    });
    return query;
  }, [
    debouncedSearchText,
    isSuperAdmin,
    selectedBrand,
    selectedCategory,
    selectedSubcategory,
    selectedSubsubcategory,
    selectedVendor,
    minPrice,
    maxPrice,
    sortBy,
    minQuantity,
    metalColor,
    metalType,
    size,
    stonetype,
    centerclarity,
    attributeFilters,
  ]);

  useEffect(() => {
    if (viewMode !== 'products') return;
    if (!shouldHydrateCommittedFiltersRef.current) return;
    setCommittedFilterQuery(pendingFilterQuery);
    shouldHydrateCommittedFiltersRef.current = false;
  }, [viewMode, pendingFilterQuery]);

  // Top bar filters (search/sort) should apply immediately.
  // Drawer filters still wait for "View results" while the drawer is open.
  useEffect(() => {
    if (viewMode !== 'products') return;
    if (showFilters) return;
    if (shouldHydrateCommittedFiltersRef.current) return;
    setCommittedFilterQuery((prev) => {
      if (areQueriesEqual(prev, pendingFilterQuery)) return prev;
      return pendingFilterQuery;
    });
  }, [viewMode, showFilters, pendingFilterQuery]);

  // Sync products view state to URL so Back from product detail can restore
  const listingQueryString = useMemo(() => {
    if (viewMode !== 'products') return '';
    const params = new URLSearchParams();
    params.set('view', 'products');
    Object.entries(committedFilterQuery).forEach(([key, value]) => {
      if (value == null || String(value).trim() === '') return;
      params.set(key, String(value));
    });
    return params.toString();
  }, [viewMode, committedFilterQuery]);

  useEffect(() => {
    if (viewMode !== 'products' || !listingQueryString) return;
    lastInternalQuerySyncRef.current = listingQueryString;
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
    newQuery: committedFilterQuery,
  } as any);

  const serverFilters = useMemo<ListingFilters | null>(() => {
    return (data?.pages?.[0]?.filters as ListingFilters) || null;
  }, [data]);

  const facetSortKey = useMemo(
    () =>
      String(committedFilterQuery?.sort ?? sortBy ?? 'isMain')
        .trim()
        .toLowerCase() || 'isMain',
    [committedFilterQuery, sortBy]
  );

  const facetScopeKey = useMemo(
    () => `${selectedCategory || ''}|${selectedSubcategory || ''}|${selectedSubsubcategory || ''}|${facetSortKey}`,
    [selectedCategory, selectedSubcategory, selectedSubsubcategory, facetSortKey]
  );

  useEffect(() => {
    setCategoryScopedFilters(null);
  }, [facetScopeKey]);

  useEffect(() => {
    if (!serverFilters) return;
    // Wait for the active query to settle before capturing facets.
    // This avoids locking stale filters from previous sort scope.
    if (isLoading) return;
    setCategoryScopedFilters((prev) => prev || serverFilters);
  }, [serverFilters, isLoading]);

  const effectiveServerFilters: ListingFilters | null = categoryScopedFilters || serverFilters;

  // Extract unique brands and category names from products (for filter dropdown)
  const { brands, productCategories } = useMemo(() => {
    if (effectiveServerFilters) {
      return {
        brands: (effectiveServerFilters.brands || []).slice(),
        productCategories: [],
      };
    }
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
  }, [data, effectiveServerFilters]);

  const getSearchedOptions = useCallback(
    (allOptions: string[], searchTerm: string, selectedOptions: string[]) => {
      if (!allOptions.length) return [];
      const q = searchTerm.trim().toLowerCase();
      const selectedSet = new Set(selectedOptions);
      const isLarge = allOptions.length > BRAND_LARGE_LIST_THRESHOLD;
      if (isLarge && q.length < BRAND_SEARCH_MIN_CHARS) {
        return allOptions.filter((option) => selectedSet.has(option));
      }
      if (!q) return allOptions.slice(0, BRAND_RESULT_CAP);
      return allOptions
        .filter((option) => String(option).toLowerCase().includes(q))
        .slice(0, BRAND_RESULT_CAP);
    },
    []
  );

  const filteredBrands = useMemo(
    () => getSearchedOptions(brands, brandSearchDraft, selectedBrand),
    [brands, brandSearchDraft, selectedBrand, getSearchedOptions]
  );

  // Dynamic attribute filters: derive from current products' defaultSku.attributes (dropdown/checkbox options)
  const SKIP_ATTRIBUTE_KEYS = new Set(['featureimageslink', 'galleryimagelink', 'descriptionname', 'stonetype', 'centerclarity']);
  const availableAttributes = useMemo(() => {
    if (effectiveServerFilters) {
      return effectiveServerFilters.availableAttributes || [];
    }
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
  }, [data, effectiveServerFilters]);

  const vendorAttribute = useMemo(
    () => availableAttributes.find((a) => String(a?._id || '').toLowerCase() === 'vendor') || null,
    [availableAttributes]
  );
  const vendorOptions = useMemo(() => vendorAttribute?.values || [], [vendorAttribute]);
  const filteredVendors = useMemo(
    () => getSearchedOptions(vendorOptions, vendorSearchDraft, selectedVendor),
    [vendorOptions, vendorSearchDraft, selectedVendor, getSearchedOptions]
  );
  const nonVendorAttributes = useMemo(
    () => availableAttributes.filter((a) => String(a?._id || '').toLowerCase() !== 'vendor'),
    [availableAttributes]
  );

  const rangeAttributeMeta = useMemo(() => {
    const meta: Record<string, RangeAttributeMeta> = {};
    availableAttributes.forEach((attr) => {
      if (!RANGE_ATTRIBUTE_FILTER_KEY_SET.has(attr?._id)) return;
      const numericValues = (attr?.values || [])
        .map((raw) => ({ raw, num: Number(raw) }))
        .filter((entry) => Number.isFinite(entry.num))
        .sort((a, b) => a.num - b.num);
      if (numericValues.length === 0) return;
      meta[attr._id] = {
        values: numericValues,
        min: numericValues[0].num,
        max: numericValues[numericValues.length - 1].num,
      };
    });
    return meta;
  }, [availableAttributes]);

  useEffect(() => {
    setAttributeRangeFilters((prev) => {
      const next: Record<string, { min: number; max: number }> = {};
      Object.entries(prev).forEach(([key, selected]) => {
        const meta = rangeAttributeMeta[key];
        if (!meta) return;
        const clampedMin = Math.max(meta.min, Math.min(selected.min, selected.max));
        const clampedMax = Math.min(meta.max, Math.max(selected.min, selected.max));
        next[key] = { min: clampedMin, max: clampedMax };
      });
      return next;
    });
  }, [rangeAttributeMeta]);

  const updateAttributeRangeFilter = useCallback((key: string, min: number, max: number) => {
    const meta = rangeAttributeMeta[key];
    if (!meta) return;
    const nextMin = Math.max(meta.min, Math.min(min, max));
    const nextMax = Math.min(meta.max, Math.max(min, max));
    setAttributeRangeFilters((prev) => {
      const next = { ...prev };
      next[key] = { min: nextMin, max: nextMax };
      return next;
    });
  }, [rangeAttributeMeta]);

  useEffect(() => {
    const desiredRangeSelections: Record<string, string[]> = {};
    Object.entries(attributeRangeFilters).forEach(([key, range]) => {
      const meta = rangeAttributeMeta[key];
      if (!meta) return;
      const selectedValues = meta.values
        .filter((entry) => entry.num >= range.min && entry.num <= range.max)
        .map((entry) => entry.raw);
      if (!selectedValues.length) return;
      desiredRangeSelections[key] = selectedValues;
    });

    setAttributeFilters((prev) => {
      const next: Record<string, string[]> = {};
      Object.entries(prev).forEach(([key, values]) => {
        if (RANGE_ATTRIBUTE_FILTER_KEY_SET.has(key)) return;
        next[key] = values;
      });
      Object.entries(desiredRangeSelections).forEach(([key, values]) => {
        next[key] = values;
      });

      const prevKeys = Object.keys(prev).sort();
      const nextKeys = Object.keys(next).sort();
      if (prevKeys.length === nextKeys.length && prevKeys.every((key, idx) => key === nextKeys[idx])) {
        const unchanged = prevKeys.every((key) => {
          const prevVals = prev[key] || [];
          const nextVals = next[key] || [];
          return prevVals.length === nextVals.length && prevVals.every((value, idx) => value === nextVals[idx]);
        });
        if (unchanged) return prev;
      }
      return next;
    });
  }, [attributeRangeFilters, rangeAttributeMeta]);

  // Dynamic Metal options from defaultSku (show Metal section only if any exist)
  const { metalColors, metalTypes, sizes, hasMetal } = useMemo(() => {
    if (effectiveServerFilters) {
      const colors = effectiveServerFilters.metalColors || [];
      const types = effectiveServerFilters.metalTypes || [];
      const sz = effectiveServerFilters.sizes || [];
      return {
        metalColors: colors,
        metalTypes: types,
        sizes: sz,
        hasMetal: colors.length > 0 || types.length > 0 || sz.length > 0,
      };
    }
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
  }, [data, effectiveServerFilters]);

  // Dynamic Stone & Clarity from defaultSku.attributes (show section only if any exist)
  const { stoneTypes, centerClarities, hasStoneClarity } = useMemo(() => {
    if (effectiveServerFilters) {
      const st = effectiveServerFilters.stoneTypes || [];
      const cc = effectiveServerFilters.centerClarities || [];
      return {
        stoneTypes: st,
        centerClarities: cc,
        hasStoneClarity: st.length > 0 || cc.length > 0,
      };
    }
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
  }, [data, effectiveServerFilters]);

  const { sliderMinBound, sliderMaxBound } = useMemo(() => {
    if (effectiveServerFilters?.priceRange) {
      const minBound = Math.max(0, Math.floor(Number(effectiveServerFilters.priceRange.min || 0)));
      const maxRaw = Math.ceil(Number(effectiveServerFilters.priceRange.max || 0));
      const maxBound = maxRaw > 0 ? maxRaw : 1000;
      return { sliderMinBound: minBound, sliderMaxBound: Math.max(minBound, maxBound) };
    }
    let minCandidate = Number.POSITIVE_INFINITY;
    let maxCandidate = 0;

    data?.pages?.forEach((page: any) => {
      (page?.data || []).forEach((product: VendorProductListItem) => {
        const fallbackPrice = Number((product?.defaultSku as any)?.price ?? 0);
        const pMin = Number(product?.minPrice ?? fallbackPrice);
        const pMax = Number(product?.maxPrice ?? fallbackPrice);

        if (Number.isFinite(pMin) && pMin >= 0) minCandidate = Math.min(minCandidate, pMin);
        if (Number.isFinite(pMax) && pMax >= 0) maxCandidate = Math.max(maxCandidate, pMax);
      });
    });

    const minBound = Number.isFinite(minCandidate) ? Math.floor(minCandidate) : 0;
    const maxBound = Number.isFinite(maxCandidate) && maxCandidate > 0 ? Math.ceil(maxCandidate) : 1000;
    return { sliderMinBound: Math.max(0, minBound), sliderMaxBound: Math.max(minBound, maxBound) };
  }, [data, effectiveServerFilters]);

  const selectedMinPrice = minPrice !== '' ? Number(minPrice) : sliderMinBound;
  const selectedMaxPrice = maxPrice !== '' ? Number(maxPrice) : sliderMaxBound;
  const safeSelectedMin = Math.max(sliderMinBound, Math.min(selectedMinPrice, selectedMaxPrice));
  const safeSelectedMax = Math.min(sliderMaxBound, Math.max(selectedMaxPrice, selectedMinPrice));

  const handlePriceRangeChange = (values: number | number[]) => {
    if (!Array.isArray(values) || values.length !== 2) return;
    const nextMin = Math.max(sliderMinBound, Math.min(Number(values[0]), Number(values[1])));
    const nextMax = Math.min(sliderMaxBound, Math.max(Number(values[0]), Number(values[1])));
    setMinPrice(String(nextMin));
    setMaxPrice(String(nextMax));
  };

  const options = [
    { value: "featured", label: "All Inventory" },
    { value: "isMain", label: "Available In Main" },
    { value: "own-inventory", label: "Own inventory" },
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

  // Handle back navigation — keep URL aligned with browse view so URL-driven effects do not override state
  const handleBack = useCallback(() => {
    const pushBrowseUrl = (search: string) => {
      lastInternalQuerySyncRef.current = search;
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    };

    if (viewMode === 'subsubcategories') {
      setViewMode('subcategories');
      setSelectedSubsubcategory('');
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
      pushBrowseUrl(params.toString());
    } else if (viewMode === 'subcategories') {
      setViewMode('categories');
      setSelectedCategory('');
      setSelectedCategoryData(null);
      setSelectedSubcategory('');
      setSelectedSubcategoryData(null);
      pushBrowseUrl('');
    } else if (viewMode === 'products') {
      if (selectedSubsubcategory) {
        setViewMode('subsubcategories');
        setSelectedSubsubcategory('');
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
        pushBrowseUrl(params.toString());
      } else if (selectedSubcategory) {
        const categoryForBack =
          selectedCategory ||
          selectedCategoryData?._id ||
          lastKnownCategoryIdRef.current ||
          searchParams.get('category') ||
          '';

        setViewMode('subcategories');
        if (categoryForBack) {
          setSelectedCategory(categoryForBack);
          const categoryObj = categories?.find((c) => c._id === categoryForBack) || null;
          if (categoryObj) setSelectedCategoryData(categoryObj);
        }
        setSelectedSubcategory('');
        setSelectedSubcategoryData(null);
        const params = new URLSearchParams();
        if (categoryForBack) params.set('category', categoryForBack);
        pushBrowseUrl(params.toString());
      } else {
        setViewMode('categories');
        setSelectedCategory('');
        setSelectedCategoryData(null);
        pushBrowseUrl('');
      }
    }
  }, [
    viewMode,
    selectedCategory,
    selectedCategoryData,
    selectedSubcategory,
    selectedSubsubcategory,
    pathname,
    router,
    searchParams,
    categories,
  ]);

  const clearFilters = useCallback(() => {
    setSearchText('');
    setDebouncedSearchText('');
    setSelectedBrand([]);
    setSelectedVendor([]);
    setBrandSearchDraft('');
    setVendorSearchDraft('');
    setMetalColorSearchDraft('');
    setMetalTypeSearchDraft('');
    setSizeSearchDraft('');
    setStoneTypeSearchDraft('');
    setCenterClaritySearchDraft('');
    setAttributeOptionSearchDrafts({});
    setMinPrice('');
    setMaxPrice('');
    setSortBy('isMain');
    setMinQuantity('');
    setMetalColor([]);
    setMetalType([]);
    setSize([]);
    setStonetype([]);
    setCenterclarity([]);
    setAttributeFilters({});
    setAttributeRangeFilters({});
    setCommittedFilterQuery({});
    shouldHydrateCommittedFiltersRef.current = false;
    setViewMode('products');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const applyFilters = useCallback(() => {
    setCommittedFilterQuery(pendingFilterQuery);
    shouldHydrateCommittedFiltersRef.current = false;
    setShowFilters(false);
  }, [pendingFilterQuery]);

  const toggleMultiSelectValue = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
      setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    },
    []
  );

  useEffect(() => {
    if (showFilters) return;
    setBrandSearchDraft('');
    setVendorSearchDraft('');
    setMetalColorSearchDraft('');
    setMetalTypeSearchDraft('');
    setSizeSearchDraft('');
    setStoneTypeSearchDraft('');
    setCenterClaritySearchDraft('');
    setAttributeOptionSearchDrafts({});
  }, [showFilters]);

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

  const hasActiveFilters =
    debouncedSearchText ||
    selectedBrand.length > 0 ||
    (isSuperAdmin && selectedVendor.length > 0) ||
    minPrice ||
    maxPrice ||
    minQuantity ||
    metalColor.length > 0 ||
    metalType.length > 0 ||
    size.length > 0 ||
    stonetype.length > 0 ||
    centerclarity.length > 0 ||
    Object.values(attributeFilters).some((arr) => arr.length > 0) ||
    Object.keys(attributeRangeFilters).length > 0 ||
    (sortBy && sortBy !== 'isMain');

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
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {categories.map((category : any) => (
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
        {viewMode === 'subcategories' && selectedCategory && (
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
                {subcategories.map((subcategory : any) => (
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
        {viewMode === 'subsubcategories' && selectedSubcategory && (
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
                {subsubcategories.map((subsubcategory : any) => (
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
                    key: 'sort',
                    label: 'Sort By',
                    hasActive: !!(sortBy && sortBy !== 'featured'),
                    content: (
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30 transition-colors"
                      >
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ),
                  },
                  {
                    key: 'brand',
                    label: 'Brand',
                    hasActive: selectedBrand.length > 0,
                    content: (
                      <div className="space-y-3">
                        {selectedBrand.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedBrand.map((b) => (
                              <span
                                key={b}
                                className="inline-flex items-center gap-1 max-w-full pl-2 pr-1 py-0.5 rounded-full bg-[#1a1a1a]/8 text-xs text-gray-800"
                              >
                                <span className="truncate max-w-[200px]" title={b}>
                                  {b}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Remove ${b}`}
                                  className="p-0.5 rounded-full hover:bg-black/10 shrink-0"
                                  onClick={() =>
                                    setSelectedBrand((prev) => prev.filter((x) => x !== b))
                                  }
                                >
                                  <X size={12} strokeWidth={2.5} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={16}
                          />
                          <input
                            type="text"
                            value={brandSearchDraft}
                            onChange={(e) => setBrandSearchDraft(e.target.value)}
                            placeholder="Search brands…"
                            className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                          />
                          {brandSearchDraft ? (
                            <button
                              type="button"
                              aria-label="Clear brand search"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
                              onClick={() => setBrandSearchDraft('')}
                            >
                              <X size={14} />
                            </button>
                          ) : null}
                        </div>
                        {brands.length > BRAND_LARGE_LIST_THRESHOLD &&
                          brandSearchDraft.trim().length < BRAND_SEARCH_MIN_CHARS && (
                            <p className="text-[11px] text-gray-500 leading-snug">
                              {brands.length.toLocaleString()} brands — type at least{' '}
                              {BRAND_SEARCH_MIN_CHARS} characters to search, or manage selected
                              brands below.
                            </p>
                          )}
                        <div className="max-h-52 overflow-y-auto pr-1 space-y-1 border border-[#eee] rounded-lg p-1 bg-[#fafafa]">
                          {filteredBrands.map((brand) => (
                                  <label
                                    key={brand}
                                    className={cn(
                                      'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                      selectedBrand.includes(brand)
                                        ? 'bg-[#1a1a1a]/5'
                                        : 'hover:bg-white'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedBrand.includes(brand)}
                                      onChange={() => toggleMultiSelectValue(setSelectedBrand, brand)}
                                      className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30 shrink-0"
                                    />
                                    <span className="text-gray-800 truncate min-w-0">{brand}</span>
                                  </label>
                                ))}
                          {filteredBrands.length === 0 && (
                                  <p className="text-xs text-gray-500 px-2 py-3 text-center">
                                    {brands.length === 0
                                      ? 'No brands in this listing scope yet.'
                                      : brands.length > BRAND_LARGE_LIST_THRESHOLD &&
                                          brandSearchDraft.trim().length < BRAND_SEARCH_MIN_CHARS
                                        ? 'Type to search brands, or select from chips above.'
                                        : 'No brands match your search.'}
                                  </p>
                                )}
                        </div>
                      </div>
                    ),
                  },
                  ...(isSuperAdmin
                    ? [
                        {
                          key: 'vendor',
                          label: 'Vendor',
                          hasActive: selectedVendor.length > 0,
                          content: (
                            <div className="space-y-3">
                              <div className="relative">
                                <Search
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                  size={16}
                                />
                                <input
                                  type="text"
                                  value={vendorSearchDraft}
                                  onChange={(e) => setVendorSearchDraft(e.target.value)}
                                  placeholder="Search vendors…"
                                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                                />
                              </div>
                              <div className="max-h-52 overflow-y-auto pr-1 space-y-1 border border-[#eee] rounded-lg p-1 bg-[#fafafa]">
                                {filteredVendors.map((v) => (
                                  <label
                                    key={v}
                                    className={cn(
                                      'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                      selectedVendor.includes(v) ? 'bg-[#1a1a1a]/5' : 'hover:bg-white'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedVendor.includes(v)}
                                      onChange={() => toggleMultiSelectValue(setSelectedVendor, v)}
                                      className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30 shrink-0"
                                    />
                                    <span className="text-gray-800 truncate min-w-0">{v}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ),
                        },
                      ]
                    : []),
                  {
                    key: 'price',
                    label: 'Price Range',
                    hasActive: !!(minPrice || maxPrice),
                    content: (
                      <div className="space-y-4">
                        <div className="px-1 pt-2">
                          <Slider
                            range
                            min={sliderMinBound}
                            max={sliderMaxBound}
                            value={[safeSelectedMin, safeSelectedMax]}
                            onChange={handlePriceRangeChange}
                            allowCross={false}
                            step={1}
                            trackStyle={[{ backgroundColor: '#2563eb', height: 6 }]}
                            railStyle={{ backgroundColor: '#e5e7eb', height: 6 }}
                            handleStyle={[
                              { borderColor: '#2563eb', width: 16, height: 16, marginTop: -5, backgroundColor: '#fff', opacity: 1 },
                              { borderColor: '#2563eb', width: 16, height: 16, marginTop: -5, backgroundColor: '#fff', opacity: 1 },
                            ]}
                          />
                          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                            <span>${safeSelectedMin}</span>
                            <span>${safeSelectedMax}</span>
                          </div>
                        </div>

                        {/* <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Min (USD)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={minPrice}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === '') return setMinPrice('');
                                const parsed = Math.max(0, Number(next));
                                setMinPrice(String(Math.min(parsed, safeSelectedMax)));
                              }}
                              min={0}
                              step={1}
                              className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Max (USD)</label>
                            <input
                              type="number"
                              placeholder="—"
                              value={maxPrice}
                              onChange={(e) => {
                                const next = e.target.value;
                                if (next === '') return setMaxPrice('');
                                const parsed = Math.max(0, Number(next));
                                setMaxPrice(String(Math.max(parsed, safeSelectedMin)));
                              }}
                              min={0}
                              step={1}
                              className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                            />
                          </div>
                        </div> */}
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
                          hasActive: metalColor.length > 0 || metalType.length > 0 || size.length > 0,
                          content: (
                            <div className="space-y-3">
                              {metalColors.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                                  <input
                                    type="text"
                                    value={metalColorSearchDraft}
                                    onChange={(e) => setMetalColorSearchDraft(e.target.value)}
                                    placeholder="Search color..."
                                    className="w-full mb-2 px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  />
                                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1">
                                    {getSearchedOptions(metalColors, metalColorSearchDraft, metalColor).map((c) => (
                                      <label
                                        key={c}
                                        className={cn(
                                          'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                          metalColor.includes(c) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={metalColor.includes(c)}
                                          onChange={() => toggleMultiSelectValue(setMetalColor, c)}
                                          className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                                        />
                                        <span className="text-gray-800 truncate">{c}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {metalTypes?.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                                  <input
                                    type="text"
                                    value={metalTypeSearchDraft}
                                    onChange={(e) => setMetalTypeSearchDraft(e.target.value)}
                                    placeholder="Search type..."
                                    className="w-full mb-2 px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  />
                                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
                                    {getSearchedOptions(metalTypes, metalTypeSearchDraft, metalType).map((t) => (
                                      <label
                                        key={t}
                                        className={cn(
                                          'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                          metalType.includes(t) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={metalType.includes(t)}
                                          onChange={() => toggleMultiSelectValue(setMetalType, t)}
                                          className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                                        />
                                        <span className="text-gray-800 truncate">{t || '-'}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {sizes?.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                                  <input
                                    type="text"
                                    value={sizeSearchDraft}
                                    onChange={(e) => setSizeSearchDraft(e.target.value)}
                                    placeholder="Search size..."
                                    className="w-full mb-2 px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  />
                                  <div className="max-h-24 overflow-y-auto pr-1 space-y-1.5">
                                    {getSearchedOptions(sizes, sizeSearchDraft, size).map((s) => (
                                      <label
                                        key={s}
                                        className={cn(
                                          'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                          size.includes(s) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={size.includes(s)}
                                          onChange={() => toggleMultiSelectValue(setSize, s)}
                                          className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                                        />
                                        <span className="text-gray-800 truncate">{s || '-'}</span>
                                      </label>
                                    ))}
                                  </div>
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
                          hasActive: stonetype.length > 0 || centerclarity.length > 0,
                          content: (
                            <div className="space-y-3">
                              {stoneTypes.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Stone Type</label>
                                  <input
                                    type="text"
                                    value={stoneTypeSearchDraft}
                                    onChange={(e) => setStoneTypeSearchDraft(e.target.value)}
                                    placeholder="Search stone..."
                                    className="w-full mb-2 px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  />
                                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
                                    {getSearchedOptions(stoneTypes, stoneTypeSearchDraft, stonetype).map((v) => (
                                      <label
                                        key={v}
                                        className={cn(
                                          'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                          stonetype.includes(v) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={stonetype.includes(v)}
                                          onChange={() => toggleMultiSelectValue(setStonetype, v)}
                                          className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                                        />
                                        <span className="text-gray-800 truncate">{v || '-'}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {centerClarities.length > 0 && (
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Center Clarity</label>
                                  <input
                                    type="text"
                                    value={centerClaritySearchDraft}
                                    onChange={(e) => setCenterClaritySearchDraft(e.target.value)}
                                    placeholder="Search clarity..."
                                    className="w-full mb-2 px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                                  />
                                  <div className="max-h-36 overflow-y-auto pr-1 space-y-1.5">
                                    {getSearchedOptions(centerClarities, centerClaritySearchDraft, centerclarity).map((v) => (
                                      <label
                                        key={v}
                                        className={cn(
                                          'flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 text-sm transition-colors',
                                          centerclarity.includes(v) ? 'bg-[#1a1a1a]/5' : 'hover:bg-[#1a1a1a]/[0.03]'
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={centerclarity.includes(v)}
                                          onChange={() => toggleMultiSelectValue(setCenterclarity, v)}
                                          className="rounded border-[#d0d0d0] text-[#1a1a1a] focus:ring-[#1a1a1a]/30"
                                        />
                                        <span className="text-gray-800 truncate">{v || '-'}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                    ...nonVendorAttributes.map((attr) => {
                    const selected = attributeFilters[attr?._id] ?? [];
                    const label = attr._id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                    const rangeMeta = rangeAttributeMeta[attr?._id];
                    if (rangeMeta) {
                      const selectedRange = attributeRangeFilters[attr._id];
                      const selectedMin = selectedRange?.min ?? rangeMeta.min;
                      const selectedMax = selectedRange?.max ?? rangeMeta.max;
                      const safeMin = Math.max(rangeMeta.min, Math.min(selectedMin, selectedMax));
                      const safeMax = Math.min(rangeMeta.max, Math.max(selectedMin, selectedMax));
                      const isSingleValueRange = rangeMeta.min === rangeMeta.max;
                      return {
                        key: `attr-${attr?._id}`,
                        label,
                        hasActive: !!selectedRange,
                        content: (
                          <div className="space-y-4">
                            {!isSingleValueRange ? (
                              <div className="px-1 pt-2">
                                <Slider
                                  range
                                  min={rangeMeta.min}
                                  max={rangeMeta.max}
                                  value={[safeMin, safeMax]}
                                  onChange={(values) => {
                                    if (!Array.isArray(values) || values.length !== 2) return;
                                    updateAttributeRangeFilter(attr._id, Number(values[0]), Number(values[1]));
                                  }}
                                  allowCross={false}
                                  step={0.01}
                                  trackStyle={[{ backgroundColor: '#2563eb', height: 6 }]}
                                  railStyle={{ backgroundColor: '#e5e7eb', height: 6 }}
                                  handleStyle={[
                                    { borderColor: '#2563eb', width: 16, height: 16, marginTop: -5, backgroundColor: '#fff', opacity: 1 },
                                    { borderColor: '#2563eb', width: 16, height: 16, marginTop: -5, backgroundColor: '#fff', opacity: 1 },
                                  ]}
                                />
                                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                                  <span>{safeMin}</span>
                                  <span>{safeMax}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">Only one value available: {rangeMeta.min}</p>
                            )}

                            {/* <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Min</label>
                                <input
                                  type="number"
                                  value={safeMin}
                                  onChange={(e) => {
                                    const next = Number(e.target.value);
                                    if (!Number.isFinite(next)) return;
                                    updateAttributeRangeFilter(attr._id, next, safeMax);
                                  }}
                                  min={rangeMeta.min}
                                  max={safeMax}
                                  step={0.01}
                                  className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Max</label>
                                <input
                                  type="number"
                                  value={safeMax}
                                  onChange={(e) => {
                                    const next = Number(e.target.value);
                                    if (!Number.isFinite(next)) return;
                                    updateAttributeRangeFilter(attr._id, safeMin, next);
                                  }}
                                  min={safeMin}
                                  max={rangeMeta.max}
                                  step={0.01}
                                  className="w-full px-3 py-2.5 text-sm border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10 focus:border-[#1a1a1a]/30"
                                />
                              </div>
                            </div> */}
                          </div>
                        ),
                      };
                    }
                    return {
                      key: `attr-${attr?._id}`,
                      label,
                      hasActive: selected?.length > 0,
                      content: (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={attributeOptionSearchDrafts[attr._id] || ''}
                            onChange={(e) =>
                              setAttributeOptionSearchDrafts((prev) => ({
                                ...prev,
                                [attr._id]: e.target.value,
                              }))
                            }
                            placeholder={`Search ${label}...`}
                            className="w-full px-3 py-2 text-xs border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/10"
                          />
                          <div className="max-h-44 overflow-y-auto pr-1 space-y-1.5">
                          {getSearchedOptions(
                            attr.values,
                            attributeOptionSearchDrafts[attr._id] || '',
                            selected
                          ).map((val) => (
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
                          </div>
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
                        onClick={() => setOpenFilterKey((k: any) => (k === item?.key ? null : item?.key))}
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
                  onClick={applyFilters}
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
