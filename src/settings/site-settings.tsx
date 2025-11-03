import { ILFlag } from '@components/icons/language/ILFlag';
import { SAFlag } from '@components/icons/language/SAFlag';
import { CNFlag } from '@components/icons/language/CNFlag';
import { USFlag } from '@components/icons/language/USFlag';
import { DEFlag } from '@components/icons/language/DEFlag';
import { ESFlag } from '@components/icons/language/ESFlag';
import siteLogo from 'public/assets/images/newLogoFull.png';

export const siteSettings = {
  name: '2pl',
  description: 'Fine Jewelry & Diamonds.',
  author: {
    name: 'REDQ',
    websiteUrl: 'https://redq.io',
    address: '',
  },
  logo: {
    url: siteLogo,
    alt: '2pl',
    href: '/en',
    // width: 60,
    // height: 50,
    width: 500,
    height: 50,
  },
  defaultLanguage: 'en',
  currencyCode: 'USD',
  site_header: {
    menu: [
      {
        id: 1,
        path: '/',
        label: 'Diamond',
        // subMenu: [
        //   {
        //     id: 1,
        //     path: '/',
        //     label: 'menu-elegant',
        //   },
        //   {
        //     id: 2,
        //     path: '/classic',
        //     label: 'menu-classic',
        //   },
        //   {
        //     id: 3,
        //     path: '/vintage',
        //     label: 'menu-vintage',
        //   },
        //   {
        //     id: 4,
        //     path: '/standard',
        //     label: 'menu-standard',
        //   },
        //   {
        //     id: 5,
        //     path: '/minimal',
        //     label: 'menu-minimal',
        //   },
        //   {
        //     id: 6,
        //     path: '/trendy',
        //     label: 'menu-trendy',
        //   },
        //   {
        //     id: 7,
        //     path: '/modern',
        //     label: 'menu-modern',
        //   },
        //   {
        //     id: 8,
        //     path: '/refined',
        //     label: 'menu-refined',
        //   },
        //   {
        //     id: 9,
        //     path: '/antique',
        //     label: 'menu-antique',
        //   },
        //   {
        //     id: 10,
        //     path: '/ancient',
        //     label: 'menu-ancient',
        //   },
        // ],
      },
      {
        id: 2,
        path: '/search',
        label: 'Birth Stone',
        // subMenu: [
        //   {
        //     id: 1,
        //     path: '/search',
        //     label: 'menu-fresh-vegetables',
        //   },
        //   {
        //     id: 2,
        //     path: '/search',
        //     label: 'menu-diet-nutrition',
        //   },
        //   {
        //     id: 3,
        //     path: '/search',
        //     label: 'menu-healthy-foods',
        //   },
        //   {
        //     id: 4,
        //     path: '/search',
        //     label: 'menu-grocery-items',
        //   },
        //   {
        //     id: 5,
        //     path: '/search',
        //     label: 'menu-beaf-steak',
        //   },
        // ],
      },
      {
        id: 3,
        path: '/search',
        label: 'Gold',
        // subMenu: [
        //   {
        //     id: 1,
        //     path: '/search',
        //     label: 'menu-vegetarian',
        //   },
        //   {
        //     id: 2,
        //     path: '/search',
        //     label: 'menu-kakogenic',
        //   },
        //   {
        //     id: 3,
        //     path: '/search',
        //     label: 'menu-mediterranean',
        //   },
        //   {
        //     id: 4,
        //     path: '/search',
        //     label: 'menu-organic',
        //   },
        // ],
      },
      {
        id: 4,
        path: '/search/',
        label: 'Silver',
      },
      {
        id: 5,
        path: '/shops/',
        label: 'Tungsten',
      },
      {
        id: 6,
        path: '/',
        label: 'Watch',
        // subMenu: [
        //   {
        //     id: 1,
        //     path: '/',
        //     label: 'menu-users',
        //     subMenu: [
        //       {
        //         id: 1,
        //         path: '/my-account/account-settings',
        //         label: 'menu-my-account',
        //       },
        //       {
        //         id: 2,
        //         path: '/signin',
        //         label: 'menu-sign-in',
        //       },
        //       {
        //         id: 3,
        //         path: '/signup',
        //         label: 'menu-sign-up',
        //       },
        //     ],
        //   },
        //   {
        //     id: 2,
        //     path: '/faq',
        //     label: 'menu-faq',
        //   },
        //   {
        //     id: 3,
        //     path: '/about-us',
        //     label: 'menu-about-us',
        //   },
        //   {
        //     id: 4,
        //     path: '/privacy',
        //     label: 'menu-privacy-policy',
        //   },
        //   {
        //     id: 5,
        //     path: '/terms',
        //     label: 'menu-terms-condition',
        //   },
        //   {
        //     id: 6,
        //     path: '/contact-us',
        //     label: 'menu-contact-us',
        //   },
        //   {
        //     id: 7,
        //     path: '/checkout',
        //     label: 'menu-checkout',
        //   },
        //   {
        //     id: 8,
        //     path: '/404',
        //     label: 'menu-404',
        //   },
        // ],
      },
    ],
    languageMenu: [
      {
        id: 'ar',
        name: 'عربى - AR',
        value: 'ar',
        icon: <SAFlag />,
      },
      {
        id: 'zh',
        name: '中国人 - ZH',
        value: 'zh',
        icon: <CNFlag />,
      },
      {
        id: 'en',
        name: 'English - EN',
        value: 'en',
        icon: <USFlag />,
      },
      {
        id: 'de',
        name: 'Deutsch - DE',
        value: 'de',
        icon: <DEFlag />,
      },
      {
        id: 'he',
        name: 'rעברית - HE',
        value: 'he',
        icon: <ILFlag />,
      },
      {
        id: 'es',
        name: 'Español - ES',
        value: 'es',
        icon: <ESFlag />,
      },
    ],
    pagesMenu: [
      {
        id: 1,
        path: '/',
        label: 'Home',
      },
      {
        id: 2,
        path: '/valliani-university',
        label: 'Valliani University',
      },
      {
        id: 3,
        path: '/inventory-orders',
        label: 'Inventory Order',
      },
      {
        id: 4,
        path: '/marketing',
        label: 'Marketing',
      },
      {
        id: 5,
        path: '/supplies',
        label: 'Supplies',
      },
      {
        id: 6,
        path: '/tool-findings',
        label: 'Tool Finding',
      },
      {
        id: 7,
        path: '/packaging',
        label: 'Packaging / GWS',
      },
    ],
  },
};
