'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import {
  useV2CategoriesQuery,
  useV2SubcategoriesByCategoryQuery,
} from '@/framework/basic-rest/catalogV2/get-categories';
import type { V2Category, V2SubCategory } from '@/framework/basic-rest/catalogV2/get-categories';
import { getImageUrl } from '@/lib/utils';
import cn from 'classnames';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
const PLACEHOLDER =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

interface CategoryDropdownMenuProps {
  className?: string;
  lang?: string;
}

export default function CategoryDropdownMenu({
  className,
  lang = 'en',
}: CategoryDropdownMenuProps) {
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [clickedCategoryId, setClickedCategoryId] = useState<string | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useV2CategoriesQuery();

  // Use hovered on desktop, clicked on touch/mobile, fallback to first category
  const currentCategoryId = hoveredCategoryId ?? clickedCategoryId ?? categories[0]?._id ?? null;

  const { data: subcategories = [], isLoading: subcategoriesLoading } =
    useV2SubcategoriesByCategoryQuery(currentCategoryId);

  const selectedCategory = useMemo(
    () => categories?.find((c) => c?._id === currentCategoryId) ?? null,
    [categories, currentCategoryId]
  );

  const marketplacePath = `/${lang}/marketplace`;
  const categoryLink = (category: V2Category) => `${marketplacePath}?category=${category?._id}`;
  const subcategoryLink = (sub: V2SubCategory) =>
    `${marketplacePath}?view=products&category=${currentCategoryId}&subcategory=${sub?._id}`;

  const handleCategoryClick = (categoryId: string) => {
    setClickedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div
      className={cn(
        'absolute top-full z-50 mt-0 max-h-[82vh] min-h-[280px] rounded-b-2xl border border-t-0 border-[#e0e0e0] bg-white',
        'inset-x-4 w-[calc(100%-2rem)] sm:inset-x-6 sm:w-[calc(100%-3rem)]',
        'md:left-0 md:right-0 md:mx-auto md:w-[95vw] md:max-w-5xl',
        'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.03)]',
        'animate-[categoryDropdownIn_0.28s_ease-out]',
        className
      )}
    >
      <div className="flex min-h-[280px] flex-col md:flex-row md:max-h-[92vh]">
        {/* Left: Categories */}
        <div className="flex min-h-0 w-full flex-shrink-0 flex-col border-b border-[#e8e8e8] bg-[#f8f8f8] p-4 md:w-[340px] md:min-h-0 md:overflow-y-auto md:border-b-0 md:border-r">
          <p className="mb-3 shrink-0 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">
            Categories
          </p>
          {categoriesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-white/60" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2 pb-2 pr-1 md:pb-4 md:pr-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredCategoryId(category?._id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    onClick={() => handleCategoryClick(category?._id)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-left transition-all duration-300 ease-out',
                      currentCategoryId === category?._id
                        ? 'border-[#d4d4d4] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                        : 'border-transparent bg-white/50 hover:border-[#e5e5e5] hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-1 min-w-0 text-[15px] font-semibold transition-colors duration-200',
                        currentCategoryId === category?._id
                          ? 'text-[#1a1a1a]'
                          : 'text-gray-700 group-hover:text-[#1a1a1a]'
                      )}
                    >
                      {category.name}
                    </span>
                    <ChevronRight
                      size={16}
                      className={cn(
                        'flex-shrink-0 transition-all duration-200',
                        currentCategoryId === category?._id
                          ? 'text-[#1a1a1a]'
                          : 'text-gray-400 opacity-70 group-hover:opacity-100'
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right: Subcategories */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">
            {selectedCategory ? selectedCategory?.name : 'Subcategories'}
          </p>
          {subcategoriesLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-gray-200/70" />
                  <div className="mt-3 h-3 w-4/5 rounded bg-gray-200/70" />
                </div>
              ))}
            </div>
          ) : subcategories?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {subcategories?.map((sub) => (
                <Link
                  key={sub._id}
                  href={subcategoryLink(sub)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl bg-[#f5f5f5] transition-all duration-300 ease-out',
                    'hover:bg-white hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)]'
                  )}
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <Image
                      src={getImageUrl(
                        BASE_API,
                        `/uploads/images/${sub?.image || 'category-placeholder.png'}`
                      )}
                      alt={sub?.name ?? ''}
                      fill
                      sizes="(max-width: 640px) 50vw, 22vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      placeholder="blur"
                      blurDataURL={PLACEHOLDER}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-3">
                    <span className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#1a1a1a]">
                      {sub?.name ?? '—'}
                    </span>
                    {sub?.productCount !== undefined && (
                      <p className="mt-1 text-xs text-gray-500">{sub?.productCount || "-"} products</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500">No subcategories in this category</p>
              <Link
                href={selectedCategory ? categoryLink(selectedCategory) : marketplacePath}
                className="mt-4 text-sm font-semibold text-[#1a1a1a] underline underline-offset-2 transition-opacity hover:opacity-80"
              >
                View marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
