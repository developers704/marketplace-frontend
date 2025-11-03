// 'use client';
// import { useState } from 'react';
// import Input from '@components/ui/form/input';
// import PasswordInput from '@components/ui/form/password-input';
// import Button from '@components/ui/button';
// import { useForm } from 'react-hook-form';
// import Logo from '@components/ui/logo';
// import { useSignUpMutation, SignUpInputType } from '@framework/auth/use-signup';
// import Link from '@components/ui/link';
// import Image from '@components/ui/image';
// import { useModalAction } from '@components/common/modal/modal.context';
// import Switch from '@components/ui/switch';
// import CloseButton from '@components/ui/close-button';
// import cn from 'classnames';
// import { ROUTES } from '@utils/routes';
// import { useTranslation } from 'src/app/i18n/client';
// import PhoneInput from 'react-phone-number-input';
// import 'react-phone-number-input/style.css';
// import Swal from 'sweetalert2';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiCheckCircle } from 'react-icons/fi';

// interface SignUpFormProps {
//   lang: string;
//   isPopup?: boolean;
//   className?: string;
// }

// export default function SignUpForm({
//   lang,
//   isPopup = true,
//   className,
// }: SignUpFormProps) {
//   const { t } = useTranslation(lang);
//   const { mutate: signUp, isPending } = useSignUpMutation();
//   const { closeModal, openModal } = useModalAction();
//   const [phoneValue, setPhoneValue] = useState<string | undefined>(undefined); // State for phone input
//   const [remember, setRemember] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [phoneError, setPhoneError] = useState<string | null>(null);
//   const [isValidPhone, setIsValidPhone] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SignUpInputType>();

//   function handleSignIn() {
//     return openModal('LOGIN_VIEW');
//   }

//   async function onSubmit({
//     username,
//     email,
//     password,
//     remember_me,
//   }: SignUpInputType) {
//     try {
//       setLoading(true);
//       if (!phoneValue) {
//         Swal.fire({
//           icon: 'error',
//           title: 'Phone Required',
//           text: 'Please enter your phone number',
//           timer: 1500,
//           showConfirmButton: true,
//         });
//         return;
//       }

//       const requestBody = {
//         username,
//         password,
//         phone_number: phoneValue,
//         ...(email && { email }),
//       };

//       const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//       const response = await fetch(`${BASE_API}/api/customers/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         Swal.fire({
//           icon: 'error',
//           title: 'Registration Failed',
//           text: errorData.message || 'Something went wrong',
//           timer: 2000,
//           showConfirmButton: true,
//         });
//         return;
//       }

//       let timerInterval: any;
//       Swal.fire({
//         title: 'Registration Success',
//         text: 'An OTP code has been sent to your Phone Number.',
//         icon: 'success',
//         timer: 3000,
//         timerProgressBar: false,
//         showConfirmButton: true,
//         didOpen: () => {
//           const timer = Swal?.getPopup()?.querySelector('b');
//           timerInterval = setInterval(() => {
//             if (timer) {
//               timer.textContent = `${Swal.getTimerLeft()}`;
//             }
//           }, 100);
//         },
//         willClose: () => {
//           clearInterval(timerInterval);
//           handleSignIn();
//         },
//       });
//     } catch (error: any) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error?.message || 'Registration failed',
//         timer: 1500,
//         showConfirmButton: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   }
//   return (
//     <div
//       className={cn(
//         'flex bg-brand-light mx-auto rounded-lg md:w-[720px] lg:w-[920px] xl:w-[1000px] 2xl:w-[1200px]',
//         className,
//       )}
//     >
//       {isPopup === true && <CloseButton onClick={closeModal} />}
//       <div className="flex w-full mx-auto overflow-hidden rounded-lg bg-brand-light">
//         <div className="md:w-1/2 lg:w-[55%] xl:w-[60%] registration hidden md:block relative">
//           <Image
//             src="/assets/images/registration.png"
//             alt="sign up"
//             fill
//             sizes="(max-width: 768px) 100vw,
//               (max-width: 1200px) 50vw,
//               33vw"
//           />
//         </div>
//         <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] py-6 sm:py-10 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-12 rounded-md shadow-dropDown flex flex-col justify-center">
//           <div className="text-center mb-6 pt-2.5">
//             <div onClick={closeModal}>
//               <Logo />
//             </div>
//             <h4 className="text-xl font-semibold text-brand-dark sm:text-2xl sm:pt-3 ">
//               {t('common:text-sign-up-for-free')}
//             </h4>
//             <div className="mt-3 mb-1 text-sm text-center sm:text-base text-body">
//               {t('common:text-already-registered')}
//               <button
//                 type="button"
//                 className="text-sm font-semibold ltr:ml-1 rtl:mr-1 sm:text-base text-blue-900 hover:no-underline focus:outline-none"
//                 onClick={handleSignIn}
//               >
//                 {t('common:text-sign-in-now')}
//               </button>
//             </div>
//           </div>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="flex flex-col justify-center"
//             noValidate
//           >
//             <div className="flex flex-col space-y-4">
//               <Input
//                 label={t('forms:label-name') as string}
//                 type="text"
//                 variant="solid"
//                 {...register('username', {
//                   required: 'Name is required',
//                 })}
//                 lang={lang}
//               />

