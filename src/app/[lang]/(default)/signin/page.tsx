import LoginForm from '@components/auth/login-form';
import { Metadata } from 'next';
import Image from 'next/image';
// import signInBg from '@public/assets/images/signin.jpeg';

export const metadata: Metadata = {
  title: 'Sign In',
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
      <div className="">
            <LoginForm lang={lang} />
        {/* <div className="w-full max-w-md bg-red-400">
          <div className="rounded-lg flex items-center justify-center w-full">
            <Image
              src={'/assets/images/resetPassDone.jpeg'}
              alt="image"
              fill
              className="object-cover"
            />
            <div className="bg-red-900">
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
}
