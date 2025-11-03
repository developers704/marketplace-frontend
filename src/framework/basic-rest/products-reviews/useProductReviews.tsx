import { getToken } from '../utils/get-token';

export async function getProductReviews(productId: string | any) {
  // console.log(body, '===>>> body');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/reviews/product/${productId}`, {
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
  const response = await fetch(`${BASE_API}/api/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
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
