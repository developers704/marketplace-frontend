import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { fallbackLng, languages } from './app/i18n/settings';

acceptLanguage.languages(languages);

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
};

const cookieName = 'i18next';

export function middleware(req) {
  if (
    req.nextUrl.pathname.indexOf('icon') > -1 ||
    req.nextUrl.pathname.indexOf('chrome') > -1
  )
    return NextResponse.next();
  
  // Early auth guard to prevent flashing protected pages before redirect
  const { pathname } = req.nextUrl;
  const isAuthenticated = req.cookies.has('auth_token');
  const authLoginPath = `/en/signin`;
  const isNextAsset = pathname.startsWith('/_next');
  const isApi = pathname.startsWith('/api');
  const isAsset = pathname.startsWith('/assets') || pathname.startsWith('/favicon.ico') || pathname.startsWith('/sw.js');
  const isAuthPage = pathname.startsWith('/en/signin') || pathname.startsWith('/en/signup') || pathname.startsWith('/en/forgot-password');

  if (!isAuthenticated && !isAuthPage && !isNextAsset && !isApi && !isAsset) {
    const url = new URL(authLoginPath, req.url);
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }
  let lang;
  if (req.cookies.has(cookieName))
    lang = acceptLanguage.get(req.cookies.get(cookieName).value);
  if (!lang) lang = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lang) lang = fallbackLng;

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${lang}${req.nextUrl.pathname}`, req.url),
    );
  }

  // If authenticated but on the login page, redirect to language home
  if (isAuthenticated && pathname === '/en/signin') {
    return NextResponse.redirect(new URL(`/${lang}`, req.url));
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'));
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`),
    );
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next();
}
