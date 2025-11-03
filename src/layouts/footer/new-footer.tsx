import React from 'react';
import { footer } from './data';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';
import Logo from '@/components/ui/logo';

const NewFooter = ({ lang }: any) => {
  const { widgets, social } = footer;
  const { t } = useTranslation(lang, 'footer');
  // console.log(widgets[0])
  const aboutList = widgets[0].lists;
  //   const socialList = widgets[0].lists;
  // console.log(social);
  return (
    <div className="w-full  mb-20 md:px-20">
      <div className="w-1/2 mx-auto h-[2px] bg-[#D9D9D9] my-5"></div>
      <div className="py-10 flex flex-col items-center justify-center border-b-2 border-[#949494]">
        {/* <div className="lg:text-[14px] text-[10px] font-bold">
          {t(`3PL FOR BETTER FUTURE`)}
        </div> */}
        {/* <div className="lg:text-[50px] text-[25px] text-center font-bold">
          {t(`VALLIANI FOR BETTER FUTURE`)}
        </div> */}
        <div className="">
          <Logo className="logo -mt-1.5 md:-mt-1 md:mx-auto ltr:pl-3 rtl:pr-3 md:ltr:pl-0 md:rtl:pr-0 lg:mx-0 w-full lg:w-[450px] md:w-[350px] sm:w-auto " />
        </div>
        {/* <div className="lg:text-[14px] text-[10px] font-medium flex flex-col gap-4 items-center justify-center mt-4">
          &copy; {new Date().getFullYear()} 3PL, LLC
          <button className="bg-[#0081FE] rounded-full text-white py-5 px-10">
            {t(`Contact Us`)}
          </button>
        </div> */}
      </div>

      <div className="flex items-center justify-center pt-5 md:flex-row flex-col gap-2">
        {/* <div className="flex md:space-x-6 space-x-2">
          {aboutList.map((item) => {
            return (
              <div className="text-md cursor-pointer">
                <Link href={`/`}>{t(`${item.title}`)}</Link>
              </div>
            );
          })}
        </div> */}
        <div className="flex items-center justify-center md:space-x-6 space-x-2">
          {social.map((item) => {
            return (
              <Link
                href={item.path}
                className="p-3 rounded-full border-black border-[1px]"
              >
                <div>{item.icon}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewFooter;
