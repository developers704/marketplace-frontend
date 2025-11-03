import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getToken } from '../utils/get-token';
import Swal from 'sweetalert2';

// const { isAuthorized } = useUI(); /api/courses/682da338267be9430a4cf098/chapters
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

export const fetchCustomerCourses = async () => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/courses/customer-courses`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const fetchGraphDetails = async (period: string) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/navigation/dashboard?period=${period || 'daily'}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const fetchRightSidebarData = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${BASE_API}/api/navigation/sidebar`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const fetchCourseChapters = async (courseId: string) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/courses/${courseId}/chapters`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // console.log(response, "sssd")

    // if(response.data.chapters.length === 0) {
    //   throw new Error("No chapters found for this course");
    // }

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const fetchSectionsData = async (
  courseId: string,
  sectionId: string,
) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/courses/${courseId}/section/${sectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const videoProgress = async (
  courseId: string,
  chapterId: string,
  sectionId: string,
  contentId: string,
  data: any,
) => {
  const token = getToken();
  const payload = {
    watchedDuration: data.watchedDuration,
    completed: data.completed,
  };
  try {
    const response = await axios.post(
      `${BASE_API}/api/navigation/${courseId}/chapters/${chapterId}/sections/${sectionId}/content/${contentId}/progress`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: errorMessage,
    });
    // throw new Error(errorMessage);
  }
};

export const toggleVideoReactions = async (
  courseId: string,
  chapterId: string,
  sectionId: string,
  contentId: string,
  reaction: any,
) => {
  const token = getToken();
  const payload = {
    reaction: reaction,
  };
  try {
    const response = await axios.post(
      `${BASE_API}/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}/content/${contentId}/toggle-reaction`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: errorMessage,
    });
    // throw new Error(errorMessage);
  }
};

export const submitQuizApi = async (quizId: string, payload: any) => {
  const token = getToken();
  try {
    const response = await axios.post(
      `${BASE_API}/api/quiz/${quizId}/submit`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchShortCoursesData = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${BASE_API}/api/short`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchCourseProgress = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${BASE_API}/api/courses/progress`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchAboutUs = async () => {
  const token = getToken();
  try {
    const response = await axios.get(`${BASE_API}/api/aboutus`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const requestCertificate = async (
  courseId: string,
  userSignature: any,
) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('userSignature', userSignature);
  // formData.append('username', username);
  formData.append('courseId', courseId);

  try {
    const response = await axios.post(
      `${BASE_API}/api/certificate/request`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchUniversityPolicy = async (
  roleId: string,
  warehouseId: string,
  customerId: string,
) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/policy/applicable/priority/${roleId}/${warehouseId}?customerId=${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchAllUniversityPolicy = async (
  roleId: string,
  warehouseId: string,
  customerId: string,
) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/policy/user/${customerId}?roleId=${roleId}&warehouseId=${warehouseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const signPolicy = async (policyId: string, signedDocument: any) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('policyId', policyId);
  // formData.append('username', username);
  formData.append('signedDocument', signedDocument);

  try {
    const response = await axios.post(
      `${BASE_API}/api/policy-acceptance/accept`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const fetchUserCertificate = async (courseId: string) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/certificate/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const searchQuery = async (query: string) => {
  const token = getToken();
  try {
    const response = await axios.get(
      `${BASE_API}/api/courses/searchCourse?query=${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    console.log(errorMessage, 'errorMessage');
    // throw new Error(errorMessage);
  }
};

export const useGetCustomerCoursesQuery = () => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Customer-Courses'],
    queryFn: fetchCustomerCourses,
  });
};

export const useGetGraphDataQuery = (option: any) => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Graph-Data'],
    queryFn: () => fetchGraphDetails(option),
  });
};

export const useGetRightSidebarDataQuery = () => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Right-Sidebar-Data'],
    queryFn: fetchRightSidebarData,
  });
};

export const useGetCourseChaptersDataQuery = (option: any) => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Course-Chapters'],
    queryFn: () => fetchCourseChapters(option),
  });
};

export const useGetSectionsDataQuery = (
  courseId: string,
  sectionId: string,
) => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Sections-Data', courseId, sectionId],
    queryFn: () => fetchSectionsData(courseId, sectionId),
  });
};

export const useGetShortCoursesQuery = () => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Short-Courses'],
    queryFn: fetchShortCoursesData,
  });
};

export const useGetCourseProgressQuery = () => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['Course-Progress'],
    queryFn: fetchCourseProgress,
  });
};

export const useUniversityPolicyDataQuery = (
  roleId: string,
  warehouseId: string,
  customerId: string,
) => {
  return useQuery<any, Error>({
    queryKey: ['Policy'],
    queryFn: () => fetchUniversityPolicy(roleId, warehouseId, customerId),
  });
};

export const useAllUniversityPolicyDataQuery = (
  roleId: string,
  warehouseId: string,
  customerId: string,
) => {
  return useQuery<any, Error>({
    queryKey: ['Policy'],
    queryFn: () => fetchAllUniversityPolicy(roleId, warehouseId, customerId),
  });
};
