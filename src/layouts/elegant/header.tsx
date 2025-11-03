'use client';

import { useContext, useEffect, useRef, useState } from 'react';
// import { IoBagAddOutline } from 'react-icons/io5';
import dynamic from 'next/dynamic';
import cn from 'classnames';
import { ROUTES } from '@utils/routes';
import { useUI } from '@contexts/ui.context';
import { siteSettings } from '@settings/site-settings';
import { useActiveScroll } from '@utils/use-active-scroll';
import Container from '@components/ui/container';
import Logo from '@components/ui/logo';
import HeaderMenu from '@layouts/header/header-menu';
import Search from '@components/common/search';
import LanguageSwitcher from '@components/ui/language-switcher';
import UserIcon from '@components/icons/user-icon';
import SearchIcon from '@components/icons/search-icon';
import { useModalAction } from '@components/common/modal/modal.context';
import useOnClickOutside from '@utils/use-click-outside';
import { FiMenu } from 'react-icons/fi';
import CategoryDropdownMenu from '@components/category/category-dropdown-menu';
import { useTranslation } from 'src/app/i18n/client';
import WishlistCounter from '@components/common/point-counter';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { CustomerProfile } from '@/components/my-account/account-details';
import LocationSelector from '@/components/ui/Deliver';
import { useProfile } from '@/contexts/profileContext';
import WalletBalance from '@/components/common/WalletBalance';
import ProfileDropdownComp from '@/components/common/profile-dropdown';
import { useCategoriesQuery } from '@/framework/basic-rest/category/get-all-categories';
import {
  getWishListItem,
  useGetAllWishlist,
} from '@/framework/basic-rest/wishlist/get-wishlist';
import { CartContext } from '@/contexts/cart/cart.context';
import { useWishlist } from '@/contexts/wishlistContext';
import { getAllCartItems } from '@/framework/basic-rest/cart/use-cart';
import { FaRegBell } from 'react-icons/fa';
import NotificationDropdown from '@/components/common/notificationDropdown';
import { permission } from 'process';
import GlobalSearch from '@/components/common/globalSearch';
import { PermissionsContext } from '@/contexts/permissionsContext';
const Delivery = dynamic(() => import('@layouts/header/delivery'), {
  ssr: false,
});
const AuthMenu = dynamic(() => import('@layouts/header/auth-menu'), {
  ssr: false,
});
const CartButton = dynamic(() => import('@components/cart/cart-button'), {
  ssr: false,
});

type DivElementRef = React.MutableRefObject<HTMLDivElement>;
const { site_header } = siteSettings;

