import Button from '@components/ui/button';
import Input from '@components/ui/form/input';
import Logo from '@components/ui/logo';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'src/app/i18n/client';
import { useModalAction } from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import PasswordInput from '@components/ui/form/password-input';
import Swal from 'sweetalert2';

type ResetPasswordType = {
  otpCode: string;
  newPassword: string;
};

const defaultValues = {
  otpCode: '',
  newPassword: '',
};

const ResetPasswordForm = ({ lang }: { lang: string }) => {
  const { t } = useTranslation(lang);
  const { closeModal, openModal } = useModalAction();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordType>({
    defaultValues,
  });

  function handleSignIn() {
    return openModal('LOGIN_VIEW');
  }

  const onSubmit = async (values: ResetPasswordType) => {
    try {
      const BASE_API = 'https://backendapi.chase.boundlesstechnologies.net/';
      const response = await fetch(
        `${BASE_API}/api/auth/customer/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            otpCode: values.otpCode,
            newPassword: values.newPassword,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reset password failed');
      }

      const data = await response.json();
      if (data) {
        let timerInterval: any;
        Swal.fire({
          title: 'Password Reset Successfully',
          html: 'Please login to proceed.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: true,
          didOpen: () => {
            const timer = Swal?.getPopup()?.querySelector('b');
            timerInterval = setInterval(() => {
              if (timer) {
                timer.textContent = `${Swal.getTimerLeft()}`;
              }
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
            closeModal();
          },
        });
      }
    } catch (error: any) {
      // Handle error (optional: you could set an error message state here)
      console.error(error.message);
      Swal.fire({
        title: 'Oops!',
        text: error?.message || 'Reset password failed',
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
          {
            'Enter the OTP sent to your email address and choose a new password.'
          }
        </p>
      </div>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="flex flex-col justify-center"
        noValidate
      >
        <Input
          label={t('OTP') as string}
          type="text"
          variant="solid"
          className="mb-4"
          placeholder="Enter your OTP"
          {...register('otpCode', {
            required: `${t('forms:otp-required')}`,
            minLength: {
              value: 4,
              message: t('forms:otp-min-length-error'),
            },
          })}
          error={errors.otpCode?.message}
          lang={lang}
        />

        <PasswordInput
          label={t('New Password')}
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: `${t('forms:password-required')}`,
          })}
          lang={lang}
          placeholder="Enter your new password"
          className="mb-4"
        />

        <Button
          type="submit"
          variant="formButton"
          className="w-full mt-0 h-11 md:h-12"
        >
          {'Reset Password'}
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

export default ResetPasswordForm;
