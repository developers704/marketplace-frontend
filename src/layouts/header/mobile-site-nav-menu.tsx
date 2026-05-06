'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, X } from 'lucide-react';
import { useContext } from 'react';
import cn from 'classnames';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import { useTranslation } from 'src/app/i18n/client';
import {
  getSiteNavItems,
  normalizeNavPermissionKey,
  isSiteNavItemActive,
} from '@/layouts/header/site-nav-config';

type Props = {
  lang: string;
  className?: string;
  onClose: () => void;
};

/**
 * Mobile (&lt; lg): RBAC-filtered tabs only — same rules as HeaderMenu + optional admin bypass.
 */
export default function MobileSiteNavMenu({ lang, className, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation(lang, 'menu');
  const { permissions, isAdmin } = useContext(PermissionsContext);
  const { isAuthorized } = useUI();

  const menuItems = getSiteNavItems(lang);

  const filteredMenu = menuItems.filter((item) => {
    if (isAdmin) return true;
    if (item.label === 'Marketplace') return true;
    const permissionKey = normalizeNavPermissionKey(item.label);
    if (!permissions?.hasOwnProperty?.(permissionKey)) return false;
    return permissions[permissionKey]?.View === true;
  });

  const items = filteredMenu;

  const navigateTo = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div
      className={cn(
        'absolute top-full z-[60] mt-2 w-[calc(100vw-2rem)] max-w-[min(100vw-2rem,400px)] overflow-hidden rounded-2xl',
        'border border-[#e8e4dc] bg-[#faf8f6] shadow-[0_28px_80px_-24px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.6)_inset]',
        'animate-[categoryDropdownIn_0.28s_ease-out]',
        'ltr:left-0 rtl:right-0',
        className,
      )}
      role="dialog"
      aria-label="Site navigation"
    >
      {/* Luxury header strip */}
      <div className="relative border-b border-[#e5dfd6] bg-gradient-to-r from-[#2c2419] via-[#3d3429] to-[#2c2419] px-4 py-3.5">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M30 0L60 30 30 60 0 30z%27 fill=%27%23ffffff%27 fill-opacity=%270.03%27/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#d4c4a8]">
              Valliani
            </p>
            <p className="font-serif text-base font-semibold tracking-wide text-[#faf8f6]">
              Navigation
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-[#f5f0e8] transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {!isAuthorized ? (
        <div className="border-t border-[#ebe6df] px-4 py-10 text-center">
          <p className="text-sm leading-relaxed text-[#5c5346]">
            Please sign in to access your authorized sections.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="border-t border-[#ebe6df] px-4 py-10 text-center">
          <p className="text-sm leading-relaxed text-[#5c5346]">
            No navigation items are available for your role. Contact your administrator if you need access.
          </p>
        </div>
      ) : (
        <nav className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-2 py-3">
          <ul className="flex flex-col gap-1 pb-1">
            {items.map((item) => {
              const active = isSiteNavItemActive(item.path, pathname, lang);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200',
                      active
                        ? 'border-[#c9a962]/40 bg-gradient-to-r from-[#fffdf9] to-[#faf6ef] shadow-[inset_3px_0_0_0_#b8860b]'
                        : 'border-transparent bg-transparent hover:border-[#e5dfd6] hover:bg-white/80 active:scale-[0.99]',
                    )}
                  >
                    <span
                      className={cn(
                        'min-w-0 flex-1 font-serif text-[15px] font-semibold leading-snug tracking-wide',
                        active ? 'text-[#1e293b]' : 'text-[#334155] group-hover:text-[#0f172a]',
                      )}
                    >
                      {t(item.label)}
                    </span>
                    <ChevronRight
                      size={18}
                      strokeWidth={2}
                      className={cn(
                        'shrink-0 transition-transform duration-200 group-hover:translate-x-0.5',
                        active ? 'text-[#b8860b]' : 'text-[#94a3b8] group-hover:text-[#64748b]',
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
