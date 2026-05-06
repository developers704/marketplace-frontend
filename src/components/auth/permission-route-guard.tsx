'use client';

/**
 * If the user loses View access to the current route (e.g. admin revoked role),
 * redirect to home after permissions refresh / socket update.
 */
import { useContext, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';

function routeNeedsPermission(
  pathname: string,
  lang: string,
): { module: string; action: 'View' } | null {
  const prefix = `/${lang}`;
  const rest =
    pathname.startsWith(prefix) ? pathname.slice(prefix.length) || '/' : pathname;

  if (rest === '/' || rest === '') return { module: 'Home', action: 'View' };

  if (rest.startsWith('/signin') || rest.startsWith('/signup')) return null;

  if (rest.startsWith('/valliani-university'))
    return { module: 'Valliani University', action: 'View' };
  if (rest.startsWith('/marketplace'))
    return { module: 'Inventory Order', action: 'View' };
  if (rest.startsWith('/marketing')) return { module: 'Marketing', action: 'View' };
  if (rest.startsWith('/supplies')) return { module: 'Supplies', action: 'View' };
  if (rest.includes('/store-inventory'))
    return { module: 'My inventory', action: 'View' };
  if (rest.startsWith('/tool-findings'))
    return { module: 'Tool Finding', action: 'View' };
  if (rest.startsWith('/GWP')) return { module: 'GWP', action: 'View' };
  if (rest.startsWith('/special-order/sheets'))
    return { module: 'Report', action: 'View' };
  if (rest.startsWith('/special-order'))
    return { module: 'Special Order', action: 'View' };

  return null;
}

export default function PermissionRouteGuard({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthorized } = useUI();
  const ctx = useContext(PermissionsContext);
  const loadingPermissions = ctx?.loadingPermissions ?? false;
  const hasPermission = ctx?.hasPermission;
  const isAdmin = ctx?.isAdmin ?? false;

  useEffect(() => {
    if (!isAuthorized || loadingPermissions || isAdmin) return;
    const need = routeNeedsPermission(pathname || '', lang);
    if (!need || !hasPermission) return;
    if (!hasPermission(need.module, need.action)) {
      router.replace(`/${lang}/`);
    }
  }, [
    pathname,
    lang,
    isAuthorized,
    loadingPermissions,
    isAdmin,
    hasPermission,
    router,
  ]);

  return null;
}
