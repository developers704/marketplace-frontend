import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export interface UpdateUserType {
  username?: string | any;
  phone_number?: string | any;
  profileImage?: any | any;
  city?: string | any;
  addresses?: string | any;
  isDeactivated?: boolean | any;
}

const createFormData = (input: UpdateUserType): FormData => {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, value);
      }
    }
  });

  return formData;
};

async function updateUser(input: UpdateUserType) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Authorization token is missing');

  // Prepare the payload for the PUT request
  // const requestBody = {
  //   username: input.firstName, // Assuming username is the first name
  //   email: input.email,
  //   phone_number: input.phoneNumber,
  //   city: input.city,
  //   image: input.image,
  //   gender: input.gender,
  //   date_of_birth: input.date_of_birth,
  // };
  // console.log('data before updating ', requestBody);

  console.log(input, '====>>> input form query');

  const formData = new FormData(); // Convert input to FormData

  // console.log(formData, 'formData');

  // Append all form fields to FormData
  formData.append('username', input.username);
  formData.append('phone_number', input.phone_number);
  formData.append('city', input.city);
  formData.append('addresses', JSON.stringify(input.addresses));
  // formData.append('profileImage', input.profileImage);
  formData.append('isDeactivated', input.isDeactivated);

  // ✅ Handle profile image properly
  if (input.profileImage instanceof File) {
    formData.append('image', input.profileImage, input.profileImage.name);
  } else if (typeof input.profileImage === 'string') {
    formData.append('image', input.profileImage); // If it's a URL
  }

  // console.log('🚀 Sending FormData:', [...formData.entries()]); // Debugging output

  const response = await fetch(`${BASE_API}/api/customers/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData.message || 'Something went wrong while updating the profile.';
    throw new Error(errorMessage);
  }

  // Handle the successful response
  const data = await response.json();
  console.log(data, 'UpdateUser success response');
  return data;
}
export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: (input: UpdateUserType) => updateUser(input),
    onSuccess: (data) => {
      console.log(data, 'UpdateUser success response');
    },
    onError: (error: any) => {
      console.log(error, 'UpdateUser error response');
    },
  });
};
