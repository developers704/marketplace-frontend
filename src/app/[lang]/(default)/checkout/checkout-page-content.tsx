'use client';
import CheckoutCalculationBox from '@/components/checkout/checkout-cal-box';
import { CheckoutItem } from '@/components/checkout/checkout-card-item';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import { getAllCartItems } from '@/framework/basic-rest/cart/use-cart';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import {
  getStoreWallet,
  getUserWallet,
  getWarehouseWallet,
} from '@/framework/basic-rest/wallet/useWallet';
import React, { useContext, useEffect, useState } from 'react';

const CheckoutPageContent = () => {
  const { isAuthorized } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [productsPrice, setProductsPrice] = useState<any>(0);
  const [cart, setCart] = useState<any>();
  const [walletBalance, setWalletBalance] = useState(0);
  const [storeWalletBalance, setStoreWalletBalance] = useState<any>(0);
  const [inventoryWalletBalance, setInventoryWalletBalance] = useState(0);
  const [suppliesWalletBalance, setSuppliesWalletBalance] = useState<any>(0);
  const [warehouse, setWarehouse] = useState<any>();
  const [canViewStoreWallet, setCanViewStoreWallet] = useState<any>(false);
  const { data: user, isLoading } = useUserDataQuery();
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';

  useEffect(() => {
    if (!isLoading) {
      setWarehouse(user?.warehouse);
    }
  }, [user]);

  const fetchStoreWallet = async (warehouseId: any) => {
    const response = await getStoreWallet(warehouseId);

    // console.log(response, '===>>> response message store');
    if (response) {
      setStoreWalletBalance(response.balance);
    }
    // console.log(response, '===>>> response');
  };

  const fetchWarehouseWallet = async (warehouseId: any) => {
    const response = await getWarehouseWallet(warehouseId);

    console.log(response, '===>>> response message store');
    if (response) {
      setStoreWalletBalance(response.balance);
      setInventoryWalletBalance(response?.inventoryWallet?.balance);
      setSuppliesWalletBalance(response?.suppliesWallet?.balance);
    }
    // console.log(response, '===>>> response');
  };

  const fetchUserWallet = async () => {
    const response = await getUserWallet();
    if (response.message === 'Wallet data retrieved successfully') {
      // console.log(response.message, '===>>> response message');
      setWalletBalance(response.wallet.balance);
    }
  };

  const fetchCartForCheckout = async () => {
    const response = await getAllCartItems();
    // console.log(response, '===>>> response from cart for checkout');
    if (response) {
      setProductsPrice(response?.total);
      setCart(response);
    }
    if (response.items.length > 0) {
      setItems(response.items);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchCartForCheckout();
      fetchUserWallet();
      fetchWarehouseWallet(warehouse?._id);
      // if (permissions[key].View) {
      //   fetchStoreWallet(warehouse?._id);
      //   setCanViewStoreWallet(true);
      // } else {
      //   setStoreWalletBalance(0);
      //   setCanViewStoreWallet(false);
      // }
    }
  }, [isAuthorized, warehouse]);

  // console.log(walletBalance, '===>>> walletBalance');
  // console.log(storeWalletBalance, '===>>> storeWalletBalance');

  return (
    <section className="my-10 px-14">
      <div>
        <div className="flex justify-center items-center mb-10">
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
        <div className="backContainer bg-[#f4f4f4] p-6 shadow-md mb-5">
          <div>
            <div className="bg-[white] shadow flex items-center py-3 text-[20px]">
              <div className="flex-1 w-full text-center font-semibold">
                Product
              </div>
              <div className="flex-1 w-full text-center font-semibold">
                Price
              </div>
              <div className="flex-1 w-full text-center font-semibold">
                Quantity
              </div>
              <div className="flex-1 w-full text-center font-semibold">
                Subtotal
              </div>
            </div>
            <div>
              {items.map((item) => (
                <CheckoutItem item={item} key={item._id} />
              ))}
              {/* <CheckoutItem />
              <CheckoutItem />
              <CheckoutItem />
              <CheckoutItem /> */}
            </div>
          </div>
        </div>
        <CheckoutCalculationBox
          productsPrice={productsPrice}
          walletBalance={walletBalance}
          storeWalletBalance={storeWalletBalance}
          canViewStoreWallet={canViewStoreWallet}
          cart={cart}
          inventoryWalletBalance={inventoryWalletBalance}
          suppliesWalletBalance={suppliesWalletBalance}
        />
      </div>
    </section>
  );
};

export default CheckoutPageContent;
