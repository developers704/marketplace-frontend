'use client';
import { useUI } from '@contexts/ui.context';
import Cookies from 'js-cookie';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useModalAction } from '@components/common/modal/modal.context';
import Swal from 'sweetalert2';
// import { useContext } from 'react';
// import { PermissionsContext } from '@/contexts/permissionsContext';

export interface LoginInputType {
  email: string;
  password: string;
  remember_me: boolean;
}

export async function login(input: LoginInputType, setPermissions: any) {
  try {
    // const { setPermissions } = useContext(PermissionsContext) || {};
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    const response = await fetch(`${BASE_API}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.message || 'Something went wrong. Please try again later.';
      const error = new Error(data.message || 'Something went wrong.');
      (error as any).response = data;
      console.log(data, '====>>> error message');
      throw error;
      // throw new Error(data);
      // return {data}
    }
    console.log('response from login api is login ', data);

    if (data.token) {
      Cookies.set('auth_token', data.token);
      // Save permissions if provided in response
      if (data?.customer?.role?.permissions && setPermissions) {
        setPermissions(data?.customer?.role?.permissions);
        localStorage.setItem(
          'userPermissions',
          JSON.stringify(data?.customer?.role?.permissions),
        );
      }

      toast.success('Login Successfully', { position: 'bottom-right' });
    }
    return data;
  } catch (error: any) {
    // console.log(error?.response.actualIP, '====>>> error ');
    // console.log(error.response?.message, '====>>> error message');
    if (error.response?.message === 'Invalid email or password') {
      toast.error(error.message, { position: 'bottom-right' });
    } else if (
      error.response?.message ===
      'Your IP address is not authorized. Please contact your system administrator for access.'
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        html: `
          <p>${error?.message || 'Something went wrong!'}</p>
          <p><strong>Your Actual IP:</strong> <span id="ip-address">${
            error?.response.actualIP
          }</span></p>
          <button id="copy-ip-btn" class="swal2-confirm swal2-styled" style="background-color: #3085d6;">Copy IP</button>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document
            .getElementById('copy-ip-btn')
            ?.addEventListener('click', () => {
              navigator.clipboard.writeText(error?.response.actualIP);
              Swal.fire('Copied!', 'IP Address copied to clipboard', 'success');
            });
        },
      });
    }
    // if (error.message === ) toast.error(error.message);
  }
}

// export const useLoginMutation = () => {
//   const { closeModal, openModal } = useModalAction();
//   const { authorize } = useUI();

//   return useMutation({
//     mutationFn: (input: LoginInputType) => login(input, setPermissions),
//     onSuccess: (data) => {
//       if (data) {
//         // console.log(data.token, 'login response');
//         // Cookies.set('auth_token', data.token);
//         toast.success('Login Successful');
//         authorize();
//         // setTimeout(() => closeModal(), 1100);
//         // return data;
//       }
//     },
//     onError: (error: any) => {
//       console.log(error, '====>>> full error object');
//       console.log(error.message, '====>>> error message');
//       const ipAddress = error.response?.actualIP || 'Unknown IP';

//       if (error.response?.message === 'Invalid email or password') {
//         toast.error('Invalid email or password');
//         return;
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Login Failed',
//           html: `
//           <p>${error?.message || 'Something went wrong!'}</p>
//           <p><strong>Your Actual IP:</strong> <span id="ip-address">${ipAddress}</span></p>
//           <button id="copy-ip-btn" class="swal2-confirm swal2-styled" style="background-color: #3085d6;">Copy IP</button>
//         `,
//           showConfirmButton: false,
//           didOpen: () => {
//             document
//               .getElementById('copy-ip-btn')
//               ?.addEventListener('click', () => {
//                 navigator.clipboard.writeText(ipAddress);
//                 Swal.fire(
//                   'Copied!',
//                   'IP Address copied to clipboard',
//                   'success',
//                 );
//               });
//           },
//         });
//       }
//     },
//   });
// };
