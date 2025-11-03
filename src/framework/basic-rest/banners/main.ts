import { useQuery } from '@tanstack/react-query';

interface Banner {
  _id: string;
  imageUrl: string;
  sortOrder: number;
  uploadedAt: string;
}

const fetchBanners = async () => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const [desktopResponse, mobileResponse] = await Promise.all([
    fetch(`${BASE_API}/api/slider/public`),
    fetch(`${BASE_API}/api/mobileSlider/public`),
  ]);

  const desktopData = await desktopResponse.json();
  const mobileData = await mobileResponse.json();
  
  return {
    desktop: desktopData,
    mobile: mobileData,
  };
};

export const useBannersQuery = () => {
  return useQuery<{ desktop: Banner[]; mobile: Banner[] }, Error>({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  });
};
