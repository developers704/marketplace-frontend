import ProductSingleDetails from '@/components/product/product';
import Container from '@/components/ui/container';
import React from 'react';
import SingleProductInvPage from './singleProductInvPage';

const page = ({ params }: any) => {
  const { lang, product } = params;
  return (
    <Container>
      {/* <ProductDetailPage data={'hello'} lang={lang} type={`SUPPLY`} /> */}
      <SingleProductInvPage lang={lang} />
    </Container>
  );
};

export default page;
