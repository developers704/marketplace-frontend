'use client';

import Container from '@components/ui/container';
import VendorProductSingleDetails from '@components/product/vendor-product';

export default function MarketplaceDetailPageContent({
  lang,
  vendorProductId,
}: {
  lang: string;
  vendorProductId: string;
}) {
  return (
    <Container>
      <VendorProductSingleDetails lang={lang} vendorProductId={vendorProductId} enableB2BPurchase />
    </Container>
  );
}


