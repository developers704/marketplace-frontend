import LoginForm from '@components/auth/login-form';
import { Metadata } from 'next';
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
      <div className="flex items-center justify-start">
        <div className="w-full">
          <div className="w-full mb-5 flex flex-col items-center justify-start">
            {/* <Image
              src={'/assets/images/resetPassDone.jpeg'}
              alt="image"
              fill
              className="object-cover"
            /> */}
            <div className="">
              <LoginForm lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
