'use client';
import { useWishlist } from '@/contexts/wishlistContext';
import { IoHeartOutline } from 'react-icons/io5';

const WishlistCounter = ({ count }: any) => {
  const { wishlist } = useWishlist();
  // const wishlist = getAllItems();
  // console.log(wishlist, '===>>> wishlist');
  return (
    <div className="relative flex items-center hover:cursor-pointer">
      <div>
        <IoHeartOutline className="w-[28px] h-[28px] text-brand-dark text-opacity-40" />
        <span className="min-w-[20px] min-h-[20px] p-0.5 rounded-[20px] flex items-center justify-center bg-brand-button-hover text-brand-light absolute top-[10px] ltr:left-4 rtl:right-2 text-10px font-bold">
          {wishlist?.length || "0"}
        </span>
      </div>
      {/* <h1 className="text-brand-dark ml-2">Wishlist</h1> */}
    </div>
  );
};
export default WishlistCounter;
