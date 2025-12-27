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
  warehouse: { _id: string; name: string; isMain: boolean};
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
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCategoriesQuery } from '@/framework/basic-rest/category/get-all-categories';
import { fetchSubCategories } from '@/framework/basic-rest/category/get-all-sub-categories';
import CategoryCard from '@/components/category/category-card';
import React, { useEffect, useState } from 'react';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { useProductsByCategoryQuery } from '@/framework/basic-rest/product/get-products-by-category';
import { CategoriesSkeletons } from '@/components/ui/skeletons';
import AppLoader from '@/components/common/AppLoader';

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
  const [isVariantsLoading, setIsVariantsLoading] = useState<boolean>(false);
    const [loginWarehouse, setLoginWarehouse] = useState<any>();
    const { data: user, isLoading: userLoading } = useUserDataQuery();

    // console.log("search i inv",searchQuery );
    
  
  

    
      useEffect(() => {
      if (!userLoading) {
      const savedWarehouse = localStorage.getItem('selectedWarehouse');

      if (savedWarehouse) {
      try {
        const parsedWarehouse = JSON.parse(savedWarehouse);
        setLoginWarehouse(parsedWarehouse);
      } catch (error) {
        console.error("Failed to parse saved warehouse:", error);
        setLoginWarehouse(null);
      }
    } else {
      console.warn("No saved warehouse found in localStorage.");
      setLoginWarehouse(null);
    }
  }
}, [userLoading]);
  const params = useParams();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const router = useRouter();
  const subCateId = queryId?.split(',')[1] || '';
  const parentCateId = queryId?.split(',')[0] || '';
  const { itemlist: categoryId, category } = params;
  const PageTitle = decodeURIComponent(`${category}`);
  // Fetch top-level categories for Inventory category view
  const { data: allCategories, isLoading: categoriesLoading } = useCategoriesQuery({ limit: 100 });


  // Fetch warehouses
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehousesQuery();
  
  // Fetch all inventories
  const { data: inventories, isLoading } = useInventories();

  // Fetch products by category/subcategory when subcategory is selected
  const {
    data: productsByCategoryResp,
    isLoading: isLoadingProductsByCategory,
  } = useProductsByCategoryQuery(parentCateId, subCateId);

  // console.log(inventories, '===>>> inventories');
  

  // Filter and sort inventories based on warehouse filter
  const filteredInventories = React.useMemo(() => {
    if (!inventories) return [];
    
    let filtered = [...inventories];
    // console.log(filtered, '===>>> filtered before warehouse');

    // Apply warehouse filter
    if (selectedWarehouseId) {
        filtered = filtered.filter(inv =>  inv.warehouse?._id === selectedWarehouseId);
    } else {
      switch (warehouseFilter) {
        case 'main-warehouse':
        filtered = filtered.filter(inv => inv.warehouse?.isMain);
        break;
        case 'out-to-store':
        filtered = filtered.filter(
        inv => 
        !inv.warehouse?.isMain &&               // store only
        inv.warehouse?._id !== loginWarehouse?._id // exclude my store
      );
          break;
          case "warehouse-plus-store":
            filtered = filtered.filter(
              inv =>
                inv.warehouse?._id !== loginWarehouse?._id
            );
            
          break;
          case "my-store-inventory":
          filtered = filtered.filter(inv => inv.warehouse?._id === loginWarehouse?._id);
          break;
    
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

  // Subcategories state (used when a parent category is selected)
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (parentCateId && !subCateId) {
        setSubCategoriesLoading(true);
        try {
          const subs = await fetchSubCategories(parentCateId);
          setSubCategories(subs || []);
        } catch (err) {
          setSubCategories([]);
        } finally {
          setSubCategoriesLoading(false);
        }
      } else {
        setSubCategories([]);
      }
    };
    loadSubCategories();
  }, [parentCateId, subCateId]);

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

      // Variant filters (with normalized comparison)
      const variantFilters = Object.entries(selectedFilters)
        .filter(([filterType]) => filterType !== 'Price' && filterType !== 'Offers');
      
      if (variantFilters.length === 0) return true;

      return variantFilters.every(([filterType, values]) => {
        if (!Array.isArray(values)) return false;

        const targetFilter = String(filterType).toLowerCase().trim();

        return product.variants?.some(variant => {
          const variantName = String(variant?.variantName?.name || '').toLowerCase().trim();
          const variantValue = String(variant?.value || '').toLowerCase().trim();

          // Compare normalized names and values
          if (variantName !== targetFilter) return false;

          return values.some((v: any) => String(v).toLowerCase().trim() === variantValue);
        });
      });
    });
  };

  // Apply category/subcategory filtering when query param is present
  const filteredByCategory = React.useMemo(() => {
    if (!parentCateId) return filteredInventories;
    return filteredInventories.filter(inv => {
      const prod = inv?.product || {};
      if (subCateId) {
        return prod?.subcategory?._id === subCateId || prod?.subcategory?._id === parentCateId;
      }
      return prod?.category?._id === parentCateId || prod?.subcategory?._id === parentCateId;
    });
  }, [filteredInventories, parentCateId, subCateId]);

  // Filter products returned by category API according to warehouse filter
  const filterCategoryProductsByWarehouse = (products: any[] = []) => {
    if (!Array.isArray(products)) return [];

    if (selectedWarehouseId) {
      return products.filter((p: any) => {
        if (Array.isArray(p.inventory)) {
          return p.inventory.some((it: any) => it?.warehouse?._id === selectedWarehouseId);
        }
        return p?.warehouse?._id === selectedWarehouseId;
      });
    }

    switch (warehouseFilter) {
      case 'main-warehouse':
        return products.filter((p: any) => {
          if (Array.isArray(p.inventory)) return p.inventory.some((it: any) => it?.warehouse?.isMain);
          return p?.warehouse?.isMain;
        });
      case 'out-to-store':
        return products.filter((p: any) => {
          if (Array.isArray(p.inventory))
            return p.inventory.some((it: any) => !it?.warehouse?.isMain && it?.warehouse?._id !== loginWarehouse?._id);
          return !p?.warehouse?.isMain && p?.warehouse?._id !== loginWarehouse?._id;
        });
      case 'out-of-stock':
        return products.filter((p: any) => {
          if (Array.isArray(p.inventory)) {
            const totalQty = p.inventory.reduce((s: number, it: any) => s + (it?.quantity || 0), 0);
            return totalQty <= 0;
          }
          return (p?.quantity || 0) <= 0;
        });
      case 'warehouse-plus-store':
        return products.filter((p: any) => {
          if (Array.isArray(p.inventory)) return p.inventory.some((it: any) => it?.warehouse?._id !== loginWarehouse?._id);
          return p?.warehouse?._id !== loginWarehouse?._id;
        });
      case 'my-store-inventory':
        return products.filter((p: any) => {
          if (Array.isArray(p.inventory)) return p.inventory.some((it: any) => it?.warehouse?._id === loginWarehouse?._id);
          return p?.warehouse?._id === loginWarehouse?._id;
        });
      default:
        return products;
    }
  };

  // Apply selected filters locally (no new API call) and then apply search on top
  const filteredBySelectedFilters = React.useMemo(() => {
    // Apply selected filters on top of category/warehouse filtered inventories
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) return filteredByCategory;
    return filterProductsByFilters(filteredByCategory as any, selectedFilters);
  }, [filteredByCategory, selectedFilters]);

  const searchFilteredInventories = React.useMemo(() => {
    const base = filteredBySelectedFilters || [];
    if (!debouncedQuery) return base;

    const q = debouncedQuery.toLowerCase();
    return base.filter((inventory) => {
      const invAny: any = inventory;
      const name = String(invAny?.product?.name || invAny?.productInfo?.name || '').toLowerCase();
      const sku = String(invAny?.product?.sku || invAny?.productInfo?.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [filteredBySelectedFilters, debouncedQuery]);

  useEffect(() => {
    if (!parentCateId || !subCateId) return; 

    let isMounted = true;

    const fetchVariants = async () => {
      setIsVariantsLoading(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/api/variants/product-variants/categoryId/${parentCateId}/subcategory/${subCateId}`
        );

        if (!response?.ok) {
          throw new Error('Failed to fetch variants');
        }

        const data = await response.json();

        if (!isMounted) return;

        // Handle both direct array and wrapped response format
        const variantsData = Array.isArray(data) ? data : (data?.data || []);
        
        console.log("Fetched variants:", variantsData); // Debug log
        setVariants(variantsData);

        // Group variants
        const grouped = groupVariants(variantsData);
        console.log("Grouped variants:", grouped); // Debug log
        setGroupedVariantsArray(Object.entries(grouped));
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        if (isMounted) {
          setIsVariantsLoading(false);
        }
      }
    };

    fetchVariants();

    return () => {
      isMounted = false;
    };
  }, [parentCateId, subCateId]);



// Prepare category-api products filtered by warehouse and search
const searchFilteredCategoryProducts = React.useMemo(() => {
  let products = (productsByCategoryResp?.data || productsByCategoryResp) || [];
  
  // Apply warehouse filter
  const warehouseFiltered = filterCategoryProductsByWarehouse(products);
  
  // Apply variant filters to category products
  let filtered = warehouseFiltered;
  if (selectedFilters && Object.keys(selectedFilters).length > 0) {
    filtered = warehouseFiltered.filter((product: any) => {
      // Price filter
      if (selectedFilters.Price?.length) {
        const hasMatchingPrice = product?.prices?.some((price: any) => {
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

      // Offers filter
      if (selectedFilters.Offers?.includes('Discounted')) {
        const hasOnSale = product?.prices?.some((p: any) => (p.salePrice ?? 0) > 0);
        if (!hasOnSale) return false;
      }

      // Variant filters (with normalized comparison)
      const variantFilters = Object.entries(selectedFilters)
        .filter(([filterType]) => filterType !== 'Price' && filterType !== 'Offers');
      
      if (variantFilters.length === 0) return true;

      return variantFilters.every(([filterType, values]) => {
        if (!Array.isArray(values)) return false;

        const targetFilter = String(filterType).toLowerCase().trim();

        return product?.variants?.some((variant: any) => {
          const variantName = String(variant?.variantName?.name || '').toLowerCase().trim();
          const variantValue = String(variant?.value || '').toLowerCase().trim();

          // Compare normalized names and values
          if (variantName !== targetFilter) return false;

          return values.some((v: any) => String(v).toLowerCase().trim() === variantValue);
        });
      });
    });
  }

  // Apply search filter
  if (!debouncedQuery) return filtered;
  const q = debouncedQuery.toLowerCase();
  return filtered.filter((p: any) => {
    const name = String(p?.name || p?.product?.name || '').toLowerCase();
    const sku = String(p?.sku || p?.product?.sku || '').toLowerCase();
    return name.includes(q) || sku.includes(q);
  });
}, [productsByCategoryResp, debouncedQuery, warehouseFilter, selectedWarehouseId, loginWarehouse, selectedFilters]);

if (isLoadingProductsByCategory) return <ProductListSkeleton />;
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
                  setSelectedWarehouseId(''); 
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              >
                <option value="main-warehouse">Available</option>
                <option value="out-to-store">Out to Store</option>
                <option value="my-store-inventory">My Store Inventory</option>
                <option value="out-of-stock">Out Of Stock</option>
                <option value="warehouse-plus-store">All</option>

              </select>
            </div>

            {/* Specific Warehouse Selector (optional) */}
            {/* <div className="flex items-center gap-2">
              <label htmlFor="warehouseSelect" className="text-sm font-medium whitespace-nowrap">
                
              </label>
              {isLoadingWarehouses ? (
                <select disabled className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 min-w-[180px]">
                  <option>Loading warehouses...</option>
                </select>
              ) : (
                <select
                  id="warehouseSelect"
                  value={selectedWarehouseId}
                  onChange={(e) => {
                    setSelectedWarehouseId(e.target.value);
                    // clear the high-level warehouse filter when a specific warehouse is chosen
                    setWarehouseFilter('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                  <option value="">All Warehouses</option>
                  {warehouses?.map((w: any) => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              )}
            </div> */}

  
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
          {/* If no category selected -> show categories grid */}
          {!parentCateId ? (
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Inventory Categories</h2>
              {categoriesLoading ? (
                <CategoriesSkeletons />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {allCategories?.map((item: any) => (
                  <div
                    key={item?._id}
                    onClick={async () => {
                      const subs = await fetchSubCategories(item?._id);
                      if (subs && subs.length > 0) {
                        router.push(`/${lang}/Inventory?id=${item?._id}`);
                      } else {
                        router.push(`/${lang}/Inventory?id=${item?._id}`);
                      }
                    }}
                    className="border-[1px] rounded-xl border-transparent transition-all duration-300 ease-in-out hover:border-gray-600 cursor-pointer"
                  >
                    <CategoryCard item={item} />
                  </div>
                  ))}
                </div>
              )}
            </div>
          ) : parentCateId && !subCateId ? (
            // Show subcategories for selected parent category
            <div className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Subcategories</h2>
                <button
                  className="text-sm text-blue-600"
                  onClick={() => router.push(`/${lang}/Inventory`)}
                >
                  Back to Categories
                </button>
              </div>
              {subCategoriesLoading ? (
                <CategoriesSkeletons />
              ) : subCategories?.length === 0 ? (
                <div>No subcategories found. Showing products for this category.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {subCategories.map((sub: any) => (
                    <div
                      key={sub._id}
                      onClick={() => router.push(`/${lang}/Inventory?id=${parentCateId},${sub._id}`)}
                      className="border-[1px] rounded-xl border-transparent transition-all duration-300 ease-in-out hover:border-gray-600 cursor-pointer"
                    >
                      <CategoryCard item={sub} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Default: show inventory items (filtered by category/subcategory)
            <>
              {/* Inventory items for selected subcategory (via category API if available) */}
              <div
                id="filterContainer"
                className="w-[250px] md:w-[300px] shrink-0 max-h-[600px] overflow-auto"
              >
                {isVariantsLoading ? (
               <AppLoader label=''/>
                ) : groupedVariantsArray && groupedVariantsArray?.length > 0 ?  ( 
                  groupedVariantsArray?.map((item: any, index: number) => (
                      <Accordion
                        key={index}
                        item={item}
                        translatorNS="faq"
                        lang={lang}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                      />
                    )))
                  : (
                <p className="text-center text-brand-muted py-6">
                  No Variants Found
                </p>
              )}
              </div>
              <div
                id="itemListContainer"
                className="flex-1 min-w-0 max-w-full h-auto self-start grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {isLoadingProductsByCategory ? (
                  " "
                ) : productsByCategoryResp && (productsByCategoryResp?.data || productsByCategoryResp)?.length > 0 ? (
                  <>
                    {searchFilteredCategoryProducts.map((product: any) => {
                      const totalQty = Array.isArray(product?.inventory)
                        ? product?.inventory.reduce((s: number, it: any) => s + (it?.quantity || 0), 0)
                        : product?.quantity || 0;
                      const warehouseObj = Array.isArray(product?.inventory) ? product?.inventory[0]?.warehouse : product?.warehouse;
                      return (
                        <ProductListCard
                          key={product?._id}
                          data={{
                            ...product,
                            quantity: totalQty,
                            stockAlert: product?.stockAlertThreshold || 0,
                            barcode: product?.barcode,
                            warehouses: warehouseObj,
                            loginWarehouse: loginWarehouse,
                            isOutOfStock: totalQty <= 0,
                          }}
                          type="STANDARD"
                          isInWishlist={wishlistProductIds?.includes(product?._id)}
                          setUpdateList={setUpdateList}
                          updateList={updateList}
                          wishlist={wishlist}
                          setWishlist={setWishlist}
                          lang={lang}
                        />
                      );
                    })}
                  </>
                ) : isLoading ? (
                  <ProductListSkeleton />
                ) : searchFilteredInventories?.length === 0 ? (
                  'No Inventory Items Found'
                ) : (
                  <>
                    {searchFilteredInventories?.map((inventory) => (
                      <ProductListCard
                        key={inventory?._id}
                        data={{
                          ...inventory?.product,

                          quantity: inventory?.quantity,
                          stockAlert: inventory?.stockAlertThreshold,
                          barcode: inventory?.barcode,
                          warehouses: inventory?.warehouse,
                         loginWarehouse:loginWarehouse,
                          isOutOfStock: inventory?.quantity <= 0
                        }}
                        type="STANDARD" // Change from INVENTORY to STANDARD type
                        isInWishlist={wishlistProductIds?.includes(inventory?.product?._id)}
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
            </>
          )}
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
    
    const key = variant?.variantName?.name;
    if (!acc[key]) {
      acc[key] = new Set(); // Use Set for automatic uniqueness
    }
    
    if (variant.value) {
      acc[key].add(variant?.value);
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
