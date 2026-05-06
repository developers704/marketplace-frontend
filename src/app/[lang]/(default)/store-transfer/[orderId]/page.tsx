import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: { lang: string; orderId: string };
}) {
  redirect(`/${params.lang}/special-order/store-transfer/${params.orderId}`);
}