//               {errors.username && (
//                 <p className="my-2 text-13px text-brand-danger text-opacity-70">
//                   {errors.username.message} {/* Display the error message */}
//                 </p>
//               )}

//               <Input
//                 label={(t('forms:label-email') + ' (Optional)') as string}
//                 type="email"
//                 variant="solid"
//                 {...register('email', {
//                   pattern: {
//                     value:
//                       /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//                     message: t('forms:email-error'),
//                   },
//                 })}
//                 onChange={() => setErrorMessage(null)} // Reset error message on input change
//                 error={
//                   errors.email?.message ||
//                   (errorMessage && errorMessage.includes('email')
//                     ? errorMessage
//                     : '')
//                 }
//                 lang={lang}
//               />

//               {/* Phone Number Field */}
//               <div className="relative">
//                 <label className="block font-normal text-sm leading-none mb-3 text-brand-dark text-opacity-70">
//                   {t('forms:label-phone')}
//                 </label>
//                 <PhoneInput
//                   defaultCountry="PK"
//                   value={phoneValue}
//                   required={true}
//                   onChange={(value) => {
//                     setPhoneValue(value);
//                     setPhoneError(null);
//                     setIsValidPhone(value && value.length >= 12);
//                   }}
//                   placeholder="03xxx xxxxxx"
//                   className={`phone-input py-2 px-4 md:px-5 w-full appearance-none border text-input text-13px lg:text-sm font-body rounded-md placeholder-[#B3B3B3] transition duration-200 ease-in-out text-brand-dark border-border-two focus:border-2 focus:outline-none focus:ring-0 focus:border-blue-900 h-11 md:h-12 ${
//                     isValidPhone
//                       ? 'border-green-500'
//                       : isValidPhone === false
//                         ? 'border-red-500'
//                         : ''
//                   }`}
//                 />
//                 <AnimatePresence>
//                   {isValidPhone && (
//                     <motion.div
//                       initial={{ opacity: 0, x: 10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: 10 }}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                     >
//                       <FiCheckCircle className="text-green-500" />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               <PasswordInput
//                 label={t('forms:label-password')}
//                 error={errors.password?.message}
//                 {...register('password', {
//                   required: `${t('forms:password-required')}`,
//                   minLength: {
//                     value: 6,
//                     message: 'Password must be at least 6 characters',
//                   },
//                 })}
//                 lang={lang}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Password must be at least 6 characters long
//               </p>
//               <div className="flex items-center justify-center">
//                 <div className="flex items-center shrink-0">
//                   <label className="relative inline-block cursor-pointer switch">
//                     <Switch checked={remember} onChange={setRemember} />
//                   </label>

//                   <label
//                     onClick={() => setRemember(!remember)}
//                     className="mt-1 text-sm cursor-pointer shrink-0 text-heading ltr:pl-2.5 rtl:pr-2.5"
//                   >
//                     {t('forms:label-remember-me')}
//                   </label>
//                 </div>
//                 <div
//                   className="flex ltr:ml-auto rtl:mr-auto mt-[2px]"
//                   onClick={closeModal}
//                 >
//                   <Link
//                     href={`/${lang}${ROUTES.PRIVACY}`}
//                     className="text-sm ltr:text-right rtl:text-left text-heading ltr:pl-3 lg:rtl:pr-3 hover:no-underline hover:text-brand-dark focus:outline-none focus:text-brand-dark"
//                   >
//                     {t('common:text-privacy-and-policy')}
//                   </Link>
//                 </div>
//               </div>
//               <div className="relative">
//                 <Button
//                   type="submit"
//                   loading={isPending}
//                   disabled={isPending}
//                   className="w-full mt-2 tracking-normal h-11 md:h-12 font-15px md:font-15px"
//                   variant="formButton"
//                 >
//                   {loading ? 'Submitting..' : 'Register'}
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const SignupForm = ({ lang }: { lang: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen pr-[100px]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px] text-center">
        <h2 className="text-3xl font-semibold mb-2">Sign Up</h2>
        <p className="text-gray-500 mb-6 ">Getting started is easy.</p>

        {/* Fullname Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
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
            placeholder="Password"
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

        {/* Sign Up Link */}
        <p className="!mb-4 text-gray-600">
          Already have an account?{' '}
          <Link
            href={`/${lang}/signin`}
            className="text-blue-500 font-semibold"
          >
            Sign In!
          </Link>
        </p>

        {/* Login Button */}
        <button className="w-full bg-[#FFF800] text-black py-3 rounded-lg text-lg font-semibold transition">
          Create Account
        </button>
      </div>
    </div>
  );
};

export default SignupForm;