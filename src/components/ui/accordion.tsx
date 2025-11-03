'use client';

import cn from 'classnames';
import { Disclosure, Transition } from '@headlessui/react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useTranslation } from 'src/app/i18n/client';

type CollapseProps = {
  lang?: string;
  item?: any;
  selectedFilters?: any;
  setSelectedFilters?: any;
  translatorNS?: string;
  variant?: 'gray' | 'transparent';
};

export const Accordion: React.FC<CollapseProps> = ({
  lang,
  item,
  translatorNS,
  variant = 'gray',
  selectedFilters,
  setSelectedFilters,
}) => {
  const handleCheckboxChange = (variantName: string, value: string) => {
    const selectedFiltersCopy = { ...selectedFilters };
    if (selectedFiltersCopy[variantName]?.includes(value)) {
      selectedFiltersCopy[variantName] = selectedFiltersCopy[
        variantName
      ]?.filter((item: string) => item !== value);
      if (selectedFiltersCopy[variantName].length === 0) {
        delete selectedFiltersCopy[variantName];
      }
    } else {
      selectedFiltersCopy[variantName] = [
        ...(selectedFiltersCopy[variantName] || []),
        value,
      ];
    }
    setSelectedFilters(selectedFiltersCopy);
  };
  // console.log(item, '===>>> item');

  return (
    <div className="w-full">
      <div className="w-full mx-auto mb-4 rounded shadow-category text-brand-light group border-b-[1px]">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-5 py-4 text-base font-medium 2xl:px-6 2xl:py-6 ltr:text-left rtl:text-right text-brand-dark focus:outline-none">
                <span
                  className={cn(
                    'text-sm font-medium leading-relaxed text-heading ltr:pr-2 rtl:pl-2',
                    {
                      'md:text-base': variant === 'gray',
                      'md:text-base lg:text-lg': variant === 'transparent',
                    },
                  )}
                >
                  {item[0]}
                </span>
                <MdKeyboardArrowDown
                  className={`text-xl lg:text-2xl text-brand-dark text-opacity-60 group-hover:text-opacity-100 -mr-2 lg:-mr-1.5 shrink-0 ${
                    open ? 'transform -rotate-180' : ''
                  }`}
                />
              </Disclosure.Button>

              <Transition
                show={open}
                enter="transition duration-500 ease-out"
                enterFrom="transform scale-5 opacity-0"
                enterTo="transform scale-10 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-5 opacity-0"
              >
                {open && (
                  <Disclosure.Panel static>
                    <div className="px-5 pb-4 -mt-1 text-sm leading-7 2xl:pb-7 2xl:px-6 2xl:mt-0 2xl:text-15px text-brand-dark opacity-70">
                      {item[1]?.map((subItem: any, index: number) => (
                        <div key={index} className="flex items-center gap-5">
                          <input
                            type="checkbox"
                            id={`${subItem}-${index}`}
                            checked={
                              selectedFilters[item[0]]?.includes(subItem) ||
                              false
                            }
                            onChange={(e) => {
                              // console.log(subItem);
                              // console.log(item[0]);
                              handleCheckboxChange(item[0], subItem);
                            }}
                            className="cursor-pointer"
                          />
                          <label
                            htmlFor={`${subItem}-${index}`}
                            className="cursor-pointer"
                          >
                            {subItem}
                          </label>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>
                )}
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};

export default Accordion;
