'use client';

import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
// import * as React from 'react';
import { Bell, User, Settings, LogOut, Menu, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import NotificationDropdown from '../common/notificationDropdown';
import { useRouter } from 'next/navigation';
import { useLogoutMutation } from '@/framework/basic-rest/auth/use-logout';
import Link from 'next/link';
import { FiBell } from 'react-icons/fi';
import { DotLoader, PulseLoader } from 'react-spinners';
// import { useState, useEffect } from 'react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationCount] = useState(3);
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUserDataQuery();
  const router = useRouter();
  const lang = "en"
  const { mutate: logout } = useLogoutMutation(lang);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!target.closest('.profile-dropdown')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
  logout();
  router.push('/signin');
};
 
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4">
      <div className="w-full flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 xl:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <NotificationDropdown />

          </div>

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              // onClick={() => setShowProfile(!showProfile)}
              onClick={(e) => {
              e.stopPropagation();
              setShowProfile(!showProfile);
              }}
              className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-black font-semibold leading-3 capitalize">
                  {userData?.username || "-"}
                </span>
                <span className="text-[14px] text-brand-blue capitalize">
                  {userData?.role?.role_name || "-"}
                </span>
              </div>
              {/* <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" /> */}
            </button>

            {/* Profile Dropdown Menu */}
           {showProfile && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                {userLoading ? (<>
               <PulseLoader color="#21caff" size={10} />
                </>) : (<div>
                  <div className="font-semibold capitalize">
                    {userData?.username || "-"}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {userData?.role?.role_name || '-'}
                  </div>
                </div>)}
                
              </div>

              {/* Menu */}
              <div className="py-2">
                <Link
                  href={`/${lang}/profile-details?options=profile info`}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>

                <Link
                  href={`/${lang}/notifications/all`}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <FiBell className="h-4 w-4" />
                  Notification
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}


          </div>
        </div>
      </div>
    </header>
  );
}
