import { getToken } from '../utils/get-token';

export async function addToCartApi(cartItem: any) {
  //   console.log(cartItem, '===>>> cartItem');
  const { id, itemType, quantity, price, color } = cartItem;
  const body = {
    itemId: id,
    itemType,
    quantity,
    price,
    color,
  };

  //   console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(data, '===>>> cart response Data item');

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

export const deleteCartItem = async (
  cartItemId: any,
  cartItemType: any,
  color?: any,
) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(
    `${BASE_API}/api/cart/remove/${cartItemId}?itemType=${cartItemType}${color === null ? '' : `&color=${color}`}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  console.log(data, '===>>> cart response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
};

export async function getAllCartItems() {
  //   console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/cart/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> All cart response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function updateCartItemQuantity(
  cartItemId: any,
  quantity: any,
  cartItemType: any,
) {
  //   console.log(body, '===>>> body');
  const body = {
    quantity,
    itemType: cartItemType,
  };

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/cart/update/${cartItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log(data, '===>>>  cart quantity updated');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

// export const useCategoriesQuery = (options?: CategoriesQueryOptionsType) => {
//   // console.log(options, "===>>> otions")
//   return useQuery<Category[], Error>({
//     queryKey: ['Categories', options],
//     // queryFn: fetchCategories,
//     queryFn: fetchAllCategories,
//   });
// };
