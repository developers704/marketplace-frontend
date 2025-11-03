// 'use client';
// // hooks/useInactivityLogout.ts
// import { useContext, useEffect, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { useLogoutMutation } from '@/framework/basic-rest/auth/use-logout';
// import { useWishlist } from '@/contexts/wishlistContext';
// import { PermissionsContext } from '@/contexts/permissionsContext';
// import { CartContext } from '@/contexts/cart/cart.context';
// import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

// export default function useInactivityLogout() {
//   const [securitySettings, setSecuritySettings] = useState<any>(null);
//   const {
//     data: userData,
//     isLoading: userLoading,
//     error: userError,
//   } = useUserDataQuery();

//   useEffect(() => {
//     if (!userLoading) {
//       setSecuritySettings(userData?.securitySettings);
//     }
//   }, [userLoading]);

//   // console.log(securitySettings, 'securitySettings');

//   const INACTIVITY_LIMIT = securitySettings?.autoLogout?.timeLimit * 1000; // 1 minute in milliseconds
//   const timer = useRef<NodeJS.Timeout | null>(null);
//   const router = useRouter();
//   const { mutate: logout } = useLogoutMutation('en');
//   const { clearWishlist } = useWishlist();
//   const { clearPermissions } = useContext(PermissionsContext);
//   const { removeAllItems } = useContext(CartContext);

//   const resetTimer = () => {
//     if (timer.current) clearTimeout(timer.current);
//     timer.current = setTimeout(() => {
//       // Cookies.remove('auth_token'); // Remove your auth cookie
//       // router.push('/en/signin'); // Redirect to login page
//       // clearWishlist();
//       logout();
//       removeAllItems();
//       clearPermissions();
//     }, INACTIVITY_LIMIT);
//   };

//   useEffect(() => {
//     const events = [
//       'mousemove',
//       'keydown',
//       'mousedown',
//       'touchstart',
//       'scroll',
//     ];

//     events.forEach((event) => window.addEventListener(event, resetTimer));
//     resetTimer(); // Initial timer start

//     return () => {
//       events.forEach((event) => window.removeEventListener(event, resetTimer));
//       if (timer.current) clearTimeout(timer.current);
//     };
//   }, []);
// }

'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useLogoutMutation } from '@/framework/basic-rest/auth/use-logout';
import { useWishlist } from '@/contexts/wishlistContext';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { CartContext } from '@/contexts/cart/cart.context';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

export default function useInactivityLogout() {
  const [securitySettings, setSecuritySettings] = useState<any>(null);
  const { data: userData, isLoading: userLoading } = useUserDataQuery();

  useEffect(() => {
    if (!userLoading && userData?.securitySettings) {
      setSecuritySettings(userData.securitySettings);
    }
  }, [userLoading, userData]);

  const timer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { mutate: logout } = useLogoutMutation('en');
  const { clearWishlist } = useWishlist();
  const { clearPermissions } = useContext(PermissionsContext);
  const { removeAllItems } = useContext(CartContext);

  const resetTimer = () => {
    if (!securitySettings?.autoLogout?.enabled) return; // ✅ extra safety
    if (timer.current) clearTimeout(timer.current);
    // const timeout = 20 * 1000; // fallback 1 min
    const timeout = securitySettings?.autoLogout?.timeLimit
      ? securitySettings.autoLogout.timeLimit * 1000
      : 60000; // fallback 1 min
    timer.current = setTimeout(() => {
      clearPermissions();
      removeAllItems();
      logout();
    }, timeout);
  };

  useEffect(() => {
    if (!securitySettings?.autoLogout?.enabled) return;

    const events = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Initial timer start

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [securitySettings]);

  return null;
}
