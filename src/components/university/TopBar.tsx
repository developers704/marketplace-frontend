'use client';

import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
// import * as React from 'react';
import { Bell, User, Settings, LogOut, Menu, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import NotificationDropdown from '../common/notificationDropdown';
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

  // console.log(userData, 'user data profile');

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
            <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <NotificationDropdown />
            {/* <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button> */}

            {/* Notifications Dropdown */}
            {/* {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Notifications</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="font-medium text-gray-900">
                      New assignment posted
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Mathematics Assignment 3 is now available
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      2 hours ago
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="font-medium text-gray-900">
                      Grade updated
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Your Physics exam grade has been posted
                    </div>
                    <div className="text-xs text-gray-500 mt-2">1 day ago</div>
                  </div>
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="font-medium text-gray-900">
                      Course reminder
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Chemistry lab session tomorrow at 10 AM
                    </div>
                    <div className="text-xs text-gray-500 mt-2">2 days ago</div>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )} */}
          </div>

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              // onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-black font-semibold leading-3 capitalize">
                  {userData?.username}
                </span>
                <span className="text-[14px] text-brand-blue capitalize">
                  {userData?.role?.role_name}
                </span>
              </div>
              {/* <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" /> */}
            </button>

            {/* Profile Dropdown Menu */}
            {/* {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-600">
                    john.doe@valliani.edu
                  </div>
                </div>
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </div>
                <div className="border-t border-gray-200 py-2">
                  <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </header>
  );
}
