'use client';

import { CartContext } from '@/contexts/cart/cart.context';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import {
  // getStoreWallet,
  // getUserWallet,
  getWarehouseWallet,
} from '@/framework/basic-rest/wallet/useWallet';
import React, { useContext, useEffect, useState } from 'react';
import { LuWallet } from 'react-icons/lu';

const WalletBalance = ({ lang }: { lang: any }) => {
  const { isAuthorized } = useUI();
  const [balance, setBalance] = useState<any>('0');
  const [storeWalletBalance, setStoreWalletBalance] = useState<any>(0);
  const [warehouse, setWarehouse] = useState<any>();
  const [cartTotal, setCartTotal] = useState<any>(0);
  const { data: user, isLoading } = useUserDataQuery();
  const { cartState } = useContext(CartContext);
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';

  // console.log(cartState.cartItems, 'cartState cartTotal');

useEffect(() => {
  if (!isLoading) {
    const savedWarehouse = localStorage.getItem('selectedWarehouse');

    if (savedWarehouse) {
      try {
        const parsedWarehouse = JSON.parse(savedWarehouse);
        setWarehouse(parsedWarehouse);
      } catch (error) {
        console.error("Failed to parse saved warehouse:", error);
        setWarehouse(null);
      }
    } else {
      console.warn("No saved warehouse found in localStorage.");
      setWarehouse(null);
    }
  }
}, [isLoading]);

  const calculateCartTotal = () => {
    let total = 0;
    cartState.cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    setCartTotal(total);
    return total;
  };

  useEffect(() => {
    if (cartState.cartItems.length > 0) {
      calculateCartTotal();
    }
  }, [cartState.cartItems]);

  // console.log(cartTotal, 'cartTotal');

  // const fetchWalletBalance = async () => {
  //   const response = await getUserWallet();
  //   if (response.message === 'Wallet data retrieved successfully') {
  //     setBalance(response.wallet.balance);
  //   }
  // };

  // const fetchStoreWallet = async (warehouseId: any) => {
  //   const response = await getStoreWallet(warehouseId);

  //   // console.log(response, '===>>> response message store');
  //   if (response) {
  //     setStoreWalletBalance(response.balance);
  //   }
  //   // console.log(response, '===>>> response');
  // };

  const fetchWarehouseWallet = async (warehouseId: any) => {
    const response = await getWarehouseWallet(warehouseId);

    // console.log(response, '===>>> response message store');
    if (response) {
      setBalance(response?.inventoryWallet?.balance);
      setStoreWalletBalance(response?.suppliesWallet?.balance);
      // setWarehouseWalletBalance(response.balance);
    }
    // console.log(response, '===>>> response');
  };

  useEffect(() => {
    if (isAuthorized && warehouse?._id) {
      // fetchWalletBalance();
      // fetchStoreWallet(warehouse?._id);
      fetchWarehouseWallet(warehouse?._id);
    } else {
      setBalance('0');
      setStoreWalletBalance('0');
    }
  }, [isAuthorized, warehouse]);

  return (
    <div className="xl:mx-3.5 mx-2.5">
      <div className="relative group">
        <button className="flex items-center gap-2">
          <LuWallet className="w-[28px] h-[28px] text-opacity-40 text-brand-dark" />
          {/* <span className="text-sm font-medium">
            {permissions[key]?.View
              ? `$${storeWalletBalance?.toLocaleString() || 0}`
              : `$${balance?.toLocaleString() || 0}`}
          </span> */}
        </button>

        {/* Hover tooltip */}
        <div className="absolute top-full mt-2 bg-white shadow-md rounded-md py-2 px-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 min-w-[200px] z-10 flex flex-col gap-2">
          <div className="text-[16px] text-brand-blue font-bold">
            Inventory Wallet
          </div>
          <span className="text-sm font-medium">
            ${balance?.toLocaleString()}
          </span>
          {cartState.cartItems.length > 0 && cartTotal > 0 && (
            <>
              <div className="text-[16px] text-brand-blue font-bold">
                Inventory wallet after use
              </div>
              <span className='text-sm font-medium text-red-500'>${(Number(balance) - cartTotal)?.toLocaleString()}</span>
            </>
          )}
          {permissions[key]?.View && (
            <>
              <div className="text-[16px] text-brand-blue font-bold">
                Supplies Wallet
              </div>
              <span className="text-sm font-medium">
                ${storeWalletBalance?.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default WalletBalance;
