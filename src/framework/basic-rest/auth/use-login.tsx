'use client';
import { useUI } from '@contexts/ui.context';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export interface LoginInputType {
  email: string;
  password: string;
  remember_me: boolean;
}
export async function login(input: LoginInputType & { warehouseId?: string }, setPermissions: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  try {
    const response = await fetch(`${BASE_API}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        warehouseId: input.warehouseId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || 'Login failed';
      const error = new Error(errorMessage);
      (error as any).statusCode = response.status;
      (error as any).data = data;

      throw error;
    }

    // Success
    if (data.token) {
      Cookies.set('auth_token', data.token);
      localStorage.setItem('auth_token', data.token);

      if (data.selectedWarehouse) {
        localStorage.setItem('selectedWarehouse', JSON.stringify(data.selectedWarehouse));
      }

      if (data?.customer?.role?.permissions && setPermissions) {
        setPermissions(data.customer.role.permissions);
        localStorage.setItem('userPermissions', JSON.stringify(data.customer.role.permissions));
      }

      toast.success('Login Successful!');
    }

    return data;
  } catch (error: any) {
  
    const message = error.message || 'Something went wrong';

    // Handle specific backend errors
    if (error.data?.message === 'Invalid email or password') {
      toast.error(message);
    } 
    else if (error.data?.message?.includes('IP address is not authorized')) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        html: `
          <p>${message}</p>
          <p><strong>Your IP:</strong> <span id="ip-address">${error.data?.actualIP || 'Unknown'}</span></p>
          <button id="copy-ip-btn" class="swal2-confirm swal2-styled" style="background-color: #3085d6;">Copy IP</button>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.getElementById('copy-ip-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(error.data?.actualIP || '');
            Swal.fire('Copied!', 'IP copied to clipboard', 'success');
          });
        },
      });
    }
    else if (error.data?.message === 'You do not have access to this warehouse.') {
      toast.error('You do not have access to this warehouse.');
    }
    else {
      toast.error(message);
    }

    // Critical: Re-throw error so frontend can handle loading state
    throw error;
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
