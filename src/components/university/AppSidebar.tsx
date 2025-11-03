'use client';

// import type * as React from 'react';
import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  activeIcon?: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  subItems?: any;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    url: '/en/',
    icon: `/icons/HomeIcon.svg`,
    activeIcon: '/icons/DashboardIconActive.svg',
  },
  {
    title: 'Dashboard',
    url: '/valliani-university/dashboard',
    icon: `/icons/dashboardIcon.svg`,
    activeIcon: '/icons/Homer.svg',
  },
  {
    title: 'Training',
    url: '/',
    icon: `/icons/CourseIcon.svg`,
    activeIcon: '/icons/Course.svg',
    hasDropdown: true,
    subItems: [
      {
        title: 'Course',
        url: '/valliani-university/courses',
        icon: `/icons/CourseIcon.svg`,
        activeIcon: '/icons/Course.svg',
      },
      {
        title: 'Short courses',
        url: '/valliani-university/tasks',
        icon: `/icons/TaskIcon.svg`,
        activeIcon: '/icons/Task.svg',
      },
      {
        title: 'Achievement',
        url: '/valliani-university/achievements',
        icon: `/icons/AchievementIcon.svg`,
        activeIcon: '/icons/Achievement.svg',
      },
    ],
  },
  {
    title: 'Policies',
    url: '/valliani-university/policies',
    icon: `/icons/PolicesIcon.svg`,
    activeIcon: '/icons/Polices.svg',
  },
  // {
  //   title: 'Achievement',
  //   url: '/valliani-university/achievements',
  //   icon: `/icons/AchievementIcon.svg`,
  //   activeIcon: '/icons/Achievement.svg',
  // },
  // {
  //   title: 'Task',
  //   url: '/valliani-university/tasks',
  //   icon: `/icons/TaskIcon.svg`,
  //   activeIcon: '/icons/Task.svg',
  // },
  {
    title: 'About Us',
    url: '/valliani-university/about-us',
    icon: `/icons/About_UsIcon.svg`,
    activeIcon: '/icons/About_Us.svg',
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        xl:translate-x-0 xl:fix xl:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 xl:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 py-6">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            VALLIANI
          </h1>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            UNIVERSITY
          </h2>
        </div>

        {/* Navigation */}
        <nav className="mt-2">
          <ul className="space-y-1">
            {navigationItems.map((item: any) => {
              const isActive = pathname === item.url;
              return (
                <li key={item.title}>
                  {/* <Link
                    href={item.url}
                    className={`
                      flex items-center gap-4 px-6 py-3 text-base font-medium transition-colors duration-200
                      ${
                        isActive
                          ? 'bg-slate-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => {
                      // Close mobile sidebar when clicking a link
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Image
                      src={isActive ? item.activeIcon : item.icon}
                      alt={`${item.title} icon`}
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <span>{item.title}</span>
                  </Link> */}
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown((prev) =>
                            prev === item.title ? null : item.title,
                          )
                        }
                        className={`
                      flex items-center justify-between w-full gap-4 px-6 py-3 text-base font-medium transition-colors duration-200 border-0
                      ${
                        isActive
                          ? 'bg-slate-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={isActive ? item.activeIcon : item.icon}
                            alt={`${item.title} icon`}
                            width={20}
                            height={20}
                            className="flex-shrink-0"
                          />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                            openDropdown === item.title ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {item.subItems && openDropdown === item.title && (
                        <ul className="space-y-0 pl-4">
                          {item.subItems.map((subItem: any) => {
                            const isActive = pathname === subItem.url;
                            return (
                              <>
                                <li key={subItem.title}>
                                  <Link
                                    href={subItem.url}
                                    className={` flex items-center w-full gap-4 px-6 py-3 text-base font-medium transition-colors duration-200 border-0  ${
                                      isActive
                                        ? 'bg-slate-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    onClick={() => {
                                      // Close mobile sidebar when clicking a link
                                      if (window.innerWidth < 1024) {
                                        onClose();
                                      }
                                    }}
                                  >
                                    <Image
                                      src={
                                        isActive
                                          ? subItem.activeIcon
                                          : subItem.icon
                                      }
                                      alt={`${subItem.title} icon`}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0"
                                    />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </li>
                              </>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      className={`
                      flex items-center gap-4 px-6 py-3 text-base font-medium transition-colors duration-200 border-0
                      ${
                        isActive
                          ? 'bg-slate-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                      onClick={(e) => {
                        // Close mobile sidebar when clicking a link
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                        
                        // For Home button, prevent default and use window.location to preserve session
                        if (item.title === 'Home') {
                          e.preventDefault();
                          // Use window.location.href to maintain authentication state
                          window.location.href = '/en/';
                        }
                      }}
                    >
                      <Image
                        src={isActive ? item.activeIcon : item.icon}
                        alt={`${item.title} icon`}
                        width={20}
                        height={20}
                        className="flex-shrink-0"
                      />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
