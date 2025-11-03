import SignupForm from '@/components/auth/sign-up-form';
import { Metadata } from 'next';
import Image from 'next/image';
// import signInBg from '@public/assets/images/signin.jpeg';

export const metadata: Metadata = {
  title: 'Sign Up',
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
          <div className="w-full h-screen relative mb-5 flex flex-col items-end justify-center">
            <Image
              src={'/assets/images/signin.jpeg'}
              alt="image"
              fill
              className="object-cover"
            />
            <div className="absolute">
              <SignupForm lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
