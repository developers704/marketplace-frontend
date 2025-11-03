'use clients'
import CartIcon from '@components/icons/cart-icon';
// import { useCart } from '@contexts/cart/cart.context';
import { useUI } from '@contexts/ui.context';
import { useTranslation } from 'src/app/i18n/client';
import cn from 'classnames';
import { FiShoppingCart } from 'react-icons/fi';
import { useContext } from 'react';
import { CartContext } from '@/contexts/cart/cart.context';

type CartButtonProps = {
  lang: string;
  className?: string;
  iconClassName?: string;
  hideLabel?: boolean;
  cartItemsLength?: any | 0;
  cartCounter?: any | 0;
  // isShowing?: boolean;
};

const CartButton: React.FC<CartButtonProps> = ({
  lang,
  className,
  cartItemsLength,
  iconClassName = 'text-brand-dark text-opacity-40',
  hideLabel,
  cartCounter,
  // isShowing,
}) => {
  const { t } = useTranslation(lang, 'common');
  const { openDrawer, setDrawerView } = useUI();
  // const { totalItems } = useCart();
  function handleCartOpen() {
    setDrawerView('CART_SIDEBAR');
    // isShowing;
    return openDrawer();
  }
  const {getCartLength} = useContext(CartContext);

  // console.log(getCartLength(), '===>>>> getCartLength');
  const count = getCartLength();

  return (
    <button
      className={cn(
        'flex items-center justify-center shrink-0 h-auto focus:outline-none transform',
        className,
      )}
      onClick={handleCartOpen}
      aria-label="cart-button"
    >
      <div className="relative flex items-center">
        {/* <CartIcon className={cn(iconClassName)} /> */}
        <FiShoppingCart className="w-[28px] h-[28px] text-brand-dark text-opacity-40" />
        <span className="min-w-[20px] min-h-[20px] p-0.5 rounded-[20px] flex items-center justify-center bg-red-600 text-brand-light absolute top-[10px] ltr:left-4 rtl:right-2 text-10px font-bold">
          {count || 0}
        </span>
      </div>
      {/* {!hideLabel && (
        <span className="text-sm font-normal lg:text-15px text-brand-dark ltr:ml-2 rtl:mr-2">
          {t('text-cart')}
        </span>
      )} */}
    </button>
  );
};

export default CartButton;
