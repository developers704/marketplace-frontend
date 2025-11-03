// 'use client';
// import { useEffect, useState } from 'react';
// import LoadingScreen from '@/components/common/LoadingScreen';

// export default function RootClientLayout({ children }: { children: React.ReactNode }) {
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 100);
//     return () => clearTimeout(timer);
//   }, []);

//   return isLoading ? <LoadingScreen /> : children;
// }


'use client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isGuarding, setIsGuarding] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    const onSignin = pathname?.startsWith('/en/signin');
    const onSignup = pathname?.startsWith('/en/signup');
    const onForgot = pathname?.startsWith('/en/forgot-password');
    const isAuthPage = onSignin || onSignup || onForgot;

    if (!token && !isAuthPage) {
      router.replace('/en/signin');
      setIsGuarding(true);
      return;
    }

    if (token && onSignin) {
      router.replace('/en');
      setIsGuarding(true);
      return;
    }

    setIsGuarding(false);
  }, [pathname, router]);

  if (isGuarding) return null;
  return children;
}
