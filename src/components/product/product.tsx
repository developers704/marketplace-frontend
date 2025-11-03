'use client';

import { useContext, useEffect, useState } from 'react';
import Button from '@components/ui/button';
import Counter from '@components/ui/counter';
import useWindowSize from '@utils/use-window-size';
import { useProductQuery } from '@framework/product/get-product';
import { getVariations } from '@framework/utils/get-variations';
import { CartContext } from '@contexts/cart/cart.context';
import { generateCartItem } from '@utils/generate-cart-item';
import isEmpty from 'lodash/isEmpty';
import { toast } from 'react-toastify';
import ThumbnailCarousel from '@components/ui/carousel/thumbnail-carousel';
import Image from '@components/ui/image';
import { IoAddOutline } from 'react-icons/io5';
import isEqual from 'lodash/isEqual';
import { useTranslation } from 'src/app/i18n/client';
import { MdOutlineShoppingCart } from 'react-icons/md';
import Ratings from '../reviews/ratings';
import DOMPurify from 'dompurify';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import ProductDetailsComp from './product-details/productDetailsComp';
import ProductsDetailAccordion from '../ui/productsDetailAccordion';
import { useWishlist } from '@/contexts/wishlistContext';
import { SingleSpecialProductSkeletons } from '../ui/skeletons';
import { usePathname } from 'next/navigation';
import Breadcrumb from '../ui/breadcrumb';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { FaRegHeart } from 'react-icons/fa';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
// import ReactImageMagnify from 'react-image-magnify';

export const ColorFilterCompBig = ({
  colorVariants,
  selectedColor,
  setSelectedColor,
}: any) => {
  // const [colorVariants, setColorVariants] = useState<any>([]);
  // const [selectedColor, setSelectedColor] = useState<any>('Y');

  // console.log(selectedColor, '===> selectedColor');

  return (
    <>
      {colorVariants.length > 0 ? (
        colorVariants?.map((item: any) => {
          const isSelected = selectedColor === item;
          return (
            <div
              className={`w-12 h-12 rounded-md flex justify-center capitalize border-[2px] items-center ${isSelected ? 'bg-black' : 'bg-white'}  ${isSelected ? 'text-white' : 'text-black'}  p-2 cursor-pointer`}
              onClick={() => setSelectedColor(item)}
            >
              <p className="">{item}</p>
            </div>
          );
        })
      ) : (
        <>
          {/* <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
            <p className="text-black">W</p>
            <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
          </div>

          <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
            <p className="text-black">Y</p>
            <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
          </div>

          <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
            <p className="text-black">R</p>
            <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
          </div> */}
        </>
      )}
    </>
  );
};

