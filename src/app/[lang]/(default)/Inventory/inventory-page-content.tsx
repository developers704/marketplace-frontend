'use client';
import ProductListCard from '@/components/cards/product-list-card';

interface Variant {
  _id: string;
  variantName: {
    _id: string;
    name: string;
    parentVariant?: {
      _id: string;
      name: string;
    };
  };
  value: string;
}

interface Price {
  amount: number;
  salePrice?: number;
}

interface Category {
  _id: string;
  name: string;
  [key: string]: any;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  image: string;
  gallery: string[];
  prices: Price[];
  variants: Variant[];
  category: Category;
  subcategory: Category;
}

interface InventoryItem {
  _id: string;
  product: Product;
  quantity: number;
  stockAlertThreshold: number;
  barcode: string;
  warehouse: any[];
}
import DebounceSearch from '@/components/common/debounceSearch';
import Accordion from '@/components/ui/accordion';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { ProductListSkeleton } from '@/components/ui/skeletons';
import { fetchProductsVariants } from '@/framework/basic-rest/filtration/useFiltration';
import { useInventories, isLowStock, getWarehouseDisplayName } from '@/framework/basic-rest/inventory/use-inventories';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import { useWarehousesQuery } from '@/framework/basic-rest/warehouse/get-all-warehouses';
import PreventScreenCapture from '@/utils/PreventScreenShots';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
// import { XCircle } from "lucide-react";

