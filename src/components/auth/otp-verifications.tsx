import { useForm } from 'react-hook-form';
import { useTranslation } from 'src/app/i18n/client';
import Swal from 'sweetalert2';

// Components
import Button from '@components/ui/button';
import Input from '@components/ui/form/input';
import Logo from '@components/ui/logo';
import CloseButton from '@components/ui/close-button';

// Context & Utilities
import { useModalAction } from '@components/common/modal/modal.context';

// Types
type FormValues = {
  otp: string;
};

const defaultValues: FormValues = {
  otp: '',
};

const OTPVerification = ({ lang }: { lang: string }) => {
  const { t } = useTranslation(lang);
  const { closeModal, openModal } = useModalAction();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
  });

  // Constants
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  // Handlers
  const handleSignIn = () => openModal('LOGIN_VIEW');

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await fetch(`${BASE_API}/api/auth/customer/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otpCode: values.otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Success notification
      Swal.fire({
        title: 'Verification Successful!',
        text: 'You are now logged in.',
        icon: 'success',
        confirmButtonText: 'Ok',
        timer: 1500,
      });

      // closeModal(); // Uncomment to close modal on success
    } catch (error: any) {
      console.error('OTP Verification Error:', error);

      // Error notification
      Swal.fire({
        title: 'Oops!',
        text: error?.message || 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Ok',
        timer: 1500,
      });
    }
  };

  return (
    <div className="w-full px-5 py-6 mx-auto rounded-lg sm:p-8 bg-brand-light sm:w-96 md:w-450px">
      <CloseButton onClick={closeModal} />
      <div className="text-center mb-9 pt-2.5">
        <div onClick={closeModal}>
          <Logo />
        </div>
        <p className="mt-3 mb-8 text-sm md:text-base text-body sm:mt-4 sm:mb-10">
          {'Please enter the OTP sent to your email.'}
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <Input
          label={'OTP'}
          type="text"
          variant="solid"
          className="mb-4"
          placeholder={'Enter your OTP here'}
          {...register('otp', { required: t('otp:errorRequired') })}
          error={errors.otp?.message}
          lang={lang}
        />
        <Button
          type="submit"
          variant="formButton"
          className="w-full mt-0 h-11 md:h-12"
        >
          {'Verify OTP'}
        </Button>
      </form>
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-10 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 px-2 bg-brand-light">
          {t('common:text-or')}
        </span>
      </div>
      <div className="text-sm text-center sm:text-15px text-brand-muted">
        {t('common:text-back-to')}{' '}
        <button
          type="button"
          className="font-medium underline text-brand-dark hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          {t('common:text-login')}
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;
