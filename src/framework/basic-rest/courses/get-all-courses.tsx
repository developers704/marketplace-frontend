import { useQuery } from '@tanstack/react-query';

export const fetchAllCourses = async () => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  try {
    const response = await fetch(`${BASE_API}/api/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    // console.log(data, '===>>> courses data');
    return data;
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};

export const useGetAllCoursesQuery = () => {
  return useQuery<any>({
    queryKey: ['Get-All-Courses'],
    queryFn: () => fetchAllCourses(),
  });
};
