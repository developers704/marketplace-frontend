import Container from '@components/ui/container';
import ProductDetailsRouter from '@components/product/product-details-router';
import DownloadApps from '@components/common/download-apps';
import PopcornJerkyProductFeed from '@components/product/feeds/popcorn-jerky-product-feed';
import RelatedProductFeed from '@components/product/feeds/related-product-feed';
import Breadcrumb from '@components/ui/breadcrumb';
import Divider from '@components/ui/divider';

export default async function Page({
  params: { lang },
}: {
  params: { 
    lang: string;
  };
}) {
  return (
    <>
      <Divider />
      <div className="pt-6 lg:pt-7">
        <Container>
          <Breadcrumb lang={lang} />
          <ProductDetailsRouter lang={lang} />
        </Container>
      </div>

      <RelatedProductFeed uniqueKey="related-products" lang={lang} />
      {/* <PopcornJerkyProductFeed lang={lang} />
      <DownloadApps lang={lang} /> */}
    </>
  );
}
