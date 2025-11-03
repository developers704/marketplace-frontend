import { FaLinkedinIn } from 'react-icons/fa';
import { FaFacebookF } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';
import { FaYoutube } from 'react-icons/fa';

export const footer = {
  widgets: [
    {
      id: 1,
      widgetTitle: 'widget-title-about',
      lists: [
        {
          id: 1,
          title: 'Team',
          path: '/about-us',
        },
        {
          id: 2,
          title: 'Case Studies',
          path: '/careers',
        },
        {
          id: 3,
          title: 'Publications',
          path: '/store-location',
        },
      ],
    },
    // {
    //   id: 1,
    //   widgetTitle: 'widget-title-about',
    //   lists: [
    //     {
    //       id: 1,
    //       title: 'About Valliani',
    //       path: '/about-us',
    //     },
    //     {
    //       id: 2,
    //       title: 'Careers',
    //       path: '/careers',
    //     },
    //     {
    //       id: 3,
    //       title: 'Store Location',
    //       path: '/store-location',
    //     },
    //     {
    //       id: 4,
    //       title: 'link-contact-us',
    //       path: '/contact-us',
    //     },
    //   ],
    // },
    // {
    //   id: 2,
    //   widgetTitle: 'Customer Service',
    //   lists: [
    //     {
    //       id: 1,
    //       title: 'Track Your Order',
    //       path: '/privacy',
    //     },
    //     {
    //       id: 2,
    //       title: 'FAQs',
    //       path: '/terms',
    //     },
    //     {
    //       id: 3,
    //       title: 'Policy',
    //       path: '/privacy',
    //     },
    //     {
    //       id: 4,
    //       title: 'Feedback',
    //       path: '/',
    //     },
    //   ],
    // },
    // {
    //   id: 3,
    //   widgetTitle: 'widget-title-community',
    //   lists: [
    //     {
    //       id: 1,
    //       title: 'link-announcements',
    //       path: '/',
    //     },
    //     {
    //       id: 2,
    //       title: 'link-answer-center',
    //       path: '/',
    //     },
    //     {
    //       id: 3,
    //       title: 'link-discussion-boards',
    //       path: '/',
    //     },
    //     {
    //       id: 4,
    //       title: 'link-giving-works',
    //       path: '/',
    //     },
    //   ],
    // },
  ],
  // payment: [
  //   {
  //     id: 1,
  //     path: '/',
  //     image: '/assets/images/payment/mastercard.svg',
  //     name: 'payment-master-card',
  //     width: 34,
  //     height: 20,
  //   },
  //   {
  //     id: 2,
  //     path: '/',
  //     image: '/assets/images/payment/visa.svg',
  //     name: 'payment-visa',
  //     width: 50,
  //     height: 20,
  //   },
  //   {
  //     id: 3,
  //     path: '/',
  //     image: '/assets/images/payment/paypal.svg',
  //     name: 'payment-paypal',
  //     width: 76,
  //     height: 20,
  //   },
  //   {
  //     id: 4,
  //     path: '/',
  //     image: '/assets/images/payment/jcb.svg',
  //     name: 'payment-jcb',
  //     width: 26,
  //     height: 20,
  //   },
  //   {
  //     id: 5,
  //     path: '/',
  //     image: '/assets/images/payment/skrill.svg',
  //     name: 'payment-skrill',
  //     width: 39,
  //     height: 20,
  //   },
  // ],
  social: [
    {
      id: 1,
      path: 'https://www.facebook.com/redqinc/',
      image: '/assets/images/social/facebook.svg',
      name: 'facebook',
      width: 20,
      height: 20,
      icon: <FaLinkedinIn />,
    },
    {
      id: 2,
      path: 'https://twitter.com/redqinc',
      image: '/assets/images/social/twitter.svg',
      name: 'twitter',
      width: 20,
      height: 20,
      icon: <FaFacebookF />,
    },
    {
      id: 3,
      path: 'https://www.instagram.com/redqinc/',
      image: '/assets/images/social/instagram.svg',
      name: 'instagram',
      width: 20,
      height: 20,
      icon: <FaInstagram />,
    },
    {
      id: 4,
      path: 'https://www.youtube.com/channel/UCjld1tyVHRNy_pe3ROLiLhw',
      image: '/assets/images/social/youtube.svg',
      name: 'youtube',
      width: 20,
      height: 20,
      icon: <FaYoutube />,
    },
  ],
};
