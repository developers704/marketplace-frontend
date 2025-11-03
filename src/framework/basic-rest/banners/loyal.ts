import { useQuery } from '@tanstack/react-query';

interface Banner {
  _id: string;
  imageUrl: string;
  sortOrder: number;
  uploadedAt: string;
}

const fetchloyalBanners = async () => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(`${BASE_API}/api/loyaltyBanners/public`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
};

export const useBannersLoyalQuery = () => {
  return useQuery<Banner[], Error>({
    queryKey: ['banners-loyal'],
    queryFn: fetchloyalBanners,
  });
};
