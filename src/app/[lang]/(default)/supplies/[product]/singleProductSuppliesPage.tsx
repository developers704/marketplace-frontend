'use client';

import { useContext, useEffect, useState } from 'react';
import Button from '@components/ui/button';
import Counter from '@components/ui/counter';
import { useParams, usePathname, useRouter } from 'next/navigation';
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
import { ArrowLeft, ExternalLink, ShoppingBag, Globe } from 'lucide-react';
import DOMPurify from 'dompurify';
import {
  addToCartApi,
} from '@/framework/basic-rest/cart/use-cart';
import { useSpecialProductQuery } from '@/framework/basic-rest/specialProducts/specialProductsApi';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { SingleSpecialProductSkeletons } from '@/components/ui/skeletons';
import { PermissionsContext } from '@/contexts/permissionsContext';

const SingleProductSuppliesPage: React.FC<{
  lang: string;
  productId?: string;
  params?: any;
}> = ({ lang, productId }) => {
  const { t } = useTranslation(lang, 'common');
  const router = useRouter();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const params = useParams();
  const pathname = usePathname();
  const splitedPath = pathname.split('/');
  const { width } = useWindowSize();
  const { data, isLoading } = useSpecialProductQuery(params.product);
  // console.log(data, '====>>> pppp');
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
  const {
    addToCart: addToCartContext,
    // getCartLength,
  } = useContext(CartContext);
  const { permissions } = useContext(PermissionsContext);
  const key = `Cart`;

  const { data: user, isLoading: userLoading } = useUserDataQuery();

  useEffect(() => {
    if (!userLoading && user) {
      setUserWarehouse(user?.warehouse?.name);
    }
  }, [user]);

  const handleChange = () => {
    setShareButtonStatus(!shareButtonStatus);
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

  const safeHTML = DOMPurify.sanitize(data?.description);

  const handleBack = () => {
    router.push(`/${lang}/supplies`);
  };

  const price = data?.prices?.[0]?.amount || 0;
  const salePrice = data?.prices?.[0]?.salePrice;

  return (
    <div className="pt-6 pb-2 md:pt-7 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors mb-6 group"
      >
        <ArrowLeft 
          size={20} 
          className="group-hover:-translate-x-1 transition-transform duration-200" 
        />
        <span className="text-sm font-medium">Back to Products</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between gap-7">
        <div className="col-span-5 flex-1 mb-6 overflow-hidden xl:col-span-6 md:mb-8 lg:mb-0 animate-in slide-in-from-left duration-500">
          {data?.gallery?.length ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <ThumbnailCarousel
                gallery={data?.gallery}
                thumbnailClassName="md:w-[350px] xl:w-[500px] 2xl:w-[700px]"
                galleryClassName="xl:w-[100px] 2xl:w-[120px]"
                lang={lang}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-auto bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Image
                src={data?.image || data?.gallery?.[0] || '/product-placeholder.svg'}
                alt={data?.name!}
                width={900}
                height={680}
                style={{ width: 'auto' }}
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-start flex-1 col-span-5 shrink-0 xl:col-span-4 gap-6 animate-in slide-in-from-right duration-500">
          {/* Product Header */}
          <div className="space-y-3">
            {/* Category Badge */}
            {data?.specialCategory?.name && (
              <div className="inline-block">
                <span className="text-sm font-semibold text-brand-blue bg-blue-50 px-3 py-1.5 rounded-full">
                  {data.specialCategory.name}
                </span>
              </div>
            )}
            
            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              {data?.name}
            </h1>
            
            {/* SKU */}
            <p className="text-sm text-gray-500">SKU: {data?.sku}</p>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-4 py-4 border-y border-gray-200">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-bold text-brand-blue">
                ${price.toFixed(2)}
              </span>
              {salePrice && salePrice < price && (
                <span className="text-2xl text-gray-400 line-through">
                  ${salePrice.toFixed(2)}
                </span>
              )}
            </div>
            {salePrice && salePrice < price && (
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Save ${(price - salePrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {data?.stock !== undefined && (
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
                data.stock > 0 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-red-700 bg-red-50'
              }`}>
                {data.stock > 0 ? `In Stock (${data.stock} available)` : 'Out of Stock'}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
            <div 
              className="text-gray-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: safeHTML }} 
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <Counter
                  variant="single"
                  value={selectedQuantity}
                  onIncrement={() => setSelectedQuantity((prev) => prev + 1)}
                  onDecrement={() =>
                    setSelectedQuantity((prev) => (prev !== 1 ? prev - 1 : 1))
                  }
                  lang={lang}
                />
              </div>
            <Button
              onClick={addToCart}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-xl gap-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={!permissions[key]?.View || (data?.stock !== undefined && data.stock === 0)}
              loading={addToCartLoader}
            >
              <MdOutlineShoppingCart className="text-xl" />
              {addToCartLoader ? 'Adding to Cart...' : t('text-add-to-cart')}
            </Button>
            </div>
            
          </div>

          {/* Additional Info */}
          {data?.specialCategory && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Category:</span>{' '}
                <span className="text-brand-blue font-medium">{data.specialCategory.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Links Section */}
      {data?.links && data.links.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-brand-blue" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Available on Other Platforms</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Compare prices and purchase from these trusted platforms
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.links.map((linkItem: any, index: number) => (
              <a
                key={index}
                href={linkItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-5 hover:border-brand-blue hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center group-hover:bg-brand-blue transition-colors">
                      <ShoppingBag className="text-brand-blue" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-blue transition-colors">
                        {linkItem.siteName || 'External Link'}
                      </h3>
                    </div>
                  </div>
                  <ExternalLink className="text-gray-400 group-hover:text-brand-blue transition-colors" size={18} />
                </div>
                
                {linkItem.price && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Price on {linkItem.siteName}:</p>
                    <p className="text-xl font-bold text-brand-blue">
                      ${parseFloat(linkItem.price).toFixed(2)}
                    </p>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ExternalLink size={12} />
                    Visit Store
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Product Details Section - Additional Information */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Information Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Product Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">SKU</span>
              <span className="text-sm font-semibold text-gray-900">{data?.sku || 'N/A'}</span>
            </div>
            {data?.type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-semibold text-gray-900 capitalize">{data.type}</span>
              </div>
            )}
            {data?.unitSize && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Unit Size</span>
                <span className="text-sm font-semibold text-gray-900">{data.unitSize}</span>
              </div>
            )}
            {data?.specialCategory && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Category</span>
                <span className="text-sm font-semibold text-brand-blue">{data.specialCategory.name}</span>
              </div>
            )}
            {data?.status && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  data.status === 'active' 
                    ? 'text-green-700 bg-green-50' 
                    : 'text-gray-700 bg-gray-50'
                }`}>
                  {data.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Details</h3>
          <div className="space-y-3">
            {data?.prices?.map((priceItem: any, index: number) => (
              <div key={index} className="space-y-2">
                {priceItem.city && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">City</span>
                    <span className="text-sm font-semibold text-gray-900">{priceItem.city.name || 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Regular Price</span>
                  <span className="text-sm font-semibold text-gray-900">${priceItem.amount?.toFixed(2) || '0.00'}</span>
                </div>
                {priceItem.buyPrice && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Buy Price</span>
                    <span className="text-sm font-semibold text-gray-900">${priceItem.buyPrice.toFixed(2)}</span>
                  </div>
                )}
                {priceItem.salePrice && priceItem.salePrice > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Sale Price</span>
                    <span className="text-sm font-semibold text-green-600">${priceItem.salePrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleProductSuppliesPage;
