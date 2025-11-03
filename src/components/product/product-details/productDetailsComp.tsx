import React from 'react';

const ProductDetailsComp = ({ data }: any) => {
  //   console.log(data, 'variants vvv');
  return (
    <div className=" px-3 py-3 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-5 w-full">
      {Object?.keys(data).map((item) => {
        // console.log(data[item], '====>>> ooojjj');
        return (
          <div className="flex-1 w-full">
            <div className="font-bold text-lg text-black bg-slate-200 px-2 py-1">
              {item === 'undefined' ? "Other" : item}(s)
            </div>
            <ul className=" px-2 py-1">
              {data[item]?.map((variant: any) => {
                // console.log(variant)
                return (
                  <li className="border-b-[1px] border-brand-muted py-2 flex items-center justify-between">
                    <span className="font-semibold">{`${variant[0]}: `}</span>
                    <span>{`${variant[1]}`}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ProductDetailsComp;
