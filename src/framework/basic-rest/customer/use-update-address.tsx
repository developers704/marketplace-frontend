import { ContactFormValues } from '@components/common/form/add-address';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

async function updateAddress({
  address,
  resId,
}: {
  address: any;
  resId: string;
}) {
  console.log('address params in async thunk ', address, resId);

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Authorization token is missing');

  // Prepare the payload for the PUT request

  // Send the PUT request to update the address profile
  const response = await fetch(
    `${BASE_API}/api/addresses/${resId}/set-default`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address.formatted_address,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData.message || 'Something went wrong while working on Address.';
    throw new Error(errorMessage);
  }

  // Handle the successful response
  const data = await response.json();
  return data;
}
export const useUpdateAddressMutation = () => {
  return useMutation({
    mutationFn: (input: { address: any; resId: string }) =>
      updateAddress(input),
    onSuccess: (data) => {
      console.log(data, 'UpdateAddress success response');
    },
    onError: (error: any) => {
      console.log(error, 'UpdateAddress error response');
    },
  });
};
