'use client';
import ProductListCard from '@/components/cards/product-list-card';
import DebounceSearch from '@/components/common/debounceSearch';
import Accordion from '@/components/ui/accordion';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { ProductListSkeleton } from '@/components/ui/skeletons';
import { fetchProductsVariants } from '@/framework/basic-rest/filtration/useFiltration';
import {
  useProducts,
  // useProductsByCategoryQuery,
} from '@/framework/basic-rest/product/get-products-by-category';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import { useWarehousesQuery } from '@/framework/basic-rest/warehouse/get-all-warehouses';
import PreventScreenCapture from '@/utils/PreventScreenShots';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
// import { XCircle } from "lucide-react";

const ItemListPageContent = ({ lang }: any) => {
  const [wishlistProductIds, setWishlistProductIds] = useState<any>();
  const [wishlist, setWishlist] = useState<any>();
  const [updateList, setUpdateList] = useState<boolean | any>(false);
  const [varinats, setVarinats] = useState<any[]>([]);
  const [groupedVariantsArray, setGroupedVariantsArray] = useState<any>();
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
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
  
  // Fetch products with warehouse filters and pagination
  const { data: productsData, isLoading, error } = useProducts(
    selectedWarehouseId ? undefined : (warehouseFilter || undefined), // Use warehouseFilter only if no specific warehouse selected
    selectedWarehouseId || undefined,
    currentPage,
    productsPerPage
  );

  const categoryProducts = productsData?.products || [];
  const pagination = productsData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };

  const activeProducts = categoryProducts?.filter((item: any) => {
    return item?.lifecycleStage === 'active';
  });

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

  const filterProductsByFilters = (products: any, selectedFilters: any) => {
    // console.log(products, '===>>> products');
    if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
      return products; // ✅ Return all products if no filters are selected
    }

    let filteredProducts = filterByPriceAndOffers(products, selectedFilters);

    // 🔹 Step 2: Apply other filters (e.g., variants, categories)
    return filteredProducts?.filter((product: any) => {
      return Object.entries(selectedFilters)
        ?.filter(
          ([filterType]) => filterType !== 'Offers' && filterType !== 'Price',
        ) // ✅ Ignore 'offers' & 'price'
        ?.every(([filterType, values]: any) => {
          return product?.variants?.some(
            (variant: any) =>
              variant?.variantName?.name === filterType &&
              values?.includes(variant?.value),
          );
        });
    });
  };

  // Example Usage:
  const filteredProductsArray = filterProductsByFilters(
    activeProducts,
    selectedFilters,
  );

  // console.log(categoryProducts, '===>>> categoryProducts');

  const getProductVarinats = async () => {
    try {
      const response = await fetchProductsVariants();
      if (response && response?.length > 0) {
        setVarinats(response);
      } else {
        // console.log('No Variants Found');
        setVarinats([]);
      }
    } catch (error) {
      // console.log(error, '===>>> error');
    }
  };

  const groupVariants = (variants: any[]) => {
    return variants.reduce(
      (acc, variant) => {
        const key = variant?.variantName?.name; // Group by variantName
        if (!acc[key]) {
          acc[key] = []; // Initialize array if not exists
        }
        acc[key].push(variant?.value); // Push the value (e.g., Gold, Silver)
        return acc;
      },
      {
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
      } as Record<string, string[]>,
    ); // Define return type as { [key: string]: string[] }
  };

  // console.log(selectedFilters, '===>>> selectedFilters');

  useEffect(() => {
    const fetchWishlist = async () => {
      const response = await getWishListItem(); // Fetch wishlist API
      // setWishlist(response); // ✅ Update state

      if (response) {
        // setProducts(response.products);
        setWishlistProductIds(
          response?.products?.map((item: any) => item.product._id) || [],
        );
        setWishlist(response.products);
      }
    };
    fetchWishlist();
  }, [updateList]);

  useEffect(() => {
    getProductVarinats();
  }, []);

  useEffect(() => {
    if (varinats.length > 0) {
      const groupedVariants = groupVariants(varinats);
      // console.log(groupedVariants, '===>>> groupedVariants');
      if (groupedVariants) {
        setGroupedVariantsArray(Object.entries(groupedVariants));
      } else {
        // console.log('No Variants Found');
        setGroupedVariantsArray([]);
      }
    }
  }, [varinats]);

  const filteredProducts = filteredProductsArray?.filter((product: any) => {
    if (product?.lifecycleStage === 'active') {
      return product.name.toLowerCase().includes(debouncedQuery.toLowerCase());
    }
  });

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
            ) : activeProducts?.length === 0 ? (
              'No Products Found'
            ) : (
              <>
                {(debouncedQuery ? filteredProducts : filteredProductsArray)
                  ?.slice()
                  ?.reverse()
                  .map((item: any) => {
                    const isInWishlist = wishlistProductIds?.includes(item._id);
                    return (
                      <ProductListCard
                        key={item._id}
                        lang={lang}
                        data={item}
                        type="STANDARD"
                        isInWishlist={isInWishlist}
                        setUpdateList={setUpdateList}
                        updateList={updateList}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                      />
                    );
                  })}
              </>
            )}
          </div>
        </div>
        
        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Next
            </button>
            
            {/* Page Size Selector */}
            <select
              value={productsPerPage}
              onChange={(e) => {
                setProductsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ml-4"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        )}
      </section>
    </Container>
  );
};

export default ItemListPageContent;
