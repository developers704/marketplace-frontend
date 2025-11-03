import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

// API call for deactivating account
async function deactivateAccount() {
  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Authorization token is missing');

  const response = await fetch(`${BASE_API}/api/customers/deactivate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to deactivate account');
  }

  return response.json();
}

// Deactivation Mutation
export const useDeactivateAccountMutation = () => {
  return useMutation({
    mutationFn: () => deactivateAccount(),
    onSuccess: () => {
      console.log('Account deactivated successfully.');
    },
    onError: (error: any) => {
      console.log(error.message || 'Failed to deactivate account.');
    },
  });
};

// // API call for reactivating account
async function reactivateAccount() {
  const token = Cookies.get('auth_token');
  if (!token) throw new Error('Authorization token is missing');

  const response = await fetch(`${BASE_API}/api/customers/reactivate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to reactivate account');
  }

  return response.json();
}

// Reactivation Mutation
export const useReactivateAccountMutation = () => {
  return useMutation({
    mutationFn: () => reactivateAccount(),
    onSuccess: () => {
      console.log('Account reactivated successfully.');
    },
    onError: (error: any) => {
      console.log(error.message || 'Failed to reactivate account.');
    },
  });
};
