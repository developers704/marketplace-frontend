'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Button from '@components/ui/button';
import Counter from '@components/ui/counter';
import { useParams, usePathname } from 'next/navigation';
import useWindowSize from '@utils/use-window-size';
import { getVariations } from '@framework/utils/get-variations';
import { CartContext } from '@contexts/cart/cart.context';
import { generateCartItem } from '@utils/generate-cart-item';
import isEmpty from 'lodash/isEmpty';
import { toast } from 'react-toastify';
import ThumbnailCarousel from '@components/ui/carousel/thumbnail-carousel';
import Image from '@components/ui/image';
import isEqual from 'lodash/isEqual';
import { useTranslation } from 'src/app/i18n/client';
import { MdOutlineShoppingCart } from 'react-icons/md';
import DOMPurify from 'dompurify';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { useSpecialProductQuery } from '@/framework/basic-rest/specialProducts/specialProductsApi';
import Container from '@/components/ui/container';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { SingleSpecialProductSkeletons } from '@/components/ui/skeletons';
import { PermissionsContext } from '@/contexts/permissionsContext';

const SingleProductInvPage: React.FC<{
  lang: string;
  productId?: string;
  params?: any;
}> = ({ lang, productId }) => {
  const { t } = useTranslation(lang, 'common');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const params = useParams();
  // console.log(params, '====>>> params');
  const pathname = usePathname();
  const splitedPath = pathname.split('/');
  const { width } = useWindowSize();
  const { data, isLoading } = useSpecialProductQuery(params.item);
  console.log(data, '====>>> pppp');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [favorite, setFavorite] = useState<boolean>(false);
  const [quantity, setQuantity] = useState(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [variants, setVariants] = useState([]);
  const [groupedVariants, setGroupedVariants] = useState({});
  const [addToWishlistLoader, setAddToWishlistLoader] =
    useState<boolean>(false);
  const [shareButtonStatus, setShareButtonStatus] = useState<boolean>(false);
  const [userWarehouse, setUserWarehouse] = useState<any>();
  const { data: user, isLoading: userLoading } = useUserDataQuery();
  const {permissions} = useContext(PermissionsContext);
  const key = 'Cart';

  useEffect(() => {
    if (!userLoading && user) {
      setUserWarehouse(user?.warehouse?.name);
    }
  }, [user]);
  const {
    addToCart: addToCartContext,
    removeSingleItem,
    increaseQuantity,
    // getCartLength,
  } = useContext(CartContext);

  const handleChange = () => {
    setShareButtonStatus(!shareButtonStatus);
  };

  const handleStoreQty = () => {
    if (!userWarehouse) return null; // If no warehouse is selected, return null

    const storeInventory = data?.inventory?.find(
      (item: any) => item?.warehouse?.name === userWarehouse,
    );

    return storeInventory ? storeInventory?.quantity : 0; // Return quantity or 0 if not found
  };

  const getTotalQuantity = () => {
    return data?.inventory?.reduce((total: number, item: any) => {
      return total + (item?.quantity || 0);
    }, 0);
  };

  if (isLoading) return <SingleSpecialProductSkeletons />;

  const variations = getVariations(data?.variations);

  const isSelected = !isEmpty(variations)
    ? !isEmpty(attributes) &&
      Object.keys(variations).every((variation) =>
        attributes.hasOwnProperty(variation),
      )
    : true;
  let selectedVariation: any = {};
  if (isSelected) {
    const dataVaiOption: any = data?.variation_options;
    selectedVariation = dataVaiOption?.find((o: any) =>
      isEqual(
        o.options.map((v: any) => v.value).sort(),
        Object.values(attributes).sort(),
      ),
    );
  }

  const item = generateCartItem(data, selectedQuantity);

  async function addToCart() {
    // console.log(selectedQuantity, '===> selectedQuantity');
    // console.log(item, '===> cart items');
    if (item) {
      setAddToCartLoader(true);
      setTimeout(() => {
        setAddToCartLoader(false);
      }, 1500);
      const response = await addToCartApi(item);
      // console.log(response, '===> response');
      if (response.items.length > 0) {
        toast.success('Added to cart', {
          progressClassName: 'fancy-progress-bar',
          position: width! > 768 ? 'bottom-right' : 'top-right',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      addToCartContext({ item: { _id: item?.id } }); // ====>>> working
    } else {
      console.log('Item is not available');
      toast.warning('Something went wrong. Please try again.', {
        position: width! > 768 ? 'bottom-right' : 'top-right',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }

  function addToWishlist() {
    // to show btn feedback while product wishlist
    setAddToWishlistLoader(true);
    setFavorite(!favorite);
    const toastStatus: string =
      favorite === true ? t('text-remove-favorite') : t('text-added-favorite');
    setTimeout(() => {
      setAddToWishlistLoader(false);
    }, 1500);
    toast(toastStatus, {
      progressClassName: 'fancy-progress-bar',
      position: width! > 768 ? 'bottom-right' : 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  const safeHTML = DOMPurify.sanitize(data?.description);

  //   const groupedVariantsRes = groupVariantsByParent(data?.variants);

  //   console.log(groupedVariantsRes, '====>>>> groupedVariantsRes');

  return (
    <Container>
      <div className="pt-6 pb-2 md:pt-7">
        <div className="flex flex-col md:flex-row justify-between gap-7">
          <div className="col-span-5 flex-1 mb-6 overflow-hidden xl:col-span-6 md:mb-8 lg:mb-0 ">
            {data?.gallery?.length ? (
              <ThumbnailCarousel
                gallery={data?.gallery}
                thumbnailClassName="md:w-[350px] xl:w-[500px] 2xl:w-[700px]"
                galleryClassName="xl:w-[100px] 2xl:w-[120px]"
                lang={lang}
              />
            ) : (
              <div className="flex items-center justify-center w-auto">
                <Image
                  src={data?.gallery[0] || '/product-placeholder.svg'}
                  alt={data?.name!}
                  width={900}
                  height={680}
                  style={{ width: 'auto' }}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-start flex-1 col-span-5 shrink-0 xl:col-span-4 gap-[50px]">
            <div className="">
              <div className="">
                <h2 className="text-3xl font-bold !leading-[2.75rem] transition-colors duration-300 text-brand-dark md:text-xl xl:text-[40px] mb-2 capitalize">
                  {data?.name}
                </h2>
                <h1 className="text-brand-muted">SKU# {`${data?.sku}`}</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-brand-blue font-bold text-base md:text-xl xl:text-[32px]">
                $ {data?.prices[0].amount}
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-brand-dark font-bold text-lg">
                Description:
              </h1>
              <p>
                {/* Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                        Temporibus necessitatibus fugit quis deleniti quidem cumque,
                        commodi mollitia reprehenderit iste dolorem ab laboriosam est
                        asperiores id provident possimus pariatur fugiat delectus? */}
                {/* <div dangerouslySetInnerHTML={{ __html: safeHTML }} /> */}
                {data?.specialCategory?.description}
              </p>
            </div>

            <div className="space-y-2.5 md:space-y-3.5 flex flex-col lg:flex-row lg:items-center gap-4">
              <Counter
                variant="single"
                value={selectedQuantity}
                onIncrement={() => setSelectedQuantity((prev) => prev + 1)}
                onDecrement={() =>
                  setSelectedQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
                }
                lang={lang}
              />
              <Button
                onClick={addToCart}
                className="w-full lg:w-fit px-1.5 !mt-0 rounded-lg gap-2"
                disabled={!permissions[key]?.View}
                loading={addToCartLoader}
              >
                <MdOutlineShoppingCart className="text-lg" />
                {t('text-add-to-cart')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SingleProductInvPage;
