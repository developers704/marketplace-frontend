import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';

export interface V2Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  isNotShowed?: boolean;
}

export interface V2SubCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  parentCategory: string | { _id: string; name: string };
}

export interface V2SubSubCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  parentSubCategory: string | { _id: string; name: string };
}

export interface V2CategoryWithSubcategories extends V2Category {
  subcategories: Array<V2SubCategory & { subSubcategories?: V2SubSubCategory[] }>;
}

// Fetch all categories
export async function fetchV2Categories(): Promise<V2Category[]> {
  const { data } = await http.get<{ success: boolean; data: V2Category[] }>('/api/v2/categories');
  return data?.data || [];
}

export const useV2CategoriesQuery = () => {
  return useQuery<V2Category[], Error>({
    queryKey: ['v2-categories'],
    queryFn: fetchV2Categories,
  });
};

// Fetch subcategories by category ID
export async function fetchV2SubcategoriesByCategory(categoryId: string): Promise<V2SubCategory[]> {
  const { data } = await http.get<{ success: boolean; data: V2SubCategory[] }>(
    `/api/v2/categories/${categoryId}/subcategories`
  );
  return data?.data || [];
}

export const useV2SubcategoriesByCategoryQuery = (categoryId?: string | null) => {
  return useQuery<V2SubCategory[], Error>({
    queryKey: ['v2-subcategories', categoryId],
    queryFn: () => fetchV2SubcategoriesByCategory(String(categoryId)),
    enabled: !!categoryId,
  });
};

// Fetch sub-subcategories by subcategory ID
export async function fetchV2SubSubcategoriesBySubCategory(subCategoryId: string): Promise<V2SubSubCategory[]> {
  const { data } = await http.get<{ success: boolean; data: V2SubSubCategory[] }>(
    `/api/v2/subcategories/${subCategoryId}/subsubcategories`
  );
  return data?.data || [];
}

export const useV2SubSubcategoriesBySubCategoryQuery = (subCategoryId?: string | null) => {
  return useQuery<V2SubSubCategory[], Error>({
    queryKey: ['v2-subsubcategories', subCategoryId],
    queryFn: () => fetchV2SubSubcategoriesBySubCategory(String(subCategoryId)),
    enabled: !!subCategoryId,
  });
};

// Fetch categories with nested subcategories
export async function fetchV2CategoriesWithSubcategories(): Promise<V2CategoryWithSubcategories[]> {
  const { data } = await http.get<{ success: boolean; data: V2CategoryWithSubcategories[] }>(
    '/api/v2/categories/with-subcategories'
  );
  return data?.data || [];
}

export const useV2CategoriesWithSubcategoriesQuery = () => {
  return useQuery<V2CategoryWithSubcategories[], Error>({
    queryKey: ['v2-categories-with-subcategories'],
    queryFn: fetchV2CategoriesWithSubcategories,
  });
};

