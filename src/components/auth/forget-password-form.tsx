// import Button from '@components/ui/button';
// import Input from '@components/ui/form/input';
// import Logo from '@components/ui/logo';
// import { useForm } from 'react-hook-form';
// import { useTranslation } from 'src/app/i18n/client';
// import { useModalAction } from '@components/common/modal/modal.context';
// import CloseButton from '@components/ui/close-button';

// type FormValues = {
//   email: string;
// };

// const defaultValues = {
//   email: '',
// };

// const ForgetPasswordForm = ({ lang }: { lang: string }) => {
//   const { t } = useTranslation(lang);
//   const { closeModal, openModal } = useModalAction();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormValues>({
//     defaultValues,
//   });

//   function handleSignIn() {
//     return openModal('LOGIN_VIEW');
//   }
//   function handleResetPassword() {
//     return openModal('RESET_PASSWORD');
//   }

//   const onSubmit = async (values: FormValues) => {
//     try {
//       const BASE_API = 'https://backendapi.chase.boundlesstechnologies.net/';
//       const response = await fetch(
//         `${BASE_API}/api/auth/customer/forgot-password`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             email: values.email,
//           }),
//         },
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Login failed');
//       }

//       setTimeout(() => {
//         handleResetPassword();
//       }, 200);
//     } catch (error: any) {
//       // setErrorMessage(error?.message);
//     }
//   };

//   return (
//     <div className="w-full px-5 py-6 mx-auto rounded-lg sm:p-8 bg-brand-light sm:w-96 md:w-450px">
//       <CloseButton onClick={closeModal} />
//       <div className="text-center mb-9 pt-2.5">
//         <div onClick={closeModal}>
//           <Logo />
//         </div>
//         <p className="mt-3 mb-8 text-sm md:text-base text-body sm:mt-4 sm:mb-10">
//           {"We'll send you an OTP to reset your password."}
//         </p>
//       </div>
//       <form
//         onSubmit={handleSubmit((data) => onSubmit(data))}
//         className="flex flex-col justify-center"
//         noValidate
//       >
//         <Input
//           label={t('forms:label-email') as string}
//           type="email"
//           variant="solid"
//           className="mb-4"
//           placeholder="Enter your register email"
//           {...register('email', {
//             required: `${t('forms:email-required')}`,
//             pattern: {
//               value:
//                 /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//               message: t('forms:email-error'),
//             },
//           })}
//           error={errors.email?.message}
//           lang={lang}
//         />

//         <Button
//           type="submit"
//           variant="formButton"
//           className="w-full mt-0 h-11 md:h-12"
//         >
//           {'Send OTP'}
//         </Button>
//       </form>
//       <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-10 sm:mb-7">
//         <hr className="w-full border-gray-300" />
//         <span className="absolute -top-2.5 px-2 bg-brand-light">
//           {t('common:text-or')}
//         </span>
//       </div>
//       <div className="text-sm text-center sm:text-15px text-brand-muted">
//         {t('common:text-back-to')}{' '}
//         <button
//           type="button"
//           className="font-medium underline text-brand-dark hover:no-underline focus:outline-none"
//           onClick={handleSignIn}
//         >
//           {t('common:text-login')}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ForgetPasswordForm;

'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordForm = ({ lang }: { lang: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px] text-center">
        <h2 className="text-3xl font-semibold mb-2">Reset Your Password</h2>
        <p className="text-gray-500 !mb-6 ">
          We have sent a four digit code on your email
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Four digit code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-4 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-4 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Login Button */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
