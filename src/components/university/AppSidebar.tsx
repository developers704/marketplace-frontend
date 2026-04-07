'use client';

import { ChevronDown, X ,ArrowLeft} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation'; // 🔥 FIX
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home } from 'lucide-react';

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
  // {
  //   title: 'Marketplace',
  //   url: '/en/',
  //   icon: '/icons/arrowLeft.svg',
  //   activeIcon: '/icons/arrowLeft.svg',
  // },
  {
    title: 'Reports',
    url: '/valliani-university/dashboard',
    icon: `/icons/dashboardIcon.svg`,
    activeIcon: '/icons/Homer.svg',
  },
  {
    title: 'Valliani University',
    url: '/valliani-university/courses',
    icon: `/icons/CourseIcon.svg`,
    activeIcon: '/icons/Course.svg',
  },

  // {
  //   title: 'Training',
  //   url: '/',
  //   icon: `/icons/CourseIcon.svg`,
  //   activeIcon: '/icons/Course.svg',
  //   hasDropdown: true,
  //   subItems: [
  //     {
  //       title: 'Course',
  //       url: '/valliani-university/courses',
  //       icon: `/icons/CourseIcon.svg`,
  //       activeIcon: '/icons/Course.svg',
  //     },
  //     {
  //       title: 'Short courses',
  //       url: '/valliani-university/tasks',
  //       icon: `/icons/TaskIcon.svg`,
  //       activeIcon: '/icons/Task.svg',
  //     },
  //     {
  //       title: 'Achievement',
  //       url: '/valliani-university/achievements',
  //       icon: `/icons/AchievementIcon.svg`,
  //       activeIcon: '/icons/Achievement.svg',
  //     },
  //   ],
  // },
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
  lang: String;
}

export function AppSidebar({ isOpen, onClose, lang }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // 🔥 FIX
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 🔥 FIX: auto-close dropdown on route change
  // useEffect(() => {
  //   setOpenDropdown(null);
  // }, [pathname]);

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
      {/* Top Home/Marketplace Button */}
        <div className="px-6 py-2">
        <button
         onClick={() => router.push('/')}
         className="flex items-center justify-center w-full bg-[#6f4e37] gap-4 text-base md:text-lg font-medium text-white rounded-lg py-2 "
         >
        <Home className="w-5 h-5 md:w-6 md:h-6" />
        Home
        </button>
      </div>

    {/* Navigation Items */}
    <ul className="space-y-1 mt-2">
    {navigationItems.map((item: any) => {
      const isActive = pathname === item.url;
      return (
        <li key={item.title}>
          {item.hasDropdown ? (
            <>
              <button
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === item.title ? null : item.title
                  )
                }
                className={`
                  flex items-center justify-between w-full gap-4 px-6 py-3 text-base font-medium transition-colors duration-200 border-0
                  ${isActive ? 'bg-slate-600 text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={isActive ? item?.activeIcon : item?.icon}
                    alt={`${item?.title} icon`}
                    width={20}
                    height={20}
                    unoptimized
                    className="flex-shrink-0"
                  />
                  <span>{item?.title}</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    openDropdown === item?.title ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === item?.title && (
                <ul className="pl-4">
                  {item?.subItems.map((sub: any) => {
                    const subActive = pathname === sub.url;
                    return (
                      <li key={sub?.title || "-"}>
                        <Link
                          href={sub.url}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`flex items-center gap-4 px-6 py-3 ${
                            subActive ? 'bg-slate-600 text-white' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Image src={sub?.icon} alt="" width={20} height={20} />
                          {sub?.title || "-"}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                router.push(item.url);
              }}
              className={`w-full flex items-center gap-4 px-6 py-3 text-left ${
                isActive ? 'bg-[#6f4e37] text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Image src={item.icon} alt="" width={20} height={20} />
              {item?.title || "-"}
            </button>
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