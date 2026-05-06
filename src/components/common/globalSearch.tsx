'use client';

import React, { useEffect, useLayoutEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import SearchIcon from '../icons/search-icon';
import CloseIcon from '../icons/close-icon';
import { cn, getImageUrl } from '@/lib/utils';
import { searchV2Products } from '@framework/search/useSearch';
import type { VendorProductListItem } from '@framework/types/catalogV2';
import { useRouter } from 'next/navigation';
import usePrice from '@framework/product/use-price';
import { productPlaceholder } from '@assets/placeholders';

const DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 96;

function subcategoryLabel(product: VendorProductListItem): string {
  const s = product?.subcategory;
  if (!s) return '';
  return typeof s === 'string' ? s : s?.name || '';
}

function SearchResultTile({
  product,
  onSelect,
}: {
  product: VendorProductListItem;
  onSelect: (p: VendorProductListItem) => void;
}) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
  const sku = product?.defaultSku;
  const rawImg = sku?.images?.[0] || sku?.gallery?.[0];
  const fallbackSrc =
    typeof productPlaceholder === 'string'
      ? productPlaceholder
      : String(productPlaceholder?.src ?? '');
  const imageSrc = useMemo(() => {
    if (!rawImg) return fallbackSrc;
    const u = getImageUrl(BASE_API, rawImg, fallbackSrc);
    return u || fallbackSrc;
  }, [BASE_API, rawImg, fallbackSrc]);

  const title = sku?.attributes?.descriptionname || product?.title || product?.vendorModel || '-';
  const amount = Number(sku?.price ?? product?.minPrice ?? 0);
  const { price: priceLabel } = usePrice({
    amount: Number.isFinite(amount) ? amount : 0,
    currencyCode: sku?.currency || 'USD',
  });
  const sub = subcategoryLabel(product);
  const vendorLabel = (product.vendorModelKey || product.vendorModel || '').trim();

  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(product)}
      className="group w-full rounded-lg border border-gray-200 bg-white p-1.5 text-left hover:border-brand-blue/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 20vw, 10vw"
          unoptimized={String(imageSrc).startsWith('http')}
        />
      </div>
      <div className="px-0.5 pt-1.5">
        <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-brand-dark" title={title}>
          {title}
        </p>
        {vendorLabel ? (
          <p
            className="mt-0.5 line-clamp-1 text-[9px] font-medium text-gray-700"
            title={vendorLabel}
          >
            {vendorLabel}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] font-bold text-brand-dark tabular-nums">{priceLabel}</p>
        {sub ? <p className="mt-0.5 line-clamp-1 text-[9px] text-gray-500">{sub}</p> : null}
      </div>
    </button>
  );
}

