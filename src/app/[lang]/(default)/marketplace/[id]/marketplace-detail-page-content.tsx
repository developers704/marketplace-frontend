'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Container from '@components/ui/container';
import VendorProductSingleDetails from '@components/product/vendor-product';

export default function MarketplaceDetailPageContent({
  lang,
  vendorProductId,
}: {
  lang: string;
  vendorProductId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get('returnUrl');
  const backHref = returnUrl ? decodeURIComponent(returnUrl) : `/${lang}/marketplace`;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          Back to listing
        </button>
      </div>
      <VendorProductSingleDetails lang={lang} vendorProductId={vendorProductId} enableB2BPurchase />
    </Container>
  );
}


