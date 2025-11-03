import Container from '@components/ui/container';
// import DownloadAppsTwo from '@components/common/download-apps-two';
import { Metadata } from 'next';
import ProductsCategory from '@/components/category/products-category';
import NewlyAddedProduct from '@/components/product/feeds/newly-added-products';
import PrivacyPolicyModal from '@/components/common/modal/PrivacyModal';
// import { useCategoriesQuery } from '@/framework/basic-rest/category/get-all-categories';

export const metadata: Metadata = {
  title: 'Valliani  | Home',
};

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  // const { data, isLoading, error } = useCategoriesQuery({ limit: 2 });

  return (
    <>
      <PrivacyPolicyModal />
      <Container>
        <ProductsCategory lang={lang} />
        <div className="w-full h-[2px] bg-gray-400 my-5"></div>
        <NewlyAddedProduct lang={lang} />
      </Container>
      {/* <DownloadAppsTwo lang={lang} /> */}
    </>
  );
}
