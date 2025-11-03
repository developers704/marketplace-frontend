'use client';
import Link from '@components/ui/link';
import { FaChevronDown } from 'react-icons/fa';
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

// deactive menu = #666665
// group-hover:text-brand-underline_color before:absolute before:w-0 before:ltr:right-0 rtl:left-0 before:bg-brand-underline_color before:h-[3px] before:transition-all before:duration-300 before:-bottom-[14px] group-hover:before:w-full ltr:group-hover:before:left-0 rtl:group-hover:before:right-0 lrt:group-hover:before:right-auto rtl:group-hover:before:left-auto

const HeaderMenu: React.FC<MenuProps> = ({
  lang,
  data,
  className,
  // userPermission,
}) => {
  const { t } = useTranslation(lang, 'menu');
  const path = usePathname();
  const [activePath, setActivePath] = useState(path);
  const [menuToShow, setMenuToShow] = useState<any>(null);
  const { permissions: userPermission } = useContext(PermissionsContext);
  const { isAuthorized } = useUI();
  const key = 'Cart';

  const menuItems = [
    {
      id: 1,
      path: `/${lang}/`,
      label: 'Home',
    },
    {
      id: 2,
      path: '/valliani-university',
      label: 'Valliani University',
    },
    // {
    //   id: 3,
    //   path: '/inventory-orders',
    //   label: 'Inventory Order',
    // },
    {
      id: 9,
      path: `/${lang}/Inventory`,
      label: 'Inventory',
    },
    {
      id: 4,
      path: `/${lang}/marketing`,
      label: 'Marketing',
    },
    {
      id: 5,
      path: `/${lang}/supplies`,
      label: 'Supplies',
    },
    {
      id: 6,
      path: `/${lang}/tool-findings`,
      label: 'Tool Finding',
    },
    // {
    //   id: 7,
    //   path: '/packaging',
    //   label: 'GWP',
    // },
    {
      id: 8,
      path: `/${lang}/GWP`,
      label: 'GWP',
    },
  ];

  // console.log(path)
  // console.log(userPermission, '====>>> active userPermission');
  // console.log(data, '=====> data');
  const isHome = `/${lang}` === activePath;
  // console.log(isHome, '====>>> isHome path');
  useEffect(() => {
    setActivePath(path);
  }, [path]);

  // const normalizeKey = (label: string) =>
  //   label.trim().replace(/\s*\/\s*/g, '-'); // Normalize menu labels to match permission keys

  const normalizeKey = (label: string) => {
    const mapping: any = {
      Inventory: 'Inventory Order', // Map Inventory to inventory-orders
    };

    return mapping[label] || label.trim().replace(/\s*\/\s*/g, '-');
  };

  const filteredMenu = menuItems.filter((item) => {
    const permissionKey = normalizeKey(item.label);
    // console.log(permissionKey, '====>>> permissionKey');

    // Check if permissionKey exists in userPermissions
    if (!userPermission?.hasOwnProperty(permissionKey)) {
      return false; // Skip if permission is missing
    }

    return userPermission[permissionKey]?.View === true;
  });

  // console.log(filteredMenu, '====>>> filteredMenu');

  if (!isAuthorized) return <div>Login to continue</div>;

  return (
    <nav
      className={cn(
        'headerMenu  flex overflow-x-auto space-x-2 scrollbar-thin scrollbar-custom',
        className,
      )}
    >
      {/* (filteredMenu.length === 0 ? menuItems : filteredMenu) */}
      {(filteredMenu.length === 0 ? menuItems : filteredMenu)?.map(
        (item: any) => {
          const isActive = `${item.path}` === activePath;
          const isHomeCondition = `/${lang}` === '' && isHome; // Special condition for home page
          // console.log(isHomeCondition)
          return (
            <Link
              href={`${item.path}`}
              className={`relative inline-flex items-center justify-center text-[10px] font-semibold xl:text-[14px] text-brand-light text-center`}
            >
              <div
                className={cn(
                  'min-w-max text-white xl:py-[8px] xl:px-[20px] lg:py-[5px] lg:px-[10px] md:py-[3px] px-[10px] text-[10px] xl:text-[14px] rounded-full shadow-lg hover:bg-blue-400 transition-colors',
                  {
                    'bg-[#3A7BD5]': isActive || isHome, // Active state background or home condition
                    'bg-[#666665]': !isActive && !isHomeCondition, // Inactive state background
                  },
                )}
                key={item.id}
              >
                {/* {console.log(`/${lang}${item.path}`)} */}

                {t(item.label)}

                {item?.subMenu && Array.isArray(item?.subMenu) && (
                  <div className="absolute z-30 opacity-0 subMenu shadow-dropDown transition-all duration-300 invisible bg-brand-light ltr:left-0 rtl:right-0 w-[220px] xl:w-[240px] group-hover:opacity-100">
                    <ul className="py-5 text-sm text-brand-muted">
                      {item.subMenu.map((menu: any, index: number) => {
                        const dept: number = 1;
                        const menuName: string = `sidebar-menu-${dept}-${index}`;
                        return (
                          <ListMenu
                            dept={dept}
                            data={menu}
                            hasSubMenu={menu.subMenu}
                            menuName={menuName}
                            key={menuName}
                            menuIndex={index}
                            lang={lang}
                          />
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </Link>
          );
        },
      )}
    </nav>
  );
};

export default HeaderMenu;
