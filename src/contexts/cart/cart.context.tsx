'use client';

import React, { createContext, useReducer, useEffect, useState } from 'react';
import { useUI } from '../ui.context';
import { getAllCartItems } from '@/framework/basic-rest/cart/use-cart';
import { getToken } from '@/framework/basic-rest/utils/get-token';

// Define cart item type
interface CartItem {
  item: {_id: string}
  // id: string;
  name: string;
  sku: string;
  price: number;
  subTotal?: number;
  quantity: number | 1;
  itemType: string | 'Product';
  image?: string;
}

// Define cart state type
interface CartState {
  cartItems: CartItem[];
}

// Define action types
type CartAction =
  | { type: 'ADD_ALL_TO_CART'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_SINGLE_ITEM'; payload: string }
  | { type: 'REMOVE_ALL_ITEMS' }
  | { type: 'INCREASE_QUANTITY'; payload: string }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Initial state (do not use localStorage directly)
const initialState: CartState = {
  cartItems: [],
};

// Reducer function
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        cartItems: action.payload,
      };
    case 'ADD_ALL_TO_CART': {
      return {
        ...state,
        cartItems: action.payload.map((item) => ({
          ...item,
          quantity: item.quantity || 1, // Ensure quantity is at least 1
          subTotal: item.price * (item.quantity || 1),
        })),
      };
    }
    case 'ADD_TO_CART': {
      const existingItem = state.cartItems.find(
        (item) => item?.item?._id === action.payload.item?._id,
      );
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item?.item?._id === action.payload.item?._id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subTotal: item.price * (item.quantity + 1),
                }
              : item,
          ),
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload }],
      };
    }

    case 'REMOVE_SINGLE_ITEM':
      console.log(action.payload, 'action.payload');
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item?.item?._id !== action.payload,
        ),
      };

    case 'REMOVE_ALL_ITEMS':
      return { ...state, cartItems: [] };

    case 'INCREASE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item?.item?._id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };

    default:
      return state;
  }
};

// Create Context
export const CartContext = createContext<{
  cartState: CartState;
  addToCart: (item: any) => void;
  removeSingleItem: (id: string) => void;
  removeAllItems: () => void;
  increaseQuantity: (id: string) => void;
  addAllToCart: (item: any) => any;
  getCartLength: () => any;
}>({
  cartState: initialState,
  addToCart: () => {},
  removeSingleItem: () => {},
  removeAllItems: () => {},
  increaseQuantity: () => {},
  getCartLength: () => {},
  addAllToCart: () => {},
});

// Context Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartState, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthorized } = useUI();
  const [update, setUpdate] = useState<boolean | any>(false);
  const [isToken, setIsToken] = useState<boolean | any>(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(stored) });
      }
    }
  }, []);

  // Function to fetch cart items from API
  const fetchCartItems = async () => {
    try {
      const response = await getAllCartItems();
      if (response.items.length > 0) {
        dispatch({ type: 'ADD_ALL_TO_CART', payload: response.items });
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(response.items));
        }
      } else {
        dispatch({ type: 'ADD_ALL_TO_CART', payload: [] });
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  // Check for token when component mounts or user logs in
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsToken(true);
    } else {
      setIsToken(false);
    }
  }, [isAuthorized]); // Runs immediately when user logs in

  // Call fetchCartItems IMMEDIATELY if user is authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchCartItems();
    } else {
      dispatch({ type: 'ADD_ALL_TO_CART', payload: [] });
    }
  }, [isAuthorized]); // Runs immediately after login

  // Persist cart to localStorage on state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartState.cartItems));
    }
  }, [cartState]);

  // Actions
  const addToCart = (item: CartItem) =>
    dispatch({ type: 'ADD_TO_CART', payload: item });
  const removeSingleItem = (id: string) =>
    dispatch({ type: 'REMOVE_SINGLE_ITEM', payload: id });
  const removeAllItems = () => dispatch({ type: 'REMOVE_ALL_ITEMS' });
  const increaseQuantity = (id: string) =>
    dispatch({ type: 'INCREASE_QUANTITY', payload: id });
  const getCartLength = () => {
    return cartState.cartItems.length;
  };
  const addAllToCart = (items: CartItem[]) => {
    dispatch({ type: 'ADD_ALL_TO_CART', payload: items });
    // setUpdate(!update);
  };

  return (
    <CartContext.Provider
      value={{
        cartState,
        addToCart,
        removeSingleItem,
        removeAllItems,
        increaseQuantity,
        getCartLength,
        addAllToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