const ProductSingleDetails: React.FC<{
  lang: string;
  type?: 'JEWELRY' | 'SUPPLIES' | 'PACKAGING';
  productId?: string;
  params?: any;
}> = ({ lang, type, params, productId }) => {
  const { t } = useTranslation(lang, 'common');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  // const params = useParams();
  const pathname = usePathname();
  const splitedPath = pathname.split('/');
  // console.log(productId, '===> params');
  // console.log(splitedPath.includes('supplies'), '===> pathname');
  // const { product } = params;
  // console.log(product, "===>>> product")
  const { width } = useWindowSize();
  const { data, isLoading } = useProductQuery(productId as string);
  // console.log(data, '====>>> pppp');
  // const { addItemToCart, isInCart, getItemFromCart, isInStock } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [attributes, setAttributes] = useState<{ [key: string]: string }>({});
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [shareButtonStatus, setShareButtonStatus] = useState<boolean>(false);
  const {
    addToCart: addToCartContext,
    // getCartLength,
  } = useContext(CartContext);
  const { permissions } = useContext(PermissionsContext);
  const [colorVariants, setColorVariants] = useState<any>([]);
  const [selectedColor, setSelectedColor] = useState<any>('W');
  const [updateList, setUpdateList] = useState<boolean | any>(false);
  const [btnDisable, setBtnDisable] = useState<boolean | any>(false);
  const [wishlistBtnText, setWishlistBtnText] =
    useState<string>('Add to Wishlist');
  const key = 'Cart';

  const {
    wishlist: wishlistContext,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  // console.log(wishlistContext, '===> wishlistContext');

  const [isWishlist, setIsWishlist] = useState<boolean | any>(false);

  // const getColors = () => {
  //   const filterColors = data?.variants?.filter((item: any) => {
  //     return item?.variantName?.name === 'Color';
  //   });

  //   if (filterColors?.length > 0) {
  //     filterColors?.forEach((item: any) => {
  //       return setColorVariants((prev: any) => [...prev, item?.value[0]]);
  //     });
  //   }

  //   console.log(filterColors, '===>>> filterColors');
  // };

  const getColors = () => {
    const filterColors = data?.variants?.filter(
      (item: any) => item?.variantName?.name === 'Color',
    );

    if (filterColors?.length > 0) {
      // Get unique colors using Set
      const uniqueColors = new Set(
        filterColors.map((item: any) => item?.value[0]),
      );

      // Update state with unique values only
      setColorVariants(Array.from(uniqueColors));
    }

    // console.log(filterColors, '===>>> filterColors');
  };

  useEffect(() => {
    if (data) {
      getColors();
    }
  }, [data]);

  const handleChange = () => {
    setShareButtonStatus(!shareButtonStatus);
  };

  // console.log(data, '====>>> data');
  // console.log(selectedColor, '====>>> selectedColor');
  // console.log(wishlistContext, '====>>> wishlistContext data');

  useEffect(() => {
    if (wishlistContext?.length > 0) {
      const isInWishlist = wishlistContext?.some(
        (item: any) => item === data?._id,
      );
      setIsWishlist(isInWishlist);
      if (isInWishlist) {
        setWishlistBtnText('Added to Wishlist');
      } else {
        setWishlistBtnText('Add to Wishlist');
      }
      // setWishlist(wishlistContext)
    }
  }, [wishlistContext]);

  if (isLoading) return <SingleSpecialProductSkeletons />;

  const groupVariantsByParent = (variants: any) => {
    return variants?.reduce((acc: any, variant: any) => {
      const parentName = variant?.variantName?.parentVariant?.name;
      const variantName = variant?.variantName?.name;
      const value = variant?.value;

      if (!acc[parentName]) {
        acc[parentName] = [];
      }

      // acc[parentName].push(`${variantName}: ${value}`);
      acc[parentName].push([variantName, value]);

      return acc;
    }, {});
  };

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

  const item = generateCartItem(data, selectedQuantity, selectedColor);
  // const outOfStock = isInCart(item.id) && !isInStock(item.id);

  async function addToCart() {
    // console.log(selectedQuantity, '===> selectedQuantity  items');
    // console.log(selectedColor, '===> selectedColor items');
    // console.log(item, '===> cart items');
    if (item) {
      setAddToCartLoader(true);
      setTimeout(() => {
        setAddToCartLoader(false);
      }, 1500);
      const response = await addToCartApi(item);
      // console.log(response, '===> response');
      if (response.message === 'Error processing request') {
        toast.error('Please login to add item to cart', {
          // progressClassName: 'fancy-progress-bar',
          position: width! > 768 ? 'bottom-right' : 'top-right',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
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
      addToCartContext({
        item: { _id: item?.id },
        price: item?.price,
        quantity: item?.quantity,
      }); // ====>>> working
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

  const handleToggleWishlist = async ({
    productId,
    productType = 'regular',
  }: any) => {
    try {
      const isInWishlist = wishlistContext?.some(
        (item: any) => item === productId,
      );

      if (isInWishlist) {
        // Remove from wishlist
        const response = await deleteWishlistItem(productId);

        if (response.message === 'Product removed from wishlist') {
          toast.success(`Item removed from wishlist.`, {
            position: 'bottom-right',
          });
          removeFromWishlist(productId);
          setUpdateList(!updateList);
          setWishlistBtnText('Add To wishlist');
          setBtnDisable(false);
        } else {
          toast.error(`Something went wrong.`, { position: 'bottom-right' });
        }
      } else {
        // Add to wishlist

        const response = await addWishListItem(productId, productType);

        if (response.message === `Invalid token. Please log in again.`) {
          toast.error(`Please log in to add item to wishlist.`, {
            position: 'bottom-right',
          });

          return;
        } else if (response.message === 'Product added to wishlist') {
          toast.success(`Item added to wishlist.`, {
            position: 'bottom-right',
          });
          addToWishlist({ product: { _id: productId } });
          setWishlistBtnText('Added To wishlist');
          setBtnDisable(true);
          setUpdateList(!updateList);
        } else {
          toast.error(`Something went wrong.`, { position: 'bottom-right' }); // Revert state
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // toast.error(`Please log in to add item to wishlist.`, {
      //   position: 'top-right',
      // });
    }
  };

  const safeHTML = DOMPurify.sanitize(data?.description);

  const groupedVariantsRes = groupVariantsByParent(data?.variants);

  // console.log(groupedVariantsRes, '====>>>> groupedVariantsRes');

  const accordionData = [
    {
      id: 1,
      title: 'Overview',
      desc: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi, repellendus! Saepe animi sunt officia quaerat nulla atque quas beatae ullam quibusdam voluptatum eos optio enim, odit laudantium porro mollitia hic quos molestiae illo doloremque. Assumenda corporis tempora soluta molestias culpa consequuntur voluptate quis, deleniti rerum, modi veniam, quibusdam accusamus quas.',
      component: <div dangerouslySetInnerHTML={{ __html: safeHTML }} />,
    },
    {
      id: 2,
      title: 'Details',
      desc: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi, repellendus! Saepe animi sunt officia quaerat nulla atque quas beatae ullam quibusdam voluptatum eos optio enim, odit laudantium porro mollitia hic quos molestiae illo doloremque. Assumenda corporis tempora soluta molestias culpa consequuntur voluptate quis, deleniti rerum, modi veniam, quibusdam accusamus quas.',
      component: <ProductDetailsComp data={groupedVariantsRes} />,
    },
    {
      id: 1,
      title: 'Reviews',
      desc: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi, repellendus! Saepe animi sunt officia quaerat nulla atque quas beatae ullam quibusdam voluptatum eos optio enim, odit laudantium porro mollitia hic quos molestiae illo doloremque. Assumenda corporis tempora soluta molestias culpa consequuntur voluptate quis, deleniti rerum, modi veniam, quibusdam accusamus quas.',
      component: <Ratings productId={data?._id} />,
    },
  ];

  return (
    <div className="pt-[50px] pb-[50px] ">
      <div className="flex flex-col md:flex-row justify-between gap-7">
        <div className="my-3">{/* <Breadcrumb lang={lang} /> */}</div>

        <div className="col-span-5 mb-6 overflow-hidden xl:col-span-6 md:mb-8 lg:mb-0 flex-1">
          {data?.gallery?.length ? (
            <ThumbnailCarousel
              gallery={data?.gallery}
              thumbnailClassName="md:w-[350px] xl:w-[500px] 2xl:w-[700px]"
              galleryClassName="xl:w-[100px] 2xl:w-[120px]"
              lang={lang}
            />
          ) : (
            <div className="flex items-center justify-center w-auto">
              {/* <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: 'Wristwatch by Ted Baker London',
                    isFluidWidth: true,
                    src: data?.gallery[0] || '/product-placeholder.svg',
                    width: 900,
                    height: 680,
                  },
                  largeImage: {
                    src: data?.gallery[0] || '/product-placeholder.svg',
                    width: 1200,
                    height: 1800,
                  },
                }}
              /> */}
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold transition-colors duration-300 text-brand-dark md:text-xl xl:text-[40px] mb-2 capitalize !leading-[2.7rem]">
                  {data?.name}
                </h2>
                <h1 className="text-brand-muted">SKU# {`${data?.sku}`}</h1>
              </div>
              {/* <div>
                <FaHeart
                  className="cursor-pointer text-lg text-red-500"
                  // onClick={() => handleToggleWishlist({ productId: data?._id })}
                />
              </div> */}
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-brand-blue font-bold text-base md:text-xl xl:text-[32px]">
              $ {data?.prices[0].amount}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-brand-dark font-bold text-lg">Description:</h1>
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
          </div>

          <div className="flex flex-col">
            <h1 className="text-brand-dark font-bold text-lg mb-3">
              Color Variants:
            </h1>
            <div className="flex gap-2 group-hover:justify-end group-hover:items-end">
              <ColorFilterCompBig
                colorVariants={colorVariants}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            </div>
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
            <Button
              onClick={() => handleToggleWishlist({ productId: data?._id })}
              className="w-full lg:w-fit px-1.5 !mt-0 rounded-lg gap-2 bg-red-500 hover:!bg-red-600 hover:!text-white group"
              disabled={!permissions[key]?.View}
              loading={addToCartLoader}
            >
              {/* <MdOutlineShoppingCart className="text-lg" /> */}
              <FaRegHeart className="cursor-pointer text-lg text-white" />
              {wishlistBtnText}
            </Button>
            {type === 'PACKAGING' ? (
              <Button
                // onClick={addToCart}
                className="w-fit px-1.5 !mt-0 rounded-lg gap-2 bg-transparent !text-black !border-[1px] !border-black hover:bg-brand-button_color hover:!text-white group"
                // disabled={!isSelected}
                // loading={addToCartLoader}
              >
                <IoAddOutline className="text-lg !text-black group-hover:!text-white" />
                {t('Compare')}
              </Button>
            ) : type === 'JEWELRY' ? (
              // <Button
              //   onClick={addToWishlist}
              //   className="w-full lg:w-fit px-1.5 !mt-0 rounded-lg gap-2"
              //   // disabled={!isSelected}
              //   // loading={addToCartLoader}
              // >
              //   <FaRegHeart className="text-lg" />
              //   {t('Add to wishlist')}
              // </Button>
              ''
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      {type === 'JEWELRY' && (
        <>
          <div id="productDetailContainer" className="mt-10">
            <div className="accordionContainer">
              {accordionData?.map((item, index) => (
                <ProductsDetailAccordion
                  key={`${item.title}-${index}`}
                  item={item}
                  translatorNS="faq"
                  lang={lang}
                />
              ))}
            </div>
          </div>

          {/* <div className="mt-10">
            <MoreLikeProducts lang={lang} />
          </div> */}
        </>
      )}

      {/* <ProductDetailsTab lang={lang} /> */}
    </div>
    // <div>working</div>
  );
};

export default ProductSingleDetails;
