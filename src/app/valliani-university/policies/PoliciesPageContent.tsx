'use client';
import SearchBar from '@/components/university/UniversitySearchBar';
import PolicyModal from '@/components/policies/PolicyModal';
import {
  fetchAllUniversityPolicy,
  useAllUniversityPolicyDataQuery,
} from '@/framework/basic-rest/university/dashboardApi';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
const PolicyCard = ({ data, onOpen }: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API as string;
  return (
    <div
      onClick={() => onOpen(data)}
      className="bg-white rounded-2xl shadow-sm border p-2 border-gray-200 overflow-hidden max-w-sm mb-4 hover:border-brand-blue cursor-pointer transition-all duration-200 hover:shadow-lg"
    >
      {/* Policy Image */}
      <div className="relative rounded-2xl w-full h-[150px]">
        <Image
          src={`${BASE_API}/${data?.picture}`}
          alt={data?.title}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      {/* Policy Content */}
      <div className="p-4">
        {/* Policy Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {data?.title}
        </h3>
        {/* Policy Badge */}
        <div className="flex items-center gap-2 mt-2">
          {data?.isSigned && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Signed
            </span>
          )}
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
            {data?.policyType}
          </span>
        </div>
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

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const [policies, setPolicies] = useState<any>();
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
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
    setIsLoadingPolicies(true);
    try {
      const res = await fetchAllUniversityPolicy(roleId, warehouseId, customerId);
      console.log(res, 'data policy');
      setPolicies(res?.data?.allPolicies);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    if (!userLoading && userData) {
      getPolicies(userData?.role?._id, userData?.warehouse?._id, userData?._id);
    }
  }, [userLoading, userData]);

  const handlePolicyOpen = (policy: any) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

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
        {isLoadingPolicies ? (
          // Skeleton Loader
          Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-sm mb-4 animate-pulse"
            >
              <div className="relative rounded-2xl w-full h-[150px] bg-gray-300" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-gray-300 rounded-full w-16" />
                  <div className="h-6 bg-gray-300 rounded-full w-20" />
                </div>
              </div>
            </div>
          ))
        ) : (
          // Actual Policy Cards
          policies?.map((item: any, index: any) => {
            return (
              <div key={`${item}-${index}`}>
                <PolicyCard data={item} onOpen={handlePolicyOpen} />
              </div>
            );
          })
        )}
      </div>
      
      {/* Policy Modal */}
      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        policy={selectedPolicy}
        baseApi={BASE_API as string}
      />
    </div>
  );
};

export default PoliciesPageContent;
