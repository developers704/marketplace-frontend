import Image from '@components/ui/image';
import { getImageUrl } from '@/lib/utils';

// : React.FC<{ item?: Item }>
export const CheckoutItem = ({ item }: any) => {
  // const { price } = usePrice({
  //   amount: item.itemTotal,
  //   currencyCode: 'USD',
  // });

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  console.log(item, 'checkout item');

  return (
    <div className="flex items-center py-4 my-4">
      <div className="flex-1 w-full flex items-center gap-4">
        <Image
          src={getImageUrl(
            BASE_API as string,
            item?.item?.image || item?.item?.gallery[0],
            `/assets/images/products/item1.png`,
          )}
          alt="product"
          width={80}
          height={80}
          objectFit="contain"
        />
        <div className="flex flex-col">
          <span className="font-bold capitalize text-[20px]">
            {item?.item?.name}
          </span>
          {/* text-brand-mute */}
          <p className="text-[14px] text-brand-muted">SKU: {item?.item?.sku}</p>
          {item?.color && (
            <p className="text-[14px] text-brand-muted">
              Color: {item?.color || 'N/A'}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 w-full text-center text-[20px]">
        $ {item?.price}
      </div>
      <div className="flex-1 w-full text-center flex items-center justify-center text-[20px]">
        {item?.quantity}
      </div>
      <div className="flex-1 w-full text-center text-[20px]">
        $ {item?.price * item?.quantity}
      </div>
    </div>
  );
};
