'use client';
import Image from 'next/image';
import React, { useContext } from 'react';
import UserIcon from '../icons/user-icon';
import { IoIosArrowForward } from 'react-icons/io';
import { FiBell, FiUser } from 'react-icons/fi';
import { AiOutlineLogout } from 'react-icons/ai';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUI } from '@/contexts/ui.context';
import { useLogoutMutation } from '@/framework/basic-rest/auth/use-logout';
import { useWishlist } from '@/contexts/wishlistContext';
import { CartContext } from '@/contexts/cart/cart.context';
import { PermissionsContext } from '@/contexts/permissionsContext';

const ProfileDropdownComp = ({
  lang,
  userData,
}: {
  lang: string;
  userData: any;
}) => {
  // console.log(userData, '===>>> user data');

  const { username, profileImage, role } = userData;
  const router = useRouter();
  const { isAuthorized } = useUI();
  const { mutate: logout } = useLogoutMutation(lang);
  const { clearWishlist } = useWishlist();
  const { clearPermissions } = useContext(PermissionsContext);
  const { removeAllItems } = useContext(CartContext);
  // console.log(isAuthorized, 'isAuthorized');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const handleLogout = () => {
    clearWishlist();
    removeAllItems();
    clearPermissions();
    logout();
  };

  return (
    <div className="w-[300px] h-[300px] bg-white !z-[10000] shadow-lg absolute py-[20px] px-[15px] top-10 right-[75%] rounded">
      {isAuthorized ? (
        <>
          <div className="flex gap-4 items-center border-b py-3">
            {/* <Image
              // src={
              //   `${BASE_API}${profileImage}` ||
              //   `/assets/images/placeholderimg.jpeg`
              // }
              src={`https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=`}
              alt="Profile"
              className="border border-brand-dark rounded-full"
              width={70}
              height={70}
            /> */}
            <FiUser className="text-opacity-40 text-[40px]" />
            <div className="font-bold capitalize">
              {username}{' '}
              <div className="font-normal text-brand-blue capitalize">
                {role}
              </div>
            </div>
          </div>
          <Link
            href={`/${lang}/profile-details?options=profile info`}
            className="flex items-center justify-between py-4 cursor-pointer"
          >
            <div className="flex items-center gap-3 hover:text-brand-blue transition-all duration-200">
              <FiUser className="text-opacity-40 text-2xl" />
              <p className="mt-1">My Profile</p>
            </div>
          </Link>
          <Link
            href={`/${lang}/notifications/all`}
            className="flex items-center justify-between py-4 cursor-pointer"
          >
            <div className="flex items-center gap-3 hover:text-brand-blue transition-all duration-200">
              <FiBell className="text-opacity-40 text-2xl" />
              <p>Notification</p>
            </div>
            {/* toggleSwitch */}
          </Link>
          <div
            onClick={() => router.push(`/${lang}/signin`)}
            className="flex items-center justify-between py-4 cursor-pointer"
          >
            <div className="flex items-center gap-3" onClick={handleLogout}>
              <AiOutlineLogout className="text-[#2C8CD4] text-2xl" />
              <p className="text-[#2C8CD4]">Log Out</p>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full flex items-center justify-center h-full">
          <div
            className="text-brand-dark border rounded-lg border-brand-muted py-2 px-4 cursor-pointer hover:bg-brand-muted hover:text-white transition-all duration-200 ease-in-out"
            onClick={() => router.push(`/${lang}/signin`)}
          >
            Login to continue
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdownComp;
