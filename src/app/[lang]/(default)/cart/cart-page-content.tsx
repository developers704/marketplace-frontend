'use client';
import { useTranslation } from '@/app/i18n/client';
import AddToCartTable from '@/components/cart/add-to-cart-table';
import Breadcrumb from '@/components/ui/breadcrumb';
import Container from '@/components/ui/container';
import { useUI } from '@/contexts/ui.context';
import { getAllCartItems } from '@/framework/basic-rest/cart/use-cart';
import React, { useEffect, useState } from 'react';

const CartPageContent = ({ lang }: { lang: string }) => {
  const { t } = useTranslation(lang, 'cart');
  const { isAuthorized } = useUI();
  const [allCart, setAllCart] = useState<any>();
  const [update, setUpdate] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllCartItems = async () => {
      const response = await getAllCartItems();
      // console.log(response, '====>>>> fetchAllCartItems');
      if (response.items) {
        setAllCart(response);
      }
    };
    if (isAuthorized) {
      fetchAllCartItems();
    } else {
      console.log('Login to get your cart');
    }
  }, [isAuthorized, update]);

  return (
    <Container>
      <section className="my-10 px-14">
        <div
          id="top"
          className="flex md:items-center md:justify-between md:flex-row flex-col gap-3 items-center"
        >
          <Breadcrumb lang={lang} />

          <div className="leftSide">
            <h1 className="md:text-3xl text-xl font-bold mb-3">
              {t('Add To Cart')}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4">
            {/* <Search
              searchId="product-search"
              className="hidden lg:flex lg:max-w-[650px] 2xl:max-w-[800px]"
              variant="fill"
              lang={lang}
            /> */}
          </div>
        </div>
        <div className="backContainer bg-[#f4f4f4] p-6 shadow-md">
          <AddToCartTable
            lang={lang}
            allCart={allCart}
            setUpdate={setUpdate}
            update={update}
          />
        </div>
      </section>
    </Container>
  );
};

export default CartPageContent;
