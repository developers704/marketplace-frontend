import isEmpty from 'lodash/isEmpty';
interface Item {
  id: string;
  name: string;
  sku: string;
  price: number;
  subTotal?: number;
  quantity: number | 1;
  image?: string;
}
interface Variation {
  id: string | number;
  title: string;
  price: number;
  sale_price?: number;
  quantity: number;
  [key: string]: unknown;
}
export function generateCartItem(
  item: any,
  quantity: number | any,
  selectedColor?: any,
) {
  // const { _id, name, sku, image, gallery, prices } = item;
  const price = item?.prices[0]?.amount;
  const imageCart = item?.gallery[0] || item?.image;
  const subTotal = price * quantity;

  // console.log(item, '===> item from utils');

  return {
    id: item?._id,
    name: item?.name,
    sku: item?.sku,
    price: item?.prices[0]?.amount,
    subTotal,
    quantity,
    itemType: item?.type !== undefined || null ? 'SpecialProduct' : 'Product',
    image: imageCart,
    color: selectedColor,
  };
}
