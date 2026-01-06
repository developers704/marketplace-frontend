// import { useMutation } from '@tanstack/react-query';

import { Warehouse } from 'lucide-react';
import { getToken } from '../utils/get-token';

// export interface CheckoutInputType {
//   firstName: string;
//   lastName: string;
//   phone: string;
//   email: string;
//   address: string;
//   city: string;
//   zipCode: string;
//   save: boolean;
//   note: string;
// }
// async function checkout(input: CheckoutInputType) {
//   return input;
// }
// export const useCheckoutMutation = () => {
//   return useMutation({
//     mutationFn: (input: CheckoutInputType) => checkout(input),
//     onSuccess: (data) => {
//       console.log(data, 'Checkout success response');
//     },
//     onError: (data) => {
//       console.log(data, 'Checkout error response');
//     },
//   });
// };

export async function checkout(cartId: any, warehouse: any, cart: any, paymentMethod: any = 'wallet') {

  // console.log("cart in api", cart);

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();

  // SPLIT ITEMS BASED ON isMain
  const mainItems = cart.items.filter((i: any) => i.isMain === true);
  const storeItems = cart.items.filter((i: any) => i.isMain === false);
  
  
  // console.log("mainItems:", mainItems);
  // console.log("storeItems:", storeItems);
  
  const callApi = async (endpoint: string, itemsArray: any[]) => {
    if (itemsArray.length === 0) return null;
    
     const sellerWarehouseId = itemsArray[0]?.sellerWarehouseId;
    const body = {
      cartId,
      warehouse,
      items: itemsArray,
      paymentMethod,
      specialInstructions: "Please deliver between 5 PM and 6 PM",
      cityId: "67400e8a7b963a1282d218b5",
      sellerWarehouseId: sellerWarehouseId,
      isMain : itemsArray[0]?.isMain
    };

    const response = await fetch(`${BASE_API}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      // console.log("API Error:", data.message);
      return { error: data.message };
    }

    return data;
  };

  const mainResult = await callApi("/api/checkout/process", mainItems);
  const storeResult = await callApi("/api/checkout/store-request-order", storeItems);

  return { mainResult, storeResult };
}


export async function orderHistory() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/checkout/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify(body),
  });

  const data = await response.json();
  // console.log(data, '===>>> checkout history response Data from useCheckout');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    // console.log(errorMessage, '===>>> error message');
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}
