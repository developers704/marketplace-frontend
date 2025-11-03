import React from 'react';
import CollectionGrid from './collection-grid';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

const OrderHistroyCard = ({ setOrderDetail, setStatusTitle, data }: any) => {
  function formatDate(isoString: any) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

  // console.log(data.items, '===>>> data');

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  return (
    <div id="container" className="p-3 border-b-[3px]">
      <div id="top" className="flex lg:w-[70vw] tems-center">
        <div className="flex-[4] w-1/4 gap-5 flex flex-col">
          <div className="flex items-center gap-10">
            <div
              id="status"
              className={`py-[5px] px-[10px] ${data?.orderStatus === 'Confirmed' ? 'bg-green-200' : data?.orderStatus === 'Pending Approval' ? 'bg-orange-200' : data?.orderStatus === 'Disapproved' ? 'bg-red-200' : ''} border rounded w-fit`}
              onClick={() => {
                setOrderDetail(true);
                setStatusTitle(data?.orderStatus);
              }}
            >
              {data?.orderStatus}
            </div>
            <div id="status">
              <span className="font-bold">Ordered on: </span>{' '}
              {formatDate(data?.createdAt)}
            </div>
            <div className="font-semibold">
              Order Id: <span className="font-normal">{data?.orderId}</span>{' '}
            </div>
          </div>

          {/* map yahan lagy ga */}
          <div className="bg-brand-blue text-white shadow flex items-center rounded py-3">
            <div className="flex-[1] w-full text-center font-semibold text-[20px]">
              Product
            </div>
            <div className="flex-1 w-full text-center font-semibold text-[20px]">
              Price
            </div>
            <div className="flex-1 w-full text-center font-semibold text-[20px]">
              Quantity
            </div>
            <div className="flex-1 w-full text-center font-semibold text-[20px]">
              Subtotal
            </div>
          </div>

          {data?.items?.map((item: any) => {
            return (
              <div
                key={item._id}
                className=" w-full flex items-center gap-4 p-3 shadow-md rounded-lg"
              >
                <div className="flex-1 flex items-center gap-4">
                  <Image
                    src={getImageUrl(
                      BASE_API as string,
                      item?.product?.image || item?.product?.gallery[0],
                      `/assets/images/products/item1.png`,
                    )}
                    alt="product"
                    width={120}
                    height={120}
                    objectFit="contain"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="font-bold capitalize text-[20px]">
                      {item?.product?.name}
                    </span>
                    <p className="text-[14px] text-brand-muted">
                      SKU: {item?.product?.sku}
                    </p>
                    {item?.color && (
                      <p className="text-[14px] text-brand-muted">
                        Color: {item?.color || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full text-center text-[20px] font-semibold">
                  $ {item?.price}
                </div>
                <div className="flex-1 w-full text-center flex items-center justify-center text-[20px] font-semibold">
                  {item?.quantity}
                </div>
                <div className="flex-1 w-full text-center text-[20px] font-semibold">
                  $ {item?.price * item?.quantity}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex  ">
        <div
          id="btnList"
          className="flex-1 flex flex-col items-center justify-center "
        >
          <div className="bg-brand-blue text-white font-semibold rounded-lg mt-3 px-5 py-2 w-[220px] flex items-center gap-2">
            Grand Total:{' '}
            <span className="font-normal"> ${data?.grandTotal}</span>{' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistroyCard;
