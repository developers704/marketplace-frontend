'use client';
import WishlistItem from '@/components/common/wishlist-item';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { useWishlist } from '@/contexts/wishlistContext';
import { deleteAllWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import {
  getWishListItem,
  useGetAllWishlist,
} from '@/framework/basic-rest/wishlist/get-wishlist';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const WishlistPageContent = ({ lang }: { lang: string }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any>();
  const [updateList, setUpdateList] = useState<boolean | any>(false);
  const { data, isLoading, error } = useGetAllWishlist();
  const { removeFromWishlist, clearWishlist } = useWishlist();
  // console.log(data?.products, '===>>> data');

  useEffect(() => {
    const fetchWishlist = async () => {
      const response = await getWishListItem(); // Fetch wishlist API
      setWishlist(response); // ✅ Update state
      if (response) {
        setProducts(response.products);
      }
    };

    fetchWishlist();
  }, [updateList]);

  // useEffect(() => {
  //   if (!isLoading) {
  //     setProducts(data.products);
  //   }
  //   // getWishListItem();
  // }, [data, updateList]);

  const handleDeleteAll = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove all items from your wishlist!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await deleteAllWishlistItem();
        //  dispatch({ type: 'CLEAR_WISHLIST' });
        Swal.fire('Cleared!', 'Your wishlist has been emptied.', 'success');
        // console.log(response, '===>>> response');
        setUpdateList(!updateList);
      }
    });
  };

  // console.log(products, '===>>> products');

  return (
    <Container>
      <section className="my-10 px-14">
        <Breadcrumb lang={lang} />
        <div>
          <div className="flex justify-center items-center mb-10">
            <h1 className="text-3xl font-bold">Wishlist</h1>
          </div>

          <div className="backContainer bg-[#f4f4f4] p-6 shadow-md mb-5">
            <div>
              <div className="bg-[white] shadow flex items-center py-3">
                <div className="flex-1 w-full text-center font-semibold">
                  Product
                </div>
                <div className="flex-1 w-full text-center font-semibold">
                  Price
                </div>
                <div className="flex-1 w-full text-center font-semibold">
                  Action
                </div>
              </div>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div>
                  {products?.length == 0
                    ? 'No Products in wishlist'
                    : products?.map((item: any) => (
                        <WishlistItem
                          key={item?.product._id}
                          product={item?.product}
                          setUpdateList={setUpdateList}
                          updateList={updateList}
                          removeFromWishlist={removeFromWishlist}
                        />
                      ))}
                </div>
              )}
              <div>{/* <WishlistItem /> */}</div>
            </div>
          </div>
          <div
            className="bg-blue-500 rounded py-2 px-4 w-fit text-white cursor-pointer"
            onClick={handleDeleteAll}
          >
            Clear All
          </div>
        </div>
      </section>
    </Container>
  );
};

export default WishlistPageContent;
