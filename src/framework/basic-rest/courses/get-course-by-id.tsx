import { useQuery } from '@tanstack/react-query';
import http from '../utils/http';
import { getToken } from '../utils/get-token';

export const fetchCourse = async (courseId: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  try {
    const response = await fetch(`${BASE_API}/api/courses/${courseId}`, {
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

export const fetchCourseAndEnrollUser = async (
  courseId?: string,
  videoId?: string,
) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken(); // Assuming getToken() retrieves the token from localStorage, cookies, or elsewhere
  console.log(token, '===>>> token');

  //   try {
  //     const response = await http.get(
  //       `${BASE_API}/api/${courseId}/videos/${videoId}`,
  //     );

  //     console.log(response, '===>>> response from server');
  //     // if (!response.ok) {
  //     //   throw new Error('Failed to fetch products');
  //     // }

  //     // const data = await response.json();
  //     // console.log(data, '===>>> courses data');
  //     return response;
  //   } catch (error) {
  //     console.error('Error fetching category products:', error);
  //     throw error;
  //   }
};

export const useGetCourseQuery = (courseId: any) => {
  return useQuery<any>({
    queryKey: ['Get-All-Courses', courseId],
    queryFn: () => fetchCourse(courseId),
  });
};
