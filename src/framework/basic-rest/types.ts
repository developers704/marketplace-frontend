import { QueryKey } from '@tanstack/react-query';

export type CollectionsQueryOptionsType = {
  text?: string;
  collection?: string;
  status?: string;
  limit?: number;
};

export type CategoriesQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};
export type ProductsQueryOptionsType = {
  type: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};
export type QueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
export type Attachment = {
  id: string | number;
  thumbnail: string;
  original: string;
};
export type Category = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  children?: [Category];
  products?: Product[];
  productCount?: number;
  [key: string]: unknown;
};
export type Collection = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};
export type Brand = {
  id: number | string;
  name: string;
  slug: string;
  image?: Attachment;
  [key: string]: unknown;
};
export type Dietary = {
  id: number | string;
  name: string;
  slug: string;
  [key: string]: unknown;
};
export type Tag = {
  id: string | number;
  name: string;
  slug: string;
};
export type Price = {
  amount: number;
  currency: string;
};

export type Product = {
  id: number | string;
  name: string;
  slug: string;
  price: Price; // Ensure price is of type Price
  quantity: number;
  sold: number;
  unit: string;
  sale_price?: Price; // sale_price can be an object of type Price
  min_price?: number; // Can remain a number if it’s just a price
  max_price?: number; // Can remain a number if it’s just a price
  image: string | Attachment; // Assuming Attachment is defined elsewhere
  sku?: string;
  gallery?: Attachment[]; // Array of attachments for gallery images
  category?:
    | Category
    | {
        // Category can be a specific type or a general object
        _id: string;
        name: string;
        description: string;
        image: string;
        productCount: number;
      };
  tag?: Tag[]; // Assuming Tag is defined elsewhere
  meta?: any[]; // Keep as any[] if metadata is unpredictable
  brand?: string | Brand; // Can remain a string or Brand object
  description?: string;
  variations?: Record<string, unknown>; // Better to specify as Record for clarity
  lifecycleStage?: string; // Should remain string
  isBestSeller?: boolean; // Remains boolean
  dealOfTheDayDiscountedPrice?: number | null; // For discounts, can be number or null
  discountedPrice?: Price | null;
  originalPrice?: Price | null; 
  vatAmount?: number; // Remains number for VAT
  outOfStock?: boolean; // For availability status
  createdAt?: string; // Timestamp
  updatedAt?: string; // Timestamp
  subcategory?: {
    // Subcategory structure
    _id: string;
    name: string;
    description: string;
    image: string;
    productCount: number;
  };
  variants?: object[]; // Can be more specific if possible
  __v?: number; // Version key
  _id?: string; // API-specific identifier
  [key: string]: unknown; // Allows additional properties
};

export type OrderItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
};
export type Order = {
  id: string | number;
  name: string;
  slug: string;
  products: OrderItem[];
  total: number;
  tracking_number: string;
  customer: {
    id: number;
    email: string;
  };
  shipping_fee: number;
  payment_gateway: string;
};

export type ShopsQueryOptionsType = {
  text?: string;
  shop?: Shop;
  status?: string;
  limit?: number;
};

export type Shop = {
  id: string | number;
  owner_id: string | number;
  owner_name: string;
  address: string;
  phone: string;
  website: string;
  ratings: string;
  name: string;
  slug: string;
  description: string;
  cover_image: Attachment;
  logo: Attachment;
  socialShare: any;
  created_at: string;
  updated_at: string;
};
