'use client';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export interface VerifyOTPInputType {
  otpCode: string;
  email: string;
}

export async function verifyOTP(input: VerifyOTPInputType, setPermissions?: any) {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    const response = await fetch(`${BASE_API}/api/auth/customer/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        otpCode: input.otpCode,
        email: input.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.message || 'OTP verification failed. Please try again.';
      const error = new Error(data.message || 'OTP verification failed.');
      (error as any).response = data;
      console.log(data, '====>>> OTP verification error');
      throw error;
    }

    console.log('OTP verification response:', data);

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

      toast.success('OTP verified successfully!', { position: 'bottom-right' });
    }

    return data;
  } catch (error: any) {
    console.log('OTP verification error:', error);
    toast.error(error.message || 'OTP verification failed', { position: 'bottom-right' });
    throw error;
  }
}

export interface ResendOTPInputType {
  email: string;
}

export async function resendOTP(input: ResendOTPInputType) {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    const response = await fetch(`${BASE_API}/api/auth/customer/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.message || 'Failed to resend OTP. Please try again.';
      const error = new Error(data.message || 'Failed to resend OTP.');
      (error as any).response = data;
      console.log(data, '====>>> Resend OTP error');
      throw error;
    }

    console.log('Resend OTP response:', data);
    toast.success('OTP resent successfully!', { position: 'bottom-right' });
    return data;
  } catch (error: any) {
    console.log('Resend OTP error:', error);
    toast.error(error.message || 'Failed to resend OTP', { position: 'bottom-right' });
    throw error;
  }
}
