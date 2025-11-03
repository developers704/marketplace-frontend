'use client';
import SearchBar from '@/components/university/UniversitySearchBar';
import {
  fetchAllUniversityPolicy,
  useAllUniversityPolicyDataQuery,
} from '@/framework/basic-rest/university/dashboardApi';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const PolicyCard = ({ data }: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-2 border-gray-200 overflow-hidden max-w-sm mb-4 hover:border-brand-blue hover:shadow-md cursor-pointer">
      {/* Course Image */}
      <div className="relative rounded-2xl w-full h-[150px]">
        <Image
          src={`${BASE_API}/${data?.picture}`}
          alt={'image'}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      {/* Course Content */}
      <div className="p-4">
        {/* Course Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {data?.title}
        </h3>
      </div>
    </div>
  );
};

const PoliciesPageContent = () => {
  const mockFetchSuggestions = async (query: string): Promise<string[]> => {
    const fakeData = [
      'Math Basics',
      'Math Advanced',
      'Marketing',
      'Machine Learning',
    ];
    return fakeData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const [policies, setPolicies] = useState<any>();
  const { data: userData, isLoading: userLoading } = useUserDataQuery();

  // const { data, isLoading, error, refetch } = useAllUniversityPolicyDataQuery(
  //   userData?._id,
  // );
  // console.log(data, 'data policy');
  console.log(userData, 'data userData');

  const getPolicies = async (
    roleId: string,
    warehouseId: string,
    customerId: string,
  ) => {
    const res = await fetchAllUniversityPolicy(roleId, warehouseId, customerId);
    console.log(res, 'data policy');
    setPolicies(res?.data?.allPolicies);
  };

  useEffect(() => {
    if (!userLoading && userData) {
      getPolicies(userData?.role?._id, userData?.warehouse?._id, userData?._id);
    }
  }, [userLoading, userData]);

  if (userLoading) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Policies
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {policies?.map((item: any, index: any) => {
          return (
            <div key={`${item}-${index}`}>
              <PolicyCard data={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoliciesPageContent;