const GlobalSearch = ({
  placeholder = 'Search by product name, SKU, or vendor model...',
  lang = 'en',
}: {
  placeholder?: string;
  lang?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VendorProductListItem[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [panelLayout, setPanelLayout] = useState<{ top: number; height: number } | null>(null);

  const updatePanelLayout = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const top = Math.max(0, r.bottom + 6);
    const height = Math.max(220, viewportHeight - top - 8);
    setPanelLayout({ top, height });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      setIsLoadingMore(false);
      setHasNextPage(false);
      setNextPage(null);
      setTotalMatches(0);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchV2Products({ searchQuery: debouncedQuery, page: 1, limit: SEARCH_LIMIT })
      .then((res) => {
        if (cancelled) return;
        setSearchResults(res.items);
        setHasNextPage(res.hasNextPage);
        setNextPage(res.nextPage);
        setTotalMatches(res.total);
        setIsSearching(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSearchResults([]);
        setHasNextPage(false);
        setNextPage(null);
        setTotalMatches(0);
        setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const fetchMore = useCallback(async () => {
    if (!debouncedQuery || !hasNextPage || !nextPage || isSearching || isLoadingMore) return;
    setIsLoadingMore(true);
    const res = await searchV2Products({
      searchQuery: debouncedQuery,
      page: nextPage,
      limit: SEARCH_LIMIT,
    });
    setSearchResults((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const appended = res.items.filter((p) => !seen.has(p._id));
      return [...prev, ...appended];
    });
    setHasNextPage(res.hasNextPage);
    setNextPage(res.nextPage);
    setTotalMatches(res.total || totalMatches);
    setIsLoadingMore(false);
  }, [debouncedQuery, hasNextPage, nextPage, isSearching, isLoadingMore, totalMatches]);

  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchMore();
      },
      { root: null, rootMargin: '240px', threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, fetchMore]);

  const goToProduct = useCallback(
    (product: VendorProductListItem) => {
      if (!product?._id) return;
      setSearchQuery('');
      setSearchResults([]);
      setHasNextPage(false);
      setNextPage(null);
      router.push(`/${lang}/marketplace/${product?._id}`);
    },
    [lang, router]
  );

  const showPanel = Boolean(searchQuery && (searchResults.length > 0 || isSearching || debouncedQuery));

  /** e.g. profile "Change password" modal — password managers must not use this field as "username" */
  useEffect(() => {
    const clear = () => {
      setSearchQuery('');
      setDebouncedQuery('');
      setSearchResults([]);
      setHasNextPage(false);
      setNextPage(null);
      setTotalMatches(0);
      setIsSearching(false);
    };
    window.addEventListener('marketplace:clear-header-search', clear);
    return () => window.removeEventListener('marketplace:clear-header-search', clear);
  }, []);

  useLayoutEffect(() => {
    if (!showPanel) {
      setPanelLayout(null);
      return;
    }
    updatePanelLayout();
    window.addEventListener('resize', updatePanelLayout);
    window.addEventListener('scroll', updatePanelLayout, true);
    return () => {
      window.removeEventListener('resize', updatePanelLayout);
      window.removeEventListener('scroll', updatePanelLayout, true);
    };
  }, [showPanel, updatePanelLayout, isSearching, searchResults.length, debouncedQuery]);

  return (
    <div className="relative z-[100] flex w-full min-w-0 max-w-full flex-col justify-center">
      <div className="flex w-full min-w-0 max-w-[580px] flex-col sm:max-w-[580px]">
        <div ref={anchorRef} className="relative flex w-full rounded-full" role="search">
          <label className="flex flex-1 items-center py-0.5 rounded-full">
            <input
              type="search"
              name="marketplace_global_product_search"
              id="marketplace-global-product-search"
              inputMode="search"
              enterKeyHint="search"
              className={cn(
                'text-heading outline-none w-full h-[52px] ltr:pl-5 rtl:pr-5 md:ltr:pl-6 md:rtl:pr-6 ltr:pr-14 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16 text-brand-dark text-sm lg:text-15px transition-all duration-200 focus:border-brand-button-hover focus:ring-0 placeholder:text-brand-muted placeholder:text-[13px] rounded-full border-none bg-[#EAECED]'
              )}
              placeholder={placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              className="absolute top-0 flex items-center justify-center h-full transition duration-200 ease-in-out outline-none ltr:right-0 rtl:left-0 w-14 md:w-16 hover:text-heading focus:outline-none"
            >
              <CloseIcon className="w-[17px] h-[17px] text-brand-dark text-opacity-40" />
            </button>
          ) : (
            <span className="absolute top-0 flex items-center justify-center h-full w-14 md:w-16 ltr:right-0 rtl:left-0 shrink-0 focus:outline-none">
              <SearchIcon className="w-5 h-5 text-brand-dark text-opacity-40" />
            </span>
          )}
        </div>

        {showPanel && panelLayout && (
          <div
            className="fixed inset-x-0 border-y border-gray-200/90 bg-white shadow-[0_20px_56px_rgba(0,0,0,0.18)] overflow-hidden z-[200] flex flex-col"
            style={{
              top: panelLayout.top,
              height: panelLayout.height,
            }}
            role="listbox"
            aria-label="Search results"
          >
            {isSearching ? (
              <div className="px-4 py-6 text-center text-brand-muted text-sm">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-brand-muted text-sm">No products found.</div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500">
                  {totalMatches > 0
                    ? `${totalMatches.toLocaleString()} matching products`
                    : `${searchResults.length} products`}
                </div>
                <div className="overflow-y-auto overscroll-contain p-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    {searchResults.map((item) => (
                      <SearchResultTile key={item._id} product={item} onSelect={goToProduct} />
                    ))}
                  </div>
                  <div ref={loadMoreRef} className="h-8 w-full" />
                  {isLoadingMore && (
                    <div className="py-2 text-center text-xs text-brand-muted">Loading more...</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
