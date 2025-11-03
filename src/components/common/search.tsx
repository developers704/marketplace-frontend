'use client';
import { forwardRef, useState } from 'react';
import cn from 'classnames';
import { useSearchQuery } from '@framework/product/use-search';
import SearchBox from '@components/common/search-box';
import SearchProduct from '@components/common/search-product';
import SearchResultLoader from '@components/ui/loaders/search-result-loader';
import useFreezeBodyScroll from '@utils/use-freeze-body-scroll';
import Scrollbar from '@components/ui/scrollbar';
import { useUI } from '@contexts/ui.context';
import { Product } from '@framework/types';

type Props = {
  lang: string;
  className?: string;
  searchId?: string;
  variant?: 'border' | 'fill';
};

const Search = forwardRef<HTMLDivElement, Props>(
  (
    {
      className = 'md:w-[730px] 2xl:w-[800px] rounded-full',
      searchId = 'search',
      variant = 'border',
      lang,
    },
    ref,
  ) => {
    const {
      displayMobileSearch,
      closeMobileSearch,
      displaySearch,
      closeSearch,
    } = useUI();
    const [searchText, setSearchText] = useState('');
    const [inputFocus, setInputFocus] = useState<boolean>(false);
    // const { data, isLoading } = useSearchQuery({
    //   text: searchText,
    // });
    useFreezeBodyScroll(
      inputFocus === true || displaySearch || displayMobileSearch,
    );
    function handleSearch(e: React.SyntheticEvent) {
      e.preventDefault();
    }
    function handleAutoSearch(e: React.FormEvent<HTMLInputElement>) {
      setSearchText(e.currentTarget.value);
    }
    function clear() {
      setSearchText('');
      setInputFocus(false);
      closeMobileSearch();
      closeSearch();
    }
    function enableInputFocus() {
      setInputFocus(true);
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full transition-all duration-200 ease-in-out',
          className,
        )}
      >
        {/* <div
          className={cn(
            'overlay cursor-pointer invisible w-full h-full opacity-0 flex top-0 ltr:left-0 rtl:right-0 transition-all duration-300 fixed',
            {
              open: displayMobileSearch,
              'input-focus-overlay-open': inputFocus === true,
              'open-search-overlay': displaySearch,
            },
          )}
          onClick={() => clear()}
        // /> */}
        {/* End of overlay */}

        <div className="relative z-30 flex flex-col justify-center w-full shrink-0 ">
          <div className="flex flex-col w-full mx-auto ">
            <SearchBox
              searchId={searchId}
              name="search"
              value={searchText}
              onSubmit={handleSearch}
              onChange={handleAutoSearch}
              onClear={clear}
              onFocus={() => enableInputFocus()}
              variant={variant}
              lang={lang}
            />
          </div>
        </div>
      </div>
    );
  },
);

Search.displayName = 'Search';
export default Search;
