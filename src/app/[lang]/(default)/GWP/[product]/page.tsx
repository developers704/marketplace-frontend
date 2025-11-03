import Container from '@/components/ui/container';
import React from 'react';
import SingleProductPackPage from './singleProductInvPage';

const page = ({ params }: any) => {
  const { lang, product } = params;
  return (
    <Container>
      <SingleProductPackPage lang={lang} />
    </Container>
  );
};

export default page;
