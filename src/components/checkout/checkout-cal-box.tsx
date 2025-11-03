'use client';
import { checkout } from '@/framework/basic-rest/checkout/use-checkout';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

function Loader() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}

const CheckoutCalculationBox = ({
  productsPrice,
  inventoryWalletBalance,
  suppliesWalletBalance,
  walletBalance,
  storeWalletBalance,
  canViewStoreWallet,
  cart,
  lang = 'en',
}: any) => {
  // console.log(walletBalance, 'walletBalance');
  const router = useRouter();
  const [isWalletUsed, setIsWalletUsed] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState<any>(0);
  const [walletAfterUse, setWalletAfterUse] = useState<any | number | string>();
  const [isSpecialItem, setIsSpecialItem] = useState(false);
  const [isGWPItem, setIsGWPItem] = useState(false);
  const [loader, setLoader] = useState(false);

  console.log(cart, '===>>> cart');

  const checkForSpecialItem = (cart: any): boolean => {
    return (
      cart?.items?.some((item: any) => item.itemType === 'SpecialProduct') ||
      false
    );
  };

  const checkForGWPItem = (cart: any): boolean => {
    return cart?.items?.some((item: any) => item?.item.type === 'GWP') || false;
  };

  const totalPriceCalculation = (wallet: number = 0) => {
    if (productsPrice !== 0) {
      const total = productsPrice;
      // setTotalAmount(total);
      return total;
    }
  };

  const checkoutHandler = async () => {
    setLoader(true);
    try {
      const response = await checkout(cart._id);
      // console.log(response, '===>>> checkout response from checkout handler');
      if (response.message === 'Order placed successfully') {
        setLoader(false);
        // Swal.fire('Success!', 'Order placed successfully', 'success');
        Swal.fire({
          title: 'Success!',
          text: 'Order placed successfully',
          icon: 'success',
          confirmButtonText: 'Ok',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${lang}/profile-details?option=My Order`); // Replace with your actual route
          }
        });
      } else if (
        response.message === 'Insufficient inventory wallet balance' ||
        response.message === 'Insufficient supplies wallet balance'
      ) {
        setLoader(false);
        Swal.fire({
          title: 'Warning!',
          text: 'Insufficient wallet balance',
          icon: 'warning',
          confirmButtonText: 'Go to Wallet',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${lang}/profile-details?option=Store Wallet`); // Replace with your actual route
          }
        });
      } else if (
        response.message ===
        'Insufficient quantity for product undefined in main warehouse'
      ) {
        setLoader(false);
        Swal.fire({
          title: 'Warning!',
          text: 'Insufficient quantity for product in main warehouse',
          icon: 'warning',
          confirmButtonText: 'Go to Store',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${lang}/`); // Replace with your actual route
          }
        });
      } else if (
        response.message ===
        'Normal and other products cannot be ordered together'
      ) {
        setLoader(false);
        // Swal.fire('Error!', response.message, 'error');
        Swal.fire({
          title: 'Warning!',
          text: response.message,
          icon: 'warning',
          confirmButtonText: 'Ok',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${lang}/cart`); // Replace with your actual route
          }
        });
      } else if (response.message === 'Insufficient warehouse wallet balance') {
        setLoader(false);
        Swal.fire({
          title: 'Warning!',
          text: 'Insufficient warehouse wallet balance',
          icon: 'warning',
          confirmButtonText: 'Go to Wallet',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push(`/${lang}/profile-details?option=Store Wallet`); // Replace with your actual route
          }
        });
      } else {
        setLoader(false);
        Swal.fire('Error!', response.message, 'error');
      }
    } catch (error) {
      setLoader(false);
      console.log(error, '===>>> error from checkout handler');
    }
  };

  const walletAmonutHandler = (wallet: any) => {
    // console.log(typeof totalAmount, typeof walletBalance);
    const afterUse = wallet - totalAmount;
    if (afterUse < 0) {
      setWalletAfterUse('Insufficient wallet balance');
    } else {
      setWalletAfterUse(afterUse);
    }
    // setIsWalletUsed(!isWalletUsed);
    // console.log(afterUse, '===>>> afterUse');
  };

  useEffect(() => {
    setWalletAmount(walletBalance);
    setTotalAmount(totalPriceCalculation());
    // walletAmonutHandler();
    if (cart) {
      setIsSpecialItem(checkForSpecialItem(cart));
      setIsGWPItem(checkForGWPItem(cart));
      // checkForSpecialItem(cart);
    }
  }, [cart, inventoryWalletBalance, suppliesWalletBalance]);

  console.log(isGWPItem, '===>>> isGWPItem');

  useEffect(() => {
    if (isSpecialItem && !isGWPItem) {
      // setIsWalletUsed(true);
      walletAmonutHandler(suppliesWalletBalance);
    } else if (isSpecialItem && isGWPItem) {
      walletAmonutHandler(inventoryWalletBalance);
    } else if (!isSpecialItem && !isGWPItem) {
      walletAmonutHandler(inventoryWalletBalance);
    }
  }, [isSpecialItem, isGWPItem, inventoryWalletBalance, suppliesWalletBalance]);

  // console.log(storeWalletBalance, '===>>> storeWalletBalance');

  return (
    <div className="bg-[#f4f4f4] p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Product Price:</span>
          <span className="font-bold">$ {productsPrice || 0}</span>
        </div>

        {/* <div className="flex justify-between">
          <span className="text-gray-500">VAT:</span>
          <span className="font-bold">$ {VAT || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping:</span>
          <span className="font-bold">$ {shippingAmount || 0}</span>
        </div> */}
        {/* {isWalletUsed && (
          <div className="flex justify-between">
            <span className="text-gray-500">Wallet:</span>
            <span className="font-bold text-red-600">
              -$ {walletBalance || 0}
            </span>
          </div>
        )} */}

        {!isSpecialItem && (
          <div className="flex justify-between">
            <span className="text-gray-500">Inventory Wallet:</span>
            <span className="font-bold">$ {inventoryWalletBalance || 0}</span>
          </div>
        )}
        {walletAfterUse === 'Insufficient wallet balance' && !isSpecialItem ? (
          <div
            className="flex justify-between cursor-pointer"
            onClick={() =>
              router.push(`/${lang}/profile-details?option=Store Wallet`)
            }
          >
            <span className="text-red-400">
              Inventory Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              {walletAfterUse || 0}
            </span>
          </div>
        ) : !isSpecialItem ? (
          <div className="flex justify-between">
            <span className="text-red-400">
              Inventory Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              $ {walletAfterUse || 0}
            </span>
          </div>
        ) : (
          ''
        )}

        {isSpecialItem && isGWPItem && (
          <div className="flex justify-between">
            <span className="text-gray-500">Inventory Wallet:</span>
            <span className="font-bold">$ {inventoryWalletBalance || 0}</span>
          </div>
        )}
        {walletAfterUse === 'Insufficient wallet balance' &&
        isSpecialItem &&
        isGWPItem ? (
          <div
            className="flex justify-between cursor-pointer"
            onClick={() =>
              router.push(`/${lang}/profile-details?option=Store Wallet`)
            }
          >
            <span className="text-red-400">
              Inventory Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              {walletAfterUse || 0}
            </span>
          </div>
        ) : isSpecialItem && isGWPItem ? (
          <div className="flex justify-between">
            <span className="text-red-400">
              Inventory Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              $ {walletAfterUse || 0}
            </span>
          </div>
        ) : (
          ''
        )}
        {/* */}

        {isSpecialItem && !isGWPItem ? (
          <div className="flex justify-between">
            <span className="text-gray-500">Supplies Wallet:</span>
            <span className="font-bold">$ {suppliesWalletBalance || 0}</span>
          </div>
        ) : (
          ''
        )}

        {walletAfterUse === 'Insufficient wallet balance' &&
        isSpecialItem &&
        !isGWPItem ? (
          <div
            className="flex justify-between cursor-pointer"
            onClick={() =>
              router.push(`/${lang}/profile-details?option=Store Wallet`)
            }
          >
            <span className="text-red-400">
              Supplies Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              {walletAfterUse || 0}
            </span>
          </div>
        ) : isSpecialItem && !isGWPItem ? (
          <div className="flex justify-between">
            <span className="text-red-400">
              Supplies Wallet After Purcahse:
            </span>
            <span className="font-bold text-red-400">
              $ {walletAfterUse || 0}
            </span>
          </div>
        ) : (
          ''
        )}
        <div className="w-full h-[1px] bg-gray-500"></div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold">$ {totalAmount}</span>
        </div>
        <div className="w-full flex items-center justify-between gap-5">
          <button
            className="bg-[#0081fe] py-2 px-5 w-full rounded font-semibold text-white flex items-center justify-center gap-7"
            onClick={checkoutHandler}
            disabled={loader}
          >
            Place Your Order
            {loader && <Loader />}
          </button>
          {/* <button
            className="bg-[#34A853] py-2 px-5 w-full rounded font-semibold text-white"
            onClick={walletAmonutHandler}
          >
            Use Wallet ($ {walletAmount})
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CheckoutCalculationBox;
