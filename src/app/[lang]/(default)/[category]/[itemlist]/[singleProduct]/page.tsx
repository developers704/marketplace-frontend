import ProductSingleDetails from '@/components/product/product';
import Container from '@/components/ui/container';
import React from 'react';

const page = ({ params, searchParams }: any) => {
  const { lang, singleProduct } = params;
  // console.log(searchParams.id);
  return (
    <Container>
      {/* <ProductDetailPage data={'hello'} lang={lang} type={`SUPPLY`} /> */}
      <ProductSingleDetails
        productId={searchParams?.id}
        lang={lang}
        type="JEWELRY"
      />
    </Container>
  );
};

export default page;
