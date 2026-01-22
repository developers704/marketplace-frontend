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
  metalColor?: string;
  metalType?: string;
  size?: string;
  totalQuantity?: number;
  attributes?: SkuAttributes;
};

export type VendorProductListItem = {
  _id: string;
  vendorModel: string;
  title: string;
  brand?: string;
  category?: string;
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


