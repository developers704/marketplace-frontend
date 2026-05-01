'use client';

import Link from '@components/ui/link';
import ListMenu from '@components/ui/list-menu';
import cn from 'classnames';
import { useTranslation } from 'src/app/i18n/client';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';

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
  const { permissions: userPermission } = useContext(PermissionsContext);
  const { isAuthorized } = useUI();

  const menuItems = [
    { id: 1, path: `/${lang}/`, label: 'Home' },
    { id: 2, path: '/valliani-university', label: 'Valliani University' },
      // {
    //   id: 3,
    //   path: '/inventory-orders',
    //   label: 'Inventory Order',
    // },
    { id: 10, path: `/${lang}/marketplace`, label: 'Inventory' },
        // {
    //   id: 9,
    //   path: `/${lang}/Inventory`,
    //   label: 'Inventory',
    // },
    { id: 4, path: `/${lang}/marketing`, label: 'Marketing' },
    { id: 5, path: `/${lang}/supplies`, label: 'Supplies' },
    { id: 11, path: `/${lang}/marketplace/store-inventory`, label: 'My inventory' },
    { id: 6, path: `/${lang}/tool-findings`, label: 'Tool Finding' },
    { id: 8, path: `/${lang}/GWP`, label: 'GWP' },
     // {
    //   id: 7,
    //   path: '/packaging',
    //   label: 'GWP',
    // },
    { id: 9, path: `/${lang}/special-order`, label: 'Special Order' },
    { id: 10, path: `/${lang}/special-order/sheets`, label: 'Report' },
  ];

  const isHome = `/${lang}` === activePath;

  useEffect(() => {
    setActivePath(path);
  }, [path]);

  const specialOrderPath = `/${lang}/special-order`;
  const sheetsMenuPath = `/${lang}/special-order/sheets`;

  const isMenuItemActive = (itemPath: string) => {
    if (itemPath === sheetsMenuPath) {
      return activePath === sheetsMenuPath || activePath.startsWith(`${sheetsMenuPath}/`);
    }
    if (itemPath === specialOrderPath) {
      if (activePath === specialOrderPath) return true;
      return (
        activePath.startsWith(`${specialOrderPath}/`) &&
        !activePath.startsWith(sheetsMenuPath)
      );
    }
    return activePath === itemPath;
  };

  const normalizeKey = (label: string) => {
    const mapping: Record<string, string> = {
      Inventory: 'Inventory Order',
    };
    return mapping[label] || label.trim().replace(/\s*\/\s*/g, '-');
  };

  const filteredMenu = menuItems.filter((item) => {
    if (item.label === 'Marketplace') return true;
    const permissionKey = normalizeKey(item.label);
    if (!userPermission?.hasOwnProperty(permissionKey)) return false;
    return userPermission[permissionKey]?.View === true;
  });

  if (!isAuthorized) return <div>Login to continue</div>;

  const items = filteredMenu.length === 0 ? menuItems : filteredMenu;

  return (
    <nav
      className={cn(
    'headerMenu flex flex-nowrap  items-center justify-start gap-2 py-1 w-full overflow-hidden',
    className
  )}
    >
      {items.map((item: { id: number; path: string; label: string; subMenu?: any }) => {
        const isActive = isMenuItemActive(item.path);
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
