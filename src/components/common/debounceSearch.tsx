import React from 'react';
import SearchIcon from '../icons/search-icon';
import CloseIcon from '../icons/close-icon';
import { cn } from '@/lib/utils';

const DebounceSearch = ({ searchQuery, setSearchQuery, placeholder='Search' }: any) => {
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
                'text-heading outline-none w-full h-[52px] ltr:pl-5 rtl:pr-5 md:ltr:pl-6 md:rtl:pr-6 ltr:pr-14 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16 text-brand-dark text-sm lg:text-15px  transition-all duration-200 focus:border-brand-button-hover focus:ring-0 placeholder:text-brand-muted placeholder:text-[14px] rounded-full border-none bg-[#EAECED]',
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
      </div>
    </div>

    //   {/* End of Search */}
  );
};

export default DebounceSearch;
