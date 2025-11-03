'use client';
import OrderHistroyCard from '@/components/common/order-history-card';
import { OrderSkeleton } from '@/components/ui/skeletons';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { orderHistory } from '@/framework/basic-rest/checkout/use-checkout';
import React, { useContext, useEffect, useState } from 'react';

const filters = [
  {
    id: 1,
    title: 'All Orders',
  },
  {
    id: 2,
    title: 'Inventory Orders',
  },
  {
    id: 3,
    title: 'Supplies Orders',
  },
  // {
  //   id: 4,
  //   title: 'Delivered',
  // },
  // {
  //   id: 5,
  //   title: 'Returns',
  // },
];

const MyOrder = () => {
  const [selectedItem, setSelectedItem] = useState('All Orders');
  const [orderDetail, setOrderDetail] = useState(false);
  const [statusTitle, setStatusTitle] = useState('');
  const [orderData, setOrderData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';

  const fetchOrderHistory = async () => {
    setIsLoading(true);
    const response = await orderHistory();
    if (response) {
      setOrderData(response);
      setIsLoading(false);
    } else {
      setOrderData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // const response = orderHistory();
    fetchOrderHistory();
  }, []);

  const filteredOrders = orderData.filter((order: any) => {
    if (selectedItem === 'All Orders') return true; // Sab show karne hain
    if (selectedItem === 'Inventory Orders') {
      return order?.items?.some((item: any) => item?.itemType === 'Product');
    }
    if (selectedItem === 'Supplies Orders') {
      return order?.items?.some(
        (item: any) => item?.itemType === 'SpecialProduct',
      );
    }
    return false; // Default case
  });

  // console.log(orderData, '===>>> orderData');
  // console.log(selectedItem, '===>>> selectedItem');

  if (!permissions[key]?.View) {
    return (
      <div>
        <div className="flex justify-center items-center">
          <h1 className="text-4xl text-[#666665] font-semibold">
            You don't have permission to view this page
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!orderDetail ? (
        <>
          <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">
            {selectedItem}
          </h1>
          <div className=" w-full flex items-center flex-wrap space-x-4 mt-7 border-b-[3px] pb-3 mb-5">
            {filters.map((item) => {
              const isSelected = selectedItem === item.title;
              return (
                <div
                  className={`cursor-pointer flex-1  ${isSelected ? 'border-b-[#0081FE]' : ''} ${isSelected ? 'border-b-[3px]' : 'border-b-0'} text-[#666665] font-bold py-[10px] px-[15px]`}
                  onClick={() => setSelectedItem(item.title)}
                  key={item.id}
                >
                  {item.title}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">
            {statusTitle}
          </h1>
          <div className="pb-3 mb-5">
            <span className="text-3xl font-semibold text-[#666665]">
              {statusTitle} {` `}
            </span>
            <span className="text-sm text-[#666665]">
              Order ID: <span className="text-black">id-here-100</span>
            </span>
          </div> */}
        </>
      )}

      {isLoading ? (
        <OrderSkeleton />
      ) : orderData?.length == 0 ? (
        <div>No Orders Found</div>
      ) : (
        filteredOrders?.map((item: any) => {
          return (
            <div key={item?.id}>
              <OrderHistroyCard
                data={item}
                setOrderDetail={setOrderDetail}
                setStatusTitle={setStatusTitle}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyOrder;
