'use client';
import { getWishListItem } from '@/framework/basic-rest/wishlist/get-wishlist';
import { createContext, useContext, useEffect, useState } from 'react';
import { useUI } from './ui.context';

// Define the structure of a wishlist item
interface WishlistItem {
  id: string;
  name: string;
  image?: string;
}

// Define the context type
interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  addAllToWishlist: (item: WishlistItem[] | any) => any;
  // getWishListItem: () => WishlistItem[] | any;
}

// Create context with an empty default value
const WishlistContext = createContext<WishlistContextType | [] | any>([]);

// Provider Component
export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<WishlistItem[] | any>([]);
  const [update, setUpdate] = useState<boolean | any>(false);
  const { isAuthorized } = useUI();

  const fetchWishlist = async () => {
    const response = await getWishListItem(); // Fetch wishlist API
    // console.log(response.message, '===>>> response.message wishlist context');
    if (response.message === 'Wishlist not found') {
      setWishlist([]);
      // localStorage.setItem('wishlist', JSON.stringify([]));
    } else if (response.products) {
      setWishlist(response.products);
      // localStorage.setItem('wishlist', JSON.stringify(response.products));
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isAuthorized) {
        fetchWishlist();
      } else {
        localStorage.setItem('wishlist', JSON.stringify([]));
      }
    }
  }, [isAuthorized]);

  // Update localStorage whenever wishlist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWishlist: any = localStorage.getItem('wishlist');
      if (storedWishlist === undefined || storedWishlist === null) {
        setWishlist([]);
      } else {
        // setWishlist(JSON.parse(storedWishlist));
      }
    }
  }, []);

  const addAllToWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(items)); // Update localStorage
    }
  };

  // Add item to wishlist
  const addToWishlist = (item: any) => {
    setWishlist((prev: any) => {
      const updatedWishlist = [...prev, item];
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist)); // Update localStorage
      }
      return updatedWishlist;
    });
    setUpdate(!update);
  };

  // Remove item from wishlist
  const removeFromWishlist = (id: string) => {
    setWishlist((prev: any) => {
      const updatedWishlist = prev.filter((item: any) => item?.product?._id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist)); // Update localStorage
      }
      return updatedWishlist;
    });
    setUpdate(!update);
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wishlist'); // Remove from localStorage
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        addAllToWishlist, // Add this function to context
        // getWishListItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Hook to use wishlist context
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
