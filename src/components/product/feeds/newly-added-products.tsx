'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCategoriesQuery } from '@/framework/basic-rest/category/get-all-categories';
import NewProductCard from '@/components/cards/newProductCard';
import {
  fetchNewProducts,
  useNewlyProductQuery,
} from '@/framework/basic-rest/product/get-product';
import { useUI } from '@/contexts/ui.context';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { NewProductSkeletons } from '@/components/ui/skeletons';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

const NewlyAddedProduct = ({ lang }: any) => {
  const {
    data: categories,
    isLoading: categoryLoading,
    error,
  } = useCategoriesQuery({ limit: 2 });
  const { isAuthorized } = useUI();

  const [selectedCategory, setSelectedCategory] = useState<string | any>('');
  const [selectedItem, setSelectedItem] = useState('Diamond');
  const [getProducts, setGetProducts] = useState<null | any>([]);
  const [regularProducts, setRegularProducts] = useState<null | any>([]);
  const [specialProducts, setSpecialProducts] = useState<null | any>([]);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isError, setIsError] = useState<any>('');
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';
  // const { data: user, isLoading: userLoading } = useUserDataQuery();

  useEffect(() => {
    if (categories?.length > 0 && !selectedCategory) {
      setSelectedCategory(categories?.[0]?._id);
    }
  }, [categories, selectedCategory]); // Run only when categories change

  // console.log(selectedCategory, '===>>> selectedCategory');

  // const { data, isLoading } = useNewlyProductQuery();

  // console.log(user?.lastLoginDate, '===>>> user');

  const handleCategoryChange = (
    newCategoryId: string,
    newCategoryName: string,
  ) => {
    setSelectedCategory(newCategoryId);
    setSelectedItem(newCategoryName);
  };

  const fetchNewlyAddedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetchNewProducts();
      // console.log(response, 'res');
      if (response) {
        setRegularProducts(response?.regularProducts?.slice(0, 5) || []);
        setSpecialProducts(response?.specialProducts?.slice(0, 5) || []);
        setIsError('');
      } else {
        setRegularProducts([]);
        setSpecialProducts([]);
        setIsError('Unable to load new products');
      }
    } catch (error) {
      console.error('Error fetching new products:', error);
      setRegularProducts([]);
      setSpecialProducts([]);
      setIsError('Unable to load new products');
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchNewlyAddedProducts = async () => {
  //   setIsLoading(true);
  //   const response = await fetchNewProducts();

  //   if (response) {
  //     if (!user?.lastLoginDate) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     const lastLoginTime = new Date(user.lastLoginDate); // Convert last login date to Date object

  //     // Filter regular and special products based on last login date
  //     const newRegularProducts = response?.regularProducts
  //       ?.filter((product: any) => new Date(product?.createdAt) > lastLoginTime)
  //       .slice(0, 5);

  //     const newSpecialProducts = response?.specialProducts
  //       ?.filter((product: any) => new Date(product?.createdAt) > lastLoginTime)
  //       .slice(0, 5);

  //     // Set state with filtered products
  //     setRegularProducts(newRegularProducts);
  //     setSpecialProducts(newSpecialProducts);
  //   } else {
  //     setRegularProducts([]);
  //     setSpecialProducts([]);
  //   }
  //   setIsLoading(false);
  // };

  useEffect(() => {
    if (isAuthorized) {
      fetchNewlyAddedProducts();
    } else {
      setIsError('No New Porducts');
      return;
    }
  }, []);

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <section className="my-10">
      <div
        id="top"
        className="flex lg:items-center lg:justify-between lg:flex-row flex-col gap-3 items-center "
      >
        <div className="leftSide">
          <h1 className="text-3xl font-bold">Newly Added Products</h1>
        </div>
      </div>
      {!isAuthorized ? (
        <div className="text-2xl w-fit border rounded-lg border-black p-4 mt-5">
          Log in to see New Products
        </div>
      ) : (
        ''
      )}
      {isLoading ? (
        <NewProductSkeletons />
      ) : isAuthorized ? (
        <>
          <h1 className="text-xl font-semibold mt-5">Regular Products</h1>
          <div
            id="bottom"
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {regularProducts.length > 0
              ? regularProducts.map((product: any) => {
                  // console.log(product, 'product');
                  return (
                    <Link
                      // href={`/${lang}/${product?.category[0]?.name}/${product?.subcategory[0]?.name}/${product._id}`}
                      href={`/${lang}/${product?.category?.[0]?.name}/${product?.subcategory?.[0]?.name}/${product?.name}?id=${product?._id}`}
                      key={product._id}
                    >
                      <NewProductCard data={product} lang={lang} />
                      {/* <div>hello</div> */}
                    </Link>
                  );
                })
              : 'No New Products'}
          </div>
        </>
      ) : (
        ''
      )}
      {isLoading ? (
        <NewProductSkeletons />
      ) : isAuthorized ? (
        <>
          {permissions[key]?.View && (
            <>
              <h1 className="text-xl font-semibold mt-5">Other Products</h1>
              <div
                id="bottom"
                className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
              >
                  {specialProducts.length > 0
                  ? specialProducts?.map((product: any) => {
                      return (
                        <Link
                          href={`/${lang}/specialProducts/${product?._id}`}
                          key={product?._id}
                        >
                          <NewProductCard data={product} lang={lang} />
                          {/* <div>hello</div> */}
                        </Link>
                      );
                    })
                  : 'No New Products'}
              </div>
            </>
          )}
        </>
      ) : (
        ''
      )}
      <div
        id="bottom"
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* {products?.count > 0
          ? products?.data.map((product: any) => {
              return (
                <Link
                  href={`/${lang}/product/${product._id}`}
                  key={product._id}
                >
                  <NewProductCard data={product} />
                </Link>
              );
            })
          : 'No products found'} */}
      </div>
      {/* <div className="my-16 w-full flex items-center justify-center">
        <button className="w-fit bg-[#666665] text-white py-3 px-7 rounded-lg">
          See More
        </button>
      </div> */}
    </section>
  );
};

export default NewlyAddedProduct;
