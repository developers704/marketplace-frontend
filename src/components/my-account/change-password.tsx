'use client';

import PasswordInput from '@components/ui/form/password-input';
import Button from '@components/ui/button';
import Heading from '@components/ui/heading';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';

import {
  useChangePasswordMutation,
  ChangePasswordInputType,
} from '@framework/customer/use-change-password';
import { useTranslation } from 'src/app/i18n/client';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const defaultValues = {
  currentPassword: '',
  newPassword: '',
};

const ChangePassword: React.FC<{ lang: string }> = ({ lang }) => {
  const { t } = useTranslation(lang);
  const { mutate: changePassword, isPending } = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInputType>({
    defaultValues,
  });
  async function onSubmit(input: ChangePasswordInputType) {
    try {
      const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
      const token = Cookies.get('auth_token');
      if (!token) {
        throw new Error('Authorization token is missing'); // Handle missing token
      }
      const response = await fetch(
        `${BASE_API}/api/customers/change-password`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password change failed');
      }
      const data = await response.json();
      if (data) {
        toast.success('Password changed successfully');
        reset();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }
  return (
    <>
      <Heading variant="titleLarge">
        {t('common:text-account-details-password')}
      </Heading>
      <div className="flex flex-col w-full mt-6 lg:w-10/12 2xl:w-9/12 lg:mt-7">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center w-full mx-auto "
        >
          <div className="flex flex-col space-y-5 lg:space-y-7">
            <PasswordInput
              label={'Current Password'}
              error={errors.currentPassword?.message}
              {...register('currentPassword', {
                required: `Current Password is Required`,
              })}
              lang={lang}
            />
            <PasswordInput
              label={'New Password'}
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: `New Password is Required`,
              })}
              lang={lang}
            />

            <div className="relative mt-3">
              <Button
                type="submit"
                loading={isPending}
                disabled={isPending}
                variant="formButton"
                className="w-full sm:w-auto"
              >
                {'Change Password'}
              </Button>
            </div>
          </div>
        </form>
        <ToastContainer
          autoClose={1000}
          hideProgressBar={true}
          position="top-center"
          closeOnClick={true}
          closeButton={false}
        />
      </div>
    </>
  );
};

export default ChangePassword;
