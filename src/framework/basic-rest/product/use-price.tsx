import { useMemo } from 'react';

export function formatPrice({
  amount,
  currencyCode,
  locale,
}: {
  amount: any;
  currencyCode: any;
  locale: any;
}) {
  const formatCurrency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  });

  if (currencyCode === 'PKR') {
    return `Rs. ${formatCurrency.format(amount).replace('PKR', '').trim()}`;
  }
  return formatCurrency.format(amount);
}

export function formatVariantPrice({
  amount,
  baseAmount,
  currencyCode,
  locale,
}: {
  baseAmount: any;
  amount: any;
  currencyCode: any;
  locale: any;
}) {
  const hasDiscount = baseAmount > amount;
  const formatDiscount = new Intl.NumberFormat(locale, { style: 'percent' });
  const discount = hasDiscount
    ? formatDiscount.format((baseAmount - amount) / baseAmount)
    : null;

  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
    ? formatPrice({ amount: baseAmount, currencyCode, locale })
    : null;

  return { price, basePrice, discount };
}

export default function usePrice(
  data?: {
    amount: any;
    baseAmount?: any;
    currencyCode: any;
  } | null,
) {
  const { amount, baseAmount, currencyCode } = data ?? {};
  const locale = 'en';
  const value = useMemo(() => {
    if (typeof amount !== 'number' || !currencyCode) return '';

    return baseAmount
      ? formatVariantPrice({ amount, baseAmount, currencyCode, locale })
      : formatPrice({ amount, currencyCode, locale });
  }, [amount, baseAmount, currencyCode]);

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}
