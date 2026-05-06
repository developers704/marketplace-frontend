/** Shared marketplace header / mobile drawer navigation — keep in sync with RBAC permission keys. */

export type SiteNavItem = {
  id: number;
  /** Path may be relative to site root; use getSiteNavItems(lang) for resolved paths. */
  path: string;
  label: string;
};

export function getSiteNavItems(lang: string): SiteNavItem[] {
  return [
    { id: 1, path: `/${lang}/`, label: 'Home' },
    { id: 2, path: '/valliani-university', label: 'Valliani University' },
    { id: 3, path: `/${lang}/marketplace`, label: 'Inventory' },
    { id: 4, path: `/${lang}/marketing`, label: 'Marketing' },
    { id: 5, path: `/${lang}/supplies`, label: 'Supplies' },
    { id: 11, path: `/${lang}/marketplace/store-inventory`, label: 'My inventory' },
    { id: 6, path: `/${lang}/tool-findings`, label: 'Tool Finding' },
    { id: 8, path: `/${lang}/GWP`, label: 'GWP' },
    { id: 9, path: `/${lang}/special-order`, label: 'Special Order' },
    { id: 12, path: `/${lang}/special-order/sheets`, label: 'Report' },
  ];
}

export function normalizeNavPermissionKey(label: string): string {
  const mapping: Record<string, string> = {
    Inventory: 'Inventory Order',
  };
  return mapping[label] || label.trim().replace(/\s*\/\s*/g, '-');
}

export function isSiteNavItemActive(
  itemPath: string,
  pathname: string | null,
  lang: string,
): boolean {
  if (!pathname) return false;
  const specialOrderPath = `/${lang}/special-order`;
  const sheetsMenuPath = `/${lang}/special-order/sheets`;

  if (itemPath === sheetsMenuPath) {
    return pathname === sheetsMenuPath || pathname.startsWith(`${sheetsMenuPath}/`);
  }
  if (itemPath === specialOrderPath) {
    if (pathname === specialOrderPath) return true;
    return (
      pathname.startsWith(`${specialOrderPath}/`) &&
      !pathname.startsWith(sheetsMenuPath)
    );
  }
  return pathname === itemPath;
}
