import { Warehouse } from 'lucide-react';
import { getToken } from '../utils/get-token';

export async function addToCartApi(cartItem: any, isMainFlag: any) {
  //   console.log(cartItem, '===>>> cartItem');
  const isMain = isMainFlag?.warehouses?.isMain
  const sellerWarehouseId = isMainFlag?.warehouses?._id
  
  const { id, itemType, quantity, price, color } = cartItem;
  const body = {
    itemId: id,
    itemType,
    quantity,
    price,
    color,
    isMain,
    sellerWarehouseId,
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
  // console.log(data, '===>>> cart response Data item');

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

export async function addToCartViewPageApi(cartItem: any, sellerWarehouseId : any, isMainCheck: any) {
  

  // console.log("seller warehouse id addToCartViewPageApi" , sellerWarehouseId , isMainCheck);
  
  const { id, itemType, quantity, price, color } = cartItem;
  const body = {
    itemId: id,
    itemType,
    quantity,
    price,
    color,
    isMain :isMainCheck,
    sellerWarehouseId,
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
  // console.log(data, '===>>> cart response Data item');

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

export async function addToCartApiWishlist(cartItem: any, isMainFlag: any) {

    // console.log("ismainflag new setpu check",isMainFlag);
  const isMain = isMainFlag?.isMain
  const sellerWarehouseId = isMainFlag?.sellerWarehouseId
  
  const { id, itemType, quantity, price, color } = cartItem;
  const body = {
    itemId: id,
    itemType,
    quantity,
    price,
    color,
    isMain,
    sellerWarehouseId,
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
  // console.log(data, '===>>> cart response Data item');

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
  // console.log(data, '===>>> cart response Data');

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
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      return Promise.reject({ message: 'API base URL is not configured' });
    }

    const token = getToken();
    if (!token) {
       return Promise.reject({ message: 'Authentication token is missing' });
    }

    const response = await fetch(`${BASE_API}/api/cart/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch cart items' }));
      return Promise.reject({
        message: errorData.message || 'Cart not found',
        status: response.status,
      });
    }
    const data = await response.json();
    return data;
  } catch (err: any) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      return Promise.reject({
        message:
          'Network error: Unable to connect to the server. Please check your connection.',
      });
    }

    return Promise.reject({
      message: err?.message || 'Unknown error while fetching cart',
    });
  }
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
  // console.log(data, '===>>>  cart quantity updated');

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
