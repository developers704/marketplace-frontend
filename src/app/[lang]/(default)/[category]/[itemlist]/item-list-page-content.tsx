'use client';
import ProductListCard from '@/components/cards/product-list-card';
import AppLoader from '@/components/common/AppLoader';
import DebounceSearch from '@/components/common/debounceSearch';
import Accordion from '@/components/ui/accordion';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { ProductListSkeleton } from '@/components/ui/skeletons';
import { fetchProductsVariants } from '@/framework/basic-rest/filtration/useFiltration';
import { useProductsByCategoryQuery } from '@/framework/basic-rest/product/get-products-by-category';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import { useParams, useSearchParams } from 'next/navigation';
import { useWarehousesQuery } from '@/framework/basic-rest/warehouse/get-all-warehouses';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ItemListPageContent = ({ lang }: any) => {
  const [wishlistProductIds, setWishlistProductIds] = useState<any>();
  const [wishlist, setWishlist] = useState<any>();
  const [updateList, setUpdateList] = useState<boolean | any>(false);
  const [varinats, setVariants] = useState<any[]>([]);
  const [groupedVariantsArray, setGroupedVariantsArray] = useState<any>();
   const [isVariantsLoading, setIsVariantsLoading] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [searchQuery, setSearchQuery] = useState<string | any>('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const params = useParams();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const subCateId = queryId?.split(',')[1] || '';
  const parentCateId = queryId?.split(',')[0];
  const { itemlist: categoryId, category } = params;
  const PageTitle = decodeURIComponent(`${category}`);

  const [warehouseFilter, setWarehouseFilter] = useState<string>('main-warehouse');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [loginWarehouse, setLoginWarehouse] = useState<any>();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehousesQuery();
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  
  useEffect(() => {
    const savedWarehouse = localStorage.getItem('selectedWarehouse');
    if (savedWarehouse) {
      try {
        setLoginWarehouse(JSON.parse(savedWarehouse));
      } catch (err) {
        setLoginWarehouse(null);
      }
    } else setLoginWarehouse(null);
  }, []);

  const {
    data: categoryProducts,
    isLoading,
    error,
  } = useProductsByCategoryQuery(parentCateId, subCateId);

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

  // const filterProductsByFilters = (products: any, selectedFilters: any) => {
  //   // console.log(products, '===>>> products');
  //   if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
  //     return products; // ✅ Return all products if no filters are selected
  //   }

  //   // let filteredProducts = filterByPriceAndOffers(products, selectedFilters);

  //   return products?.filter((product: any) => {
  //     return Object.entries(selectedFilters)?.every(
  //       ([filterType, values]: any) => {
  //         // Ensure product has at least one matching variant for this filter
  //         return product?.variants?.some(
  //           (variant: any) =>
  //             variant?.variantName?.name === filterType &&
  //             values?.includes(variant?.value),
  //         );
  //       },
  //     );
  //   });
  // };

  // Example Usage:
  const filteredProductsArray = filterProductsByFilters(
    categoryProducts?.data || [],
    selectedFilters,
  ) || [];

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

const getProductVarinats = async () => {
  try {
    setIsVariantsLoading(true);

    const response = await fetchProductsVariants();

    if (response && response.length > 0) {
      setVariants(response);
    } else {
      console.log('No Variants Found');
      setVariants([]);
    }
  } catch (error) {
    console.log(error, '===>>> error');
    setVariants([]);
  } finally {
    setIsVariantsLoading(false); 
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
        console.log('No Variants Found');
        setGroupedVariantsArray([]);
      }
    }
  }, [varinats]);

  const filteredProducts = (filteredProductsArray || [])?.filter((product: any) =>
    product.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

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
              {PageTitle}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4 flex-wrap gap-2">
          
      
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
                <option value="warehouse-plus-store">All</option>

              </select>
            </div>
           
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
            {isVariantsLoading ? 
            (<AppLoader label=' ' />) : groupedVariantsArray?.length > 0
              ? groupedVariantsArray.map((item: any, index: number) => (
                  <Accordion
                    key={index}
                    item={item}
                    translatorNS="faq"
                    lang={lang}
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                  />
                )): (

                   'No Variants Found'
                  )
                }
          </div>
          <div
            id="itemListContainer"
            className="flex-1 min-w-0 max-w-full h-auto self-start grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {isLoading ? (
              'Loading...'
            ) : categoryProducts?.count === 0 ? (
              'No Products Found'
            ) : (
              <>
                {(debouncedQuery ? filteredProducts || [] : filteredProductsArray || [])
                  .slice()
                  .reverse()
                  .filter((p: any) => filterCategoryProductsByWarehouse([p]).length > 0)
                  .map((item: any) => {
                    const isInWishlist = wishlistProductIds?.includes(item?._id);
                    return (
                      <ProductListCard
                        key={item?._id}
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
      </section>
    </Container>
  );
};

export default ItemListPageContent;
