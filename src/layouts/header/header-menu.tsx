'use client';

import Link from '@components/ui/link';
import ListMenu from '@components/ui/list-menu';
import cn from 'classnames';
import { useTranslation } from 'src/app/i18n/client';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import {
  getSiteNavItems,
  normalizeNavPermissionKey,
  isSiteNavItemActive,
} from '@/layouts/header/site-nav-config';

interface MenuProps {
  lang: string;
  data: any;
  className?: string;
  userPermission?: any;
}

const HeaderMenu: React.FC<MenuProps> = ({
  lang,
  data,
  className,
}) => {
  const { t } = useTranslation(lang, 'menu');
  const path = usePathname();
  const [activePath, setActivePath] = useState(path);
  const { permissions: userPermission, isAdmin } = useContext(PermissionsContext);
  const { isAuthorized } = useUI();

  const menuItems = getSiteNavItems(lang);

  const isHome = `/${lang}` === activePath;

  useEffect(() => {
    setActivePath(path);
  }, [path]);

  const filteredMenu = menuItems.filter((item) => {
    if (isAdmin) return true;
    if (item.label === 'Marketplace') return true;
    const permissionKey = normalizeNavPermissionKey(item.label);
    if (!userPermission?.hasOwnProperty(permissionKey)) return false;
    return userPermission[permissionKey]?.View === true;
  });

  if (!isAuthorized) return <div>Login to continue</div>;

  const items = filteredMenu;

  if (items.length === 0) {
    return (
      <nav className={cn('flex min-w-0 items-center py-1', className)}>
        <span className="text-[11px] font-medium text-white/50 px-2">
          No sections available for your role
        </span>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        'headerMenu flex min-w-0 max-w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto py-1',
        className,
      )}
    >
      {items.map((item: { id: number; path: string; label: string; subMenu?: any }) => {
        const isActive = isSiteNavItemActive(item.path, activePath, lang);
        const isHomeCondition = `/${lang}` === '' && isHome;
        const active = isActive || isHomeCondition;

        return (
          <Link
            key={item.id}
            href={item.path}
            className="relative inline-flex items-center justify-center  text-center group "
          >
            <span
              className={cn(
            'relative flex-shrink min-w-0 text-center font-semibold text-white whitespace-nowrap',         
            'text-[clamp(9px,0.85vw,14px)]',
            'transition-all duration-100 ease-out',
             'transform hover:-translate-y-0.5 hover:scale-[1.02]',
            'active:translate-y-0 active:scale-[0.97]',
            'px-[clamp(6px,1vw,18px)] py-[clamp(4px,0.7vw,10px)]',
            'rounded-tl-xl rounded-br-2xl transition-all duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700',
             active
              ? 'bg-blue-900/95 ring-1 ring-blue-400/20  hover:bg-blue-800/90 hover:shadow-[0_12px_35px_rgba(30,64,175,0.45)] hover:ring-blue-300/40 active:bg-slate-900 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-black/90  ring-1 ring-black/10 hover:bg-blue-900/95 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:ring-white/10 active:bg-slate-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
          )}
        >
              {t(item.label)}
            </span>

            {item?.subMenu && Array.isArray(item.subMenu) && (
              <div className="absolute top-full z-30 mt-2 w-[220px] rounded-2xl border border-slate-200/80 bg-white py-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] opacity-0 invisible translate-y-1 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 xl:w-[240px] ltr:left-0 rtl:right-0 rtl:left-auto">
                <ul className="text-sm text-slate-600">
                  {item.subMenu.map((menu: any, index: number) => (
                    <ListMenu
                      key={`sidebar-menu-1-${index}`}
                      dept={1}
                      data={menu}
                      hasSubMenu={menu.subMenu}
                      menuName={`sidebar-menu-1-${index}`}
                      
                      menuIndex={index}
                      lang={lang}
                    />
                  ))}
                </ul>
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default HeaderMenu;
