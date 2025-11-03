'use client';
import React, { useEffect, useState } from 'react';
import SearchIcon from '../icons/search-icon';
import CloseIcon from '../icons/close-icon';
import { cn } from '@/lib/utils';
import { searchGlobal } from '@/framework/basic-rest/search/useSearch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const GlobalSearch = ({
  placeholder = 'What are you looking for?',
  lang = 'en',
}: any) => {
  const [searchQuery, setSearchQuery] = useState<any | string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [filteredResults, setFilteredResults] = useState<any>();
  const [sampleData, setSampleData] = useState<any>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchGlobalSearch = async () => {
      if (isFocused) {
        // console.log('Fetching search results...'); // Debugging
        const response = await searchGlobal();
        // console.log(response, '===>>> response');
        if (response.message === 'Invalid token. Please log in again.') {
          toast.error('Please log in to Search.');
        }
        if (response.length > 0) {
          setSampleData(response);
        } else {
          console.log('something went wrong');
        }
      }
    };
    fetchGlobalSearch();
  }, [isFocused]); // Run only when input is focused

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredResults([]);
    } else {
      // Filter sampleData based on searchQuery
      const results = sampleData.filter((item: any) =>
        item?.name.toLowerCase().includes(searchQuery),
      );
      setFilteredResults(results);
    }
  }, [searchQuery]);

  //   console.log(filteredResults, '===>>> filteredResults');

  const routeHandler = (item: any) => {
    if (item?.productType === 'Special') {
      router.push(`${lang}/specialProducts/${item?._id}`);
    } else {
      router.push(`${lang}/products/${item?._id}`);
    }
  };

  return (
    //  {/* Search */}

    <div className="relative z-30 flex flex-col justify-center w-fit shrink-0 ">
      <div className="flex flex-col w-[250px]  ">
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
              onFocus={() => setIsFocused(true)} // ✅ Set focus to true
              onBlur={() => setIsFocused(false)} // ✅ Set focus to false when unfocused
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
        {filteredResults?.length > 0 && (
          <ul className="absolute top-[55px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
            {filteredResults.map((item: any, index: number) => (
              // href={`/${lang}/${item?.category[0].name}/${item?.subcategory[0]?.name}/${item?.name}?id=${item?._id}`}
              <Link
                href={
                  item?.productType === 'Special'
                    ? `/${lang}/specialProducts/${item?._id}`
                    : item?.productType === 'Regular'
                      ? `/${lang}/${item?.category[0].name}/${item?.subcategory[0]?.name}/${item?.name}?id=${item?._id}`
                      : ''
                }
                key={index}
                className="px-4 block py-2 cursor-pointer hover:bg-gray-100"
                // onMouseDown={() => setSearchQuery(item?.name)} // Prevents onBlur from closing too soon
                onClick={() => {
                  setSearchQuery(item?.name);
                  routeHandler(item);
                }}
              >
                {item?.name}
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>

    //   {/* End of Search */}
  );
};

export default GlobalSearch;