function Header({ lang }: { lang: string }) {
  const { t } = useTranslation(lang, 'common');
  const {
    displaySearch,
    displayMobileSearch,
    openSearch,
    closeSearch,
    isAuthorized,
  } = useUI();
  const { openModal } = useModalAction();
  const siteHeaderRef = useRef() as DivElementRef;
  const siteSearchRef = useRef() as DivElementRef;
  const categoryBtnRef = useRef() as DivElementRef;
  const profileBtnRef = useRef() as DivElementRef;
  const notificationBtnRef = useRef() as DivElementRef;
  const [categoryMenu, setCategoryMenu] = useState(Boolean(false));
  const [wishlistCounter, setWishlistCounter] = useState<number | any>(0);
  const [cartCounter, setCartCounter] = useState<number | any>(0);
  const [profileDropdown, setprofileDropdown] = useState(Boolean(false));
  const [notificationDropdown, setNotificationDropdown] = useState(
    Boolean(false),
  );
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { addToWishlist, addAllToWishlist } = useWishlist();
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';

  const [userData, setUserData] = useState<any | null>({
    username: null,
    profileImage: null,
    role: null,
    permissions: null,
  });
  const { getCartLength, addAllToCart } = useContext(CartContext);
  const [cartItemsLength, setCartItemsLength] = useState<number | any>(0);
  const parentRef = useRef<HTMLDivElement>(null);
  useActiveScroll(siteHeaderRef, 40);
  useOnClickOutside(siteSearchRef, () => closeSearch());
  useOnClickOutside(categoryBtnRef, () => setCategoryMenu(false));
  useOnClickOutside(profileBtnRef, () => setprofileDropdown(false));
  useOnClickOutside(notificationBtnRef, () => setNotificationDropdown(false));

  const closeMenu = () => {
    setCategoryMenu(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40); // true if scrolled more than 10px
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        parentRef.current &&
        !parentRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogin() {
    openModal('LOGIN_VIEW');
  }

  function handleCategoryMenu() {
    setCategoryMenu(!categoryMenu);
  }
  function handleProfileDropwown() {
    setprofileDropdown(!profileDropdown);
  }

  function handleNotificationDropwown() {
    setNotificationDropdown(!notificationDropdown);
  }

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const { profileImage, updateProfileImage } = useProfile();
  // console.log('prfile image is ', profileImage);

  const fetchProfileData = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token || !isAuthorized) return;
      const response = await fetch(`${BASE_API}/api/customers/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const data: CustomerProfile = await response.json();
      // console.log('Fetched profile data:', data);
      const { username, profileImage, role } = data;
      const { role_name } = role;
      setUserData({
        username,
        profileImage,
        role: role_name,
        permissions: role.permissions,
      });
      if (data.profileImage) {
        setCurrentImageUrl(`${BASE_API}/${data.profileImage}`);
        updateProfileImage(`${BASE_API}/${data.profileImage}`);
      }
    } catch (error: any) {
      console.log('Error fetching profile:', error.message);
    }
  };

  const fetchAllCartItems = async () => {
    const response = await getAllCartItems();
    // console.log(response, '====>>>> fetchAllCartItems');
    if (response.items) {
      // setAllCart(response);
      addAllToCart(response.items);
      setCartCounter(response.items.length || 0);
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      const response = await getWishListItem(); // Fetch wishlist API
      // setWishlist(response); // ✅ Update state
      if (response) {
        setWishlistCounter(response?.products?.length || 0);
        addAllToWishlist(response?.products);
        // response?.products.forEach((product: any) => {
        //   addToWishlist(product);
        // });
      }
    };
    if (isAuthorized) {
      fetchProfileData();
      fetchWishlist();
      fetchAllCartItems();
    }
    // console.log(permission, 'permission');
  }, [isAuthorized]);

  return (
    <header
      id="siteHeader"
      ref={siteHeaderRef}
      className={cn(
        'header-five sticky-header sticky -top-[1px] z-50 lg:relative w-full h-16 lg:h-auto pt-2',
        displayMobileSearch && 'active-mobile-search',
      )}
    >
      <div className="z-20 w-full transition-all duration-200 ease-in-out innerSticky relative lg:w-full body-font bg-brand-light">
        <Search
          searchId="mobile-search"
          className="top-bar-search hidden lg:max-w-[600px] absolute z-30 px-4 md:px-6 top-1"
          lang={lang}
        />
        {/* End of Mobile search */}
        <Container className="flex items-center justify-between h-20 py-7 border-b top-bar lg:h-auto border-border-base">
          <div>
            <div ref={parentRef} className="relative shrink-0 lg:invisible">
              <button
                className="border border-border-base rounded-md focus:outline-none shrink-0 text-sm lg:text-15px font-medium text-brand-dark px-2.5 md:px-3 lg:px-[18px] py-2 md:py-2.5 lg:py-3 flex items-center transition-all hover:border-border-four"
                onClick={handleCategoryMenu}
              >
                <FiMenu className="text-xl lg:text-2xl" />
                <span className="hidden md:inline-flex ltr:ml-2.5 rtl:mr-2.5">
                  {t('text-all-categories')}
                </span>
              </button>
              {categoryMenu && (
                <CategoryDropdownMenu className="mt-3 md:mt-2.5" />
              )}
            </div>
          </div>
          {/* End of Category */}
          {/* logo will change here */}
          <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 relative">
            <Logo className="logo -mt-1.5 md:-mt-1 md:mx-auto ltr:pl-3 rtl:pr-3 md:ltr:pl-0 md:rtl:pr-0 lg:mx-0 w-full lg:w-[450px] md:w-[350px] sm:w-auto " />
          </div>
          {/* End of logo */}
          {/* <LocationSelector /> */}
          {/* <div className="flex lg:hidden lg:flex-1">
            <FaRegBell />
          </div> */}
          <div className="flex lg:hidden lg:flex-1">
            <WalletBalance lang={lang} />
          </div>

          {/* <Search
            searchId="top-bar-search"
            className="hidden lg:flex lg:max-w-[650px] 2xl:max-w-[800px] lg:mx-8"
            variant="fill"
            lang={lang}
          /> */}
          {/* End of search */}

          <div className="ltr:ml-auto rtl:mr-auto md:ltr:ml-0 md:rtl:mr-0">
            <div className="shrink-0 -mx-2.5 xl:-mx-3.5 hidden lg:flex items-center ">
              <div>
                <NotificationDropdown />
              </div>
              <Link href={`/${lang}/profile-details?option=Store Wallet`}>
                <WalletBalance lang={lang} />
              </Link>
              <Link
                href={`/${lang}/wishlist`}
                className="xl:mx-3.5 mx-2.5 hidden lg:flex"
              >
                <WishlistCounter count={wishlistCounter} />
              </Link>
              {/* {console.log(permissions, "per")} */}
              {permissions[key]?.View && (
                <Link href={`/${lang}/cart`}>
                  <CartButton
                    className="hidden lg:flex xl:mx-3.5 mx-2.5"
                    lang={lang}
                    cartItemsLength={cartItemsLength}
                    cartCounter={cartCounter}
                  />
                </Link>
              )}
              {/* {console.log(permissions, '===>> userData?.permissions')} */}
              <div className="items-center hidden lg:flex shrink-0 xl:mx-3.5 mx-2.5">
                <div className="relative" ref={profileBtnRef}>
                  <div
                    onClick={() => handleProfileDropwown()}
                    className="cursor-pointer"
                  >
                    <UserIcon className="text-brand-dark text-opacity-40" />
                  </div>
                  {/* {console.log(userData)} */}
                  {profileDropdown && (
                    <ProfileDropdownComp userData={userData} lang={lang} />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* End of auth & lang */}
        </Container>
        {/* End of top part */}

        <div className="hidden navbar lg:block bg-brand-light">
          <Container className="h-20 flex justify-between gap-4 items-center py-2.5">
            {/* <Logo className="!w-0 transition-all duration-200 ease-in-out opacity-0 navbar-logo " /> */}

            {!isAuthorized ? (
              ''
            ) : (
              <>
                {/* End of logo */}
                <div
                  ref={parentRef}
                  className="relative categories-header-button rtl:ml-8 shrink-0 flex flex-1"
                >
                  <button
                    className=" rounded-md focus:outline-none shrink-0 text-15px font-medium text-brand-dark pl-[18px] py-3 flex items-center transition-all hover:border-border-four"
                    onClick={handleCategoryMenu}
                  >
                    <FiMenu className="text-2xl ltr:mr-3 rtl:ml-3" />
                    {/* {t('text-all-categories')} */}
                  </button>
                  {categoryMenu && <CategoryDropdownMenu />}
                  <div>
                    <GlobalSearch />
                    {/* <Search
                  searchId="top-bar-search"
                  className="hidden lg:flex lg:max-w-[650px] 2xl:max-w-[800px]"
                  variant="fill"
                  lang={lang}
                /> */}
                  </div>
                </div>

                <HeaderMenu
                  data={site_header.pagesMenu}
                  className="flex flex-[3] transition-all duration-200 ease-in-out p-0 w-[100vw]"
                  lang={lang}
                  userPermission={userData?.permissions}
                />
              </>
            )}

            {/* End of main menu */}

            {displaySearch && (
              <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full px-4 sticky-search">
                <Search
                  ref={siteSearchRef}
                  className="max-w-[780px] xl:max-w-[830px] 2xl:max-w-[1000px]"
                  lang={lang}
                />
              </div>
            )}
            {/* <div className="flex items-center justify-center w-full h-full px-4 sticky-search">
              <Search
                ref={siteSearchRef}
                className="max-w-[780px] xl:max-w-[830px] 2xl:max-w-[1000px]"
                lang={lang}
              />
            </div> */}
            {/* End of conditional search  */}

            <div className="flex items-center ltr:ml-auto rtl:mr-auto">
              {isScrolled && (
                <div>
                  <NotificationDropdown />
                </div>
              )}
              <div className="flex items-center w-0 py-4 overflow-hidden transition-all duration-200 ease-in-out opacity-0 navbar-right">
                {/* <button
                  type="button"
                  aria-label="Search Toggle"
                  onClick={() => openSearch()}
                  title="Search toggle"
                  className="flex items-center justify-center w-12 h-full transition duration-200 ease-in-out outline-none ltr:mr-6 rtl:ml-6 md:w-14 hover:text-heading focus:outline-none"
                >
                  <SearchIcon className="w-[22px] h-[22px] text-brand-dark text-opacity-40" />
                </button> */}
                {/* <div className="flex items-center justify-center w-full h-full px-4 sticky-search">
                  <Search
                    ref={siteSearchRef}
                    className="max-w-[780px] xl:max-w-[830px] 2xl:max-w-[1000px]"
                    lang={lang}
                  />
                </div> */}
                {/* End of search handler btn */}

                <div className="">
                  <WalletBalance lang={lang} />
                </div>
                <Link
                  href={`/${lang}/wishlist`}
                  className="ltr:mr-7 rtl:ml-7 hidden lg:flex"
                >
                  <WishlistCounter count={wishlistCounter} />
                </Link>
                {permissions[key]?.View && (
                  <Link href={`/${lang}/cart`}>
                    <CartButton
                      className="hidden lg:flex xl:mx-3.5 mx-2.5"
                      lang={lang}
                      cartItemsLength={cartItemsLength}
                      cartCounter={cartCounter}
                    />
                  </Link>
                )}
                {/* <Link href={`/${lang}/cart`} className="ltr:mr-7 rtl:ml-7">
                  <CartButton lang={lang} cartItemsLength={cartItemsLength} />
                </Link> */}

                {/* End of cart btn */}

                <div className="flex items-center shrink-0 ltr:ml-7 rtl:mr-7 relative">
                  <div className="">
                    {/* <div
                      onClick={() => setprofileDropdown(!profileDropdown)}
                      className="cursor-pointer"
                      // ref={profileBtnRef}
                    >
                      <UserIcon className="text-brand-dark text-opacity-40" />
                    </div> */}
                    {/* {profileDropdown && <ProfileDropdownComp lang={lang} />} */}
                  </div>
                  {/* <AuthMenu
                    isAuthorized={isAuthorized}
                    href={`/${lang}${ROUTES.ACCOUNT}`}
                    btnProps={{
                      children: t('text-sign-in'),
                      onClick: handleLogin,
                    }}
                  >
                    {t('text-account')}
                  </AuthMenu> */}
                </div>
                {/* End of auth */}
              </div>
              {/* <Delivery lang={lang} /> */}
              {/* <div className="text-brand-dark">
                <Link href={'/en/careers'} className="ml-3 hover:text-blue-900">
                  Careers
                </Link>
                <Link
                  href={'/en/about-us'}
                  className="ml-3 hover:text-blue-900"
                >
                  About Us
                </Link>
              </div> */}
            </div>
          </Container>
        </div>

        {/* End of menu part */}
      </div>
    </header>
  );
}

export default Header;
