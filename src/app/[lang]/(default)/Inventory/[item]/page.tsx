import Container from '@/components/ui/container';
import React from 'react';
import SingleProductInvPage from './singleProductInvPage';

const page = ({ params }: any) => {
  const { lang, product } = params;
  return (
    <Container>
      <SingleProductInvPage lang={lang} />
    </Container>
  );
};

export default page;
