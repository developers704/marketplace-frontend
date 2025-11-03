import ForgotPasswordForm from '@/components/auth/forget-password-form';
import { Metadata } from 'next';
import Image from 'next/image';
// import signInBg from '@public/assets/images/signin.jpeg';

export const metadata: Metadata = {
  title: 'Forgot Password',
};

export default async function Page({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="w-full h-[80vh]">
          <div className="w-full h-screen relative mb-5 flex flex-col items-center justify-center">
            <Image
              src={'/assets/images/resetPassDone.jpeg'}
              alt="image"
              fill
              className="object-cover"
            />
            <div className="absolute">
              <ForgotPasswordForm lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
