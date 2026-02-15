'use client';
import React, { useEffect, useState, useCallback } from 'react';
import SearchIcon from '../icons/search-icon';
import CloseIcon from '../icons/close-icon';
import { cn } from '@/lib/utils';
import { searchV2Products } from '@/framework/basic-rest/search/useSearch';
import type { VendorProductListItem } from '@/framework/basic-rest/types/catalogV2';
import { useRouter } from 'next/navigation';

const DEBOUNCE_MS = 300;

const GlobalSearch = ({
  placeholder = 'Search by product name, SKU, or vendor model...',
  lang = 'en',
}: any) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VendorProductListItem[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  // Debounce search input (same idea as marketplace page)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch v2 products by search (same API as marketplace)
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchV2Products(debouncedQuery).then((data) => {
      console.log(data,"data images")
      if (!cancelled) {
        setSearchResults(Array.isArray(data) ? data : []);
        setIsSearching(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setSearchResults([]);
        setIsSearching(false);
      }
    });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const goToProduct = useCallback((product: VendorProductListItem) => {
    if (!product?._id) return;
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/${lang}/marketplace/${product?._id}`);
  }, [lang, router]);

  return (
    //  {/* Search */}

    <div className="relative z-30 flex flex-col justify-center w-fit shrink-0">
      <div className="flex flex-col w-[380px]  ">
        <div
          className="relative flex w-full rounded-full"
          // noValidate
          role="search"
          // onSubmit={onSubmit}
        >
          <label
            // htmlFor={searchId}
            className="flex flex-1 items-center py-0.5 rounded-full"
          >
            <input
              // id={searchId}
              className={cn(
                'text-heading outline-none w-full h-[52px] ltr:pl-5 rtl:pr-5 md:ltr:pl-6 md:rtl:pr-6 ltr:pr-14 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16 text-brand-dark text-sm lg:text-15px  transition-all duration-200 focus:border-brand-button-hover focus:ring-0 placeholder:text-brand-muted placeholder:text-[13px] rounded-full border-none bg-[#EAECED]',
                // {
                //   'border border-border-base': variant === 'border',
                //   'bg-fill-one': variant === 'fill',
                // },
              )}
              placeholder={placeholder}
              // aria-label={searchId}
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // onFocus={onFocus}
              // ref={ref}
              // {...rest}
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
        {searchQuery && (searchResults?.length > 0 || isSearching || debouncedQuery) && (
          <ul className="absolute top-[55px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto z-50">
            {isSearching ? (
              <li className="px-4 py-3 text-brand-muted text-sm">Searching...</li>
            ) : searchResults?.length === 0 ? (
              <li className="px-4 py-3 text-brand-muted text-sm">No products found.</li>
            ) : (
              searchResults?.map((item) => (
                <li key={item?._id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProduct(item)}
                  >
                    <span className="text-sm">{item?.defaultSku?.attributes?.descriptionname || item?.vendorModel || '-'}</span>
                    {item?.brand ? (
                      <span className="ml-2 text-brand-muted text-sm  font-medium ">({item?.brand || "-"})</span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>

    //   {/* End of Search */}
  );
};

export default GlobalSearch;
