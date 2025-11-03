// import { useMutation } from '@tanstack/react-query';

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

export async function checkout(cartId: any, paymentMethod: any = 'wallet') {
  //   console.log(cartItem, '===>>> cartItem');
  // const { id, itemType, quantity, price } = cartItem;
  const body = {
    cartId,
    paymentMethod,
    specialInstructions: 'Please deliver between 5 PM and 6 PM',
    cityId: '67400e8a7b963a1282d218b5',
  };

  //   console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/checkout/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(data, '===>>> checkout response Data from useCheckout');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    console.log(errorMessage, '===>>> error message');
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
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
    console.log(errorMessage, '===>>> error message');
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}