const ItemListPageContent = ({ lang }: { lang: string }) => {
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [updateList, setUpdateList] = useState<boolean>(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [groupedVariantsArray, setGroupedVariantsArray] = useState<[string, string[]][]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('main-warehouse');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(20);
  // const [productsFilter, setProductsFilter] = useState<any>([]);

  const params = useParams();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  // const subCateId = queryId?.split(',')[1] || '';
  // const parentCateId = queryId?.split(',')[0];
  const { itemlist: categoryId, category } = params;
  const PageTitle = decodeURIComponent(`${category}`);

  // Fetch warehouses
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehousesQuery();
  
  // Fetch all inventories
  const { data: inventories, isLoading } = useInventories();

  // Filter and sort inventories based on warehouse filter
  const filteredInventories = React.useMemo(() => {
    if (!inventories) return [];
    
    let filtered = [...inventories];

    // Apply warehouse filter
    if (selectedWarehouseId) {
      filtered = filtered.filter(inv => 
        inv.warehouse?.some(w => w._id === selectedWarehouseId)
      );
    } else {
      switch (warehouseFilter) {
        case 'main-warehouse':
          filtered = filtered.filter(inv => 
            inv.warehouse?.some(w => w.isMain)
          );
          break;
        case 'out-to-store':
          filtered = filtered.filter(inv => 
            inv.warehouse?.some(w => !w.isMain)
          );
          break;
        // 'warehouse-plus-store' shows all
      }
    }

    // Sort by low stock first
    filtered.sort((a, b) => {
      const aIsLow = isLowStock(a);
      const bIsLow = isLowStock(b);
      if (aIsLow && !bIsLow) return -1;
      if (!aIsLow && bIsLow) return 1;
      return 0;
    });

    return filtered;
  }, [inventories, selectedWarehouseId, warehouseFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [warehouseFilter, selectedWarehouseId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay

    return () => clearTimeout(handler); // Cleanup function
  }, [searchQuery]);

  const filterByPriceAndOffers = (products: any, selectedFilters: any) => {
    return products?.filter((product: any) => {
      const isOfferApplied = selectedFilters?.Offers?.includes('Discounted');

      const isOnSale =
        isOfferApplied &&
        product?.prices?.some((price: any) => price?.salePrice > 0);

      let isPriceMatched = true;
      let min = Infinity;
      let max = 0;
      if (selectedFilters?.Price?.length > 0) {
        // Price: (2) ['$5000 - $10000', '$10000 - $15000']
        selectedFilters.Price.forEach((priceFilter: string) => {
          const priceRange = priceFilter.replace(/[$ ]/g, '').split('-');
          const minPrice = parseInt(priceRange[0], 10);
          const maxPrice = parseInt(priceRange[1], 10);

          min = Math.min(min, minPrice); // Find lowest min
          max = Math.max(max, maxPrice); // Find highest max
        });
        isPriceMatched = product?.prices?.some(
          (price: any) => price?.amount >= min && price?.amount <= max,
        );
      }

      // ✅ Apply conditions based on whether "Discounted" is selected
      if (isOfferApplied) {
        return isOnSale && isPriceMatched;
      }
      return isPriceMatched;
    });
  };

  const filterProductsByFilters = (
    inventories: InventoryItem[],
    selectedFilters: Record<string, string[]>
  ) => {
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
      return inventories;
    }

    return inventories.filter(inventory => {
      const product = inventory.product;
      if (!product) return false;
      // Offers filter: if Discounted selected, product must have a salePrice > 0
      if (selectedFilters.Offers?.includes('Discounted')) {
        const hasOnSale = product.prices?.some((p: Price) => (p.salePrice ?? 0) > 0);
        if (!hasOnSale) return false;
      }

      // Price filter
      if (selectedFilters.Price?.length) {
        const hasMatchingPrice = product.prices?.some(price => {
          const amount = price.amount;
          return selectedFilters.Price.some(priceRange => {
            const [min, max] = priceRange
              .replace(/[$,]/g, '')
              .split('-')
              .map(n => parseInt(n.trim()));
            return amount >= min && amount <= max;
          });
        });
        if (!hasMatchingPrice) return false;
      }

      // Variant filters
      const variantFilters = Object.entries(selectedFilters)
        .filter(([filterType]) => filterType !== 'Price' && filterType !== 'Offers');
      
      if (variantFilters.length === 0) return true;

      return variantFilters.every(([filterType, values]) => {
        if (!Array.isArray(values)) return false;
        return product.variants?.some(variant => 
          variant?.variantName?.name === filterType &&
          values.includes(variant?.value)
        );
      });
    });
  };

  // Apply selected filters locally (no new API call) and then apply search on top
  const filteredBySelectedFilters = React.useMemo(() => {
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) return filteredInventories;
    // inventories from hook may not match our strict InventoryItem type, cast to any to avoid TS mismatch
    return filterProductsByFilters(filteredInventories as any, selectedFilters);
  }, [filteredInventories, selectedFilters]);

  const searchFilteredInventories = React.useMemo(() => {
    const base = filteredBySelectedFilters || [];
    if (!debouncedQuery) return base;

    const q = debouncedQuery.toLowerCase();
    return base.filter((inventory) => {
      const invAny: any = inventory;
      const name = String(invAny.product?.name || invAny.productInfo?.name || '').toLowerCase();
      const sku = String(invAny.product?.sku || invAny.productInfo?.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [filteredBySelectedFilters, debouncedQuery]);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const response = await fetch('https://backend.vallianimarketplace.com/api/variants/product-variants');
        if (!response.ok) throw new Error('Failed to fetch variants');
        const data = await response.json();
        setVariants(data);
        
        // Group variants using the fetched data
        const grouped = groupVariants(data);
        setGroupedVariantsArray(Object.entries(grouped));
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    };

    fetchVariants();
  }, []);

  if (isLoading) return <ProductListSkeleton />;

  // console.log(selectedFilters, '===>>> selectedFilters');
  // console.log(groupedVariantsArray, '===>>> groupedVariantsArray');

  return (
    <Container>
      <section className="my-10">
        {/* Breadcrupms */}
        <Breadcrumb lang={lang} />
        <div id="top" className="flex items-center justify-between mb-5">
          <div className="leftSide">
            <h1 className="md:text-[40px] text-[20px] font-bold capitalize">
              {'Inventory'}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4 flex-wrap gap-2">
            {/* Warehouse Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="warehouseFilter" className="text-sm font-medium whitespace-nowrap">
                
              </label>
              <select
                id="warehouseFilter"
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setSelectedWarehouseId(''); // Clear specific warehouse when filter changes
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="main-warehouse">Available</option>
                <option value="out-to-store">Out to Store</option>
                <option value="warehouse-plus-store">All</option>
              </select>
            </div>

            {/* Store/Warehouse Dropdown */}
            {/* <div className="flex items-center gap-2">
              <label htmlFor="warehouseSelect" className="text-sm font-medium whitespace-nowrap">
                Store:
              </label>
              <select
                id="warehouseSelect"
                value={selectedWarehouseId}
                onChange={(e) => {
                  setSelectedWarehouseId(e.target.value);
                  if (e.target.value) {
                    setWarehouseFilter(''); // Clear filter when specific warehouse selected
                  } else {
                    setWarehouseFilter('main-warehouse'); // Reset to default when "All Stores" selected
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="">All Stores</option>
                {warehouses?.map((warehouse: any) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} {warehouse.isMain ? '(Main)' : ''}
                  </option>
                ))}
              </select>
            </div> */}
            

            {/* Clear Filter Button */}
            {/* {(warehouseFilter !== 'main-warehouse' || selectedWarehouseId) && (
              <button
                onClick={() => {
                  setWarehouseFilter('main-warehouse');
                  setSelectedWarehouseId('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors whitespace-nowrap"
                type="button"
              >
                <XCircle size={18} />
              </button>
            )} */}

            <DebounceSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              placeholder={'Search Products'}
            />
          </div>
        </div>
        {/* grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 */}
        <div
          id="bottom"
          className="flex flex-col md:flex-row items-start gap-5 mt-10"
        >
          <div
            id="filterContainer"
            className="w-[250px] md:w-[300px] shrink-0 max-h-[600px] overflow-auto"
          >
            {groupedVariantsArray?.length > 0
              ? groupedVariantsArray.map((item: any, index: number) => (
                  <Accordion
                    key={index}
                    item={item}
                    translatorNS="faq"
                    lang={lang}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                  />
                ))
              : 'No Variants Found'}
          </div>
          <div
            id="itemListContainer"
            className="flex-1 min-w-0 max-w-full h-auto self-start grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {isLoading ? (
              'Loading...'
            ) : searchFilteredInventories.length === 0 ? (
              'No Inventory Items Found'
            ) : (
              <>
                {searchFilteredInventories.map((inventory) => (
                  <ProductListCard
                    key={inventory._id}
                    data={{
                      ...inventory.product,
                      quantity: inventory.quantity,
                      stockAlert: inventory.stockAlertThreshold,
                      barcode: inventory.barcode,
                      warehouses: inventory.warehouse,
                      isOutOfStock: inventory.quantity <= 0
                    }}
                    type="STANDARD" // Change from INVENTORY to STANDARD type
                    isInWishlist={wishlistProductIds?.includes(inventory.product._id)}
                    setUpdateList={setUpdateList}
                    updateList={updateList}
                    wishlist={wishlist}
                    setWishlist={setWishlist}
                    lang={lang}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
    </Container>
  );
};

// Helper function to group variants by name and add price/offer filters
const groupVariants = (variants: Variant[]) => {
  if (!Array.isArray(variants)) return {};
  
  const grouped: Record<string, Set<string>> = variants.reduce((acc, variant) => {
    if (!variant?.variantName?.name) return acc;
    
    const key = variant.variantName.name;
    if (!acc[key]) {
      acc[key] = new Set(); // Use Set for automatic uniqueness
    }
    
    if (variant.value) {
      acc[key].add(variant.value);
    }
    
    return acc;
  }, {} as Record<string, Set<string>>);

  // Convert all Sets to Arrays and add default filters
  const result: Record<string, string[]> = {
    ...Object.fromEntries(
      Object.entries(grouped).map(([key, valueSet]) => [
        key,
        Array.from(valueSet as Set<string>).sort()
      ])
    ),
    Offers: ['Discounted'],
    Price: [
      '$0 - $5000',
      '$5000 - $10000',
      '$10000 - $15000',
      '$15000 - $20000',
      '$20000 - $25000',
      '$25000 - $30000',
      '$30000 - $35000',
      '$35000 - $40000',
    ],
  };

  return result;
};

export default ItemListPageContent;
