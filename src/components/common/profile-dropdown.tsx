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
  <div
    className="absolute right-[70%] top-12 w-[260px] rounded-xl 
    bg-[linear-gradient(145deg,#0B0F19,#111827)] 
    border border-white/10
    shadow-[0_25px_70px_rgba(0,0,0,0.55)]
    backdrop-blur-xl text-white overflow-hidden z-[10000]"
  >
    {isAuthorized && (
      <>
        {/* HEADER */}
        <div className="flex items-center gap-2 p-4
        border-b border-white/10
        bg-gradient-to-r from-white/[0.04] to-transparent">

          {/* Avatar */}
          <div className="relative w-[40px] h-[40px] rounded-full 
          bg-gradient-to-tr from-indigo-600 via-blue-600 to-slate-800
          flex items-center justify-center
          shadow-[0_8px_25px_rgba(59,130,246,0.35)]
          ring-1 ring-white/20">

            <FiUser className="text-[24px] " />

            {/* subtle luxury highlight */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-40"></div>
          </div>

          {/* Name */}
          <div className="leading-tight">
            <p className="font-semibold tracking-wide text-[15px]">
              {username}
            </p>
            <p className="text-[12px] text-white capitalize tracking-wider">
              {role}
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="py-2">

          <Link
            href={`/${lang}/profile-details?options=profile info`}
            className="flex items-center gap-3 px-6 py-3
            hover:bg-white/[0.04]
            transition-all duration-200 group "
          >
            <FiUser className="text-[18px] text-white/60 group-hover:text-amber-300 transition" />
            <span className="text-[14px] tracking-wide">
              My Profile
            </span>
          </Link>

          <Link
            href={`/${lang}/notifications/all`}
            className="flex items-center gap-3 px-6 py-3
            hover:bg-white/[0.04]
            transition-all duration-200 group"
          >
            <FiBell className="text-[18px] text-white/60 group-hover:text-amber-300 transition" />
            <span className="text-[14px] tracking-wide">
              Notifications
            </span>
          </Link>

        </div>

        {/* FOOTER LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              handleLogout();
              router.push(`/${lang}/signin`);
            }}
                  className="w-full py-2 rounded-tl-2xl rounded-br-2xl flex items-center justify-center gap-2
                  bg-[linear-gradient(120deg,#3B2F05,#0F172A)]
                  hover:bg-[linear-gradient(120deg,#5A4308,#020617)]
                  transition-all duration-200
                  active:scale-[0.97]"
          >
          <AiOutlineLogout className="text-[18px] text-amber-200" />
          <span className="tracking-wide font-medium text-amber-200">Log Out</span>

          </button>
        </div>
      </>
    )}
  </div>
);

};

export default ProfileDropdownComp;
