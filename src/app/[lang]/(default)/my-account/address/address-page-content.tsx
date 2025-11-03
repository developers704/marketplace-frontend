'use client';

import AddressGrid from '@components/address/address-grid';
import LoadingComp from '@components/common/loading';
import { useAddressQuery } from '@framework/address/address';

export default function AddressPageContent({ lang }: { lang: string }) {
  let { data, isLoading } = useAddressQuery();
  console.log('data in content ', data);

  return (
    <>
      {!isLoading ? (
        <AddressGrid address={data} lang={lang} />
      ) : (
        <LoadingComp />
      )}
    </>
  );
}
