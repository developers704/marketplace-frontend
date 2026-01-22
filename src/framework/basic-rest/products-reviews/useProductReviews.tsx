import { getToken } from '../utils/get-token';

export async function getProductReviews(productId: string | any, productModel?: string, skuId?: string) {
  // console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  
  // Build query parameters
  const params = new URLSearchParams();
  if (productModel) {
    params.append('productModel', productModel);
  }
  if (skuId) {
    params.append('skuId', skuId);
  }
  
  let url = `${BASE_API}/api/reviews/product/${productId}`;
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  console.log(data, '===>>> reviews response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function addReview(formData: any) {
  console.log(formData, '===>>> formData');
  // console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  
  // Ensure productModel is included (default to 'Product' if not specified)
  const reviewData = {
    ...formData,
    productModel: formData.productModel || 'Product'
  };
  
  const response = await fetch(`${BASE_API}/api/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  const data = await response.json();
  //   console.log(data, '===>>> reviews response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

// export const deleteCartItem = async (cartItemId: any, cartItemType: any) => {
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//   const token = getToken();
//   const response = await fetch(
//     `${BASE_API}/api/cart/remove//${cartItemId}?itemType=${cartItemType}`,
//     {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//     },
//   );

//   const data = await response.json();
//   console.log(data, '===>>> cart response Data');

//   if (!response.ok) {
//     const errorMessage =
//       data.message || 'Something went wrong. Please try again later.';
//     // throw new Error(errorMessage);
//     return { message: errorMessage };
//   }
//   // console.log('response from login api is ', data);
//   return data;
// };

// export async function getAllCartItems() {
//   //   console.log(body, '===>>> body');
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//   const token = getToken();
//   const response = await fetch(`${BASE_API}/api/cart/`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await response.json();
//   console.log(data, '===>>> cart response Data');

//   if (!response.ok) {
//     const errorMessage =
//       data.message || 'Something went wrong. Please try again later.';
//     // throw new Error(errorMessage);
//     return { message: errorMessage };
//   }
//   // console.log('response from login api is ', data);
//   return data;
// }
