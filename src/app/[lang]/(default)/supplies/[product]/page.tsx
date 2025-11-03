import ProductSingleDetails from '@/components/product/product';
import Container from '@/components/ui/container';
import React from 'react';
import SingleProductSuppliesPage from './singleProductSuppliesPage';

const page = ({ params }: any) => {
  const { lang, product } = params;
  return (
    <Container>
      {/* <ProductDetailPage data={'hello'} lang={lang} type={`SUPPLY`} /> */}
      <SingleProductSuppliesPage lang={lang} />
    </Container>
  );
};

export default page;
