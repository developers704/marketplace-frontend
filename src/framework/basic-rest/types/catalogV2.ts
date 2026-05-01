type SkuAttributes = {
  descriptionname?: string;
  style?: string;
  gender?: string;
  centerstone?: string;
};
export type VendorSkuLite = {
  _id: string;
  sku: string;
  price: number;
  currency?: string;
  images?: string[];
  gallery?: string[];
  metalColor?: string;
  metalType?: string;
  size?: string;
  totalQuantity?: number;
  attributes?: SkuAttributes;
  tagPrice?: number
};

type CategoryInfo = string | { _id: string; name: string; image?: string; description?: string };

export type VendorProductListItem = {
  _id: string;
  vendorModel: string;
  /** Alternate key from some API responses */
  vendorModelKey?: string;
  title: string;
  brand?: string;
  category?: CategoryInfo;
  subcategory?: CategoryInfo;
  subsubcategory?: CategoryInfo;
  description?: string;
  skuCount?: number;
  totalInventory?: number;
  minPrice?: number;
  maxPrice?: number;
  defaultSku?: VendorSkuLite | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VendorProductDetail = {
  product: VendorProductListItem & { skuCount: number; totalInventory: number };
  defaultSku: VendorSkuLite | null;
  skus: VendorSkuLite[];
  availableColors: string[];
  availableSizes: string[];
  availableMetalTypes: string[];
  optionMatrix: Record<string, Record<string, string[]>>;
};

export type VendorProductsListResponse = {
  success: boolean;
  message?: string;
  data: VendorProductListItem[];
  filters?: {
    brands: string[];
    metalColors: string[];
    metalTypes: string[];
    sizes: string[];
    stoneTypes: string[];
    centerClarities: string[];
    availableAttributes: Array<{ _id: string; values: string[] }>;
    priceRange: { min: number; max: number };
  };
  paginatorInfo?: {
    page: number | null;
    limit: number;
    total: number | null;
    totalPages: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean | null;
    nextPage: number | null;
    prevPage: number | null;
    nextCursor?: string | null; // Cursor for cursor-based pagination
  };
};

export type SkuInventoryRow = {
  _id: string;
  skuId: string;
  warehouse?: { _id: string; name: string } | string;
  city?: { _id: string; name: string } | string;
  quantity: number;
};

export type SkuDetailResponse = {
  success: boolean;
  message?: string;
  data: {
    sku: any;
    inventories: SkuInventoryRow[];
    totalQuantity: number;
  };
};


