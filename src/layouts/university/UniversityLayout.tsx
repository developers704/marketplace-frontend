'use client';

import { AppSidebar } from '@/components/university/AppSidebar';
import { Topbar } from '@/components/university/TopBar';
import useInactivityLogout from '@/utils/useInactivityLogout';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
// import * as React from "react"
// import { AppSidebar } from "@/components/app-sidebar"
// import { Topbar } from "@/components/topbar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Extract language from pathname (e.g., /en/dashboard -> en)
  const currentLang = pathname.split('/')[1] || 'en';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useInactivityLogout();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onClose={closeSidebar} lang={currentLang} />

      <div className="flex-1 flex flex-col xl:ml-64">
        <Topbar onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
