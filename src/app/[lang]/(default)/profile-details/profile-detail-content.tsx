'use client';
import Container from '@/components/ui/container';
import React, { useContext, useEffect, useState } from 'react';
import PersonalInfo from './personal-info';
import MyOrder from './my-order';
import MyWallet from './my-wallet';
import MyCourses from './my-courses';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumb from '@/components/ui/breadcrumb';
import { PermissionsContext } from '@/contexts/permissionsContext';
import PreventScreenCapture from '@/utils/PreventScreenShots';

const ProfileDetailContent = ({ lang }: { lang: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedOption = searchParams.get('option') || 'Personal Info'; // Default option

  const [selectedItem, setSelectedItem] = useState('Personal Info');
  const [warehouse, setWarehouse] = useState<any>();
  const { data: user, isLoading } = useUserDataQuery();
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart'; 
  // console.log(user, 'user warehouse');

  const options = [
    {
      id: 1,
      title: 'Personal Info',
    },
    {
      id: 3,
      title: 'My Order',
    },
    {
      id: 4,
      title: 'Store Wallet',
    },
    // {
    //   id: 5,
    //   title: 'My Course',
    // },
  ];

  const handleOptionClick = (title: string) => {
    router.push(`/${lang}/profile-details?option=${title}`);
  };

useEffect(() => {
  if (!isLoading) {
    const savedWarehouse = localStorage.getItem('selectedWarehouse');

    if (savedWarehouse) {
      try {
        const parsedWarehouse = JSON.parse(savedWarehouse);
        setWarehouse(parsedWarehouse);
      } catch (error) {
        console.error("Failed to parse saved warehouse:", error);
        setWarehouse(null);
      }
    } else {
      console.warn("No saved warehouse found in localStorage.");
      setWarehouse(null);
    }
  }
}, [isLoading]);

  // console.log(warehouse, 'warehouse');

  return (
    <Container>

      <section className="my-10">
        <div
          id="top"
          className="flex md:items-center md:justify-between md:flex-row flex-col gap-3 items-center"
        >
          <Breadcrumb lang={lang} />

          <div className="leftSide">
            <h1 className="md:text-3xl text-xl font-bold">
              {'Profile Details'}
            </h1>
          </div>
          <div className="rightSide flex items-center justify-center space-x-4"></div>
        </div>
        <div className="flex mt-10 justify-between">
          <div id="options" className="hidden lg:flex flex-1 h-full">
            <div className="p-5 flex flex-col w-full gap-4 ">
              {options.map((item) => {
                const isSelected = selectedOption === item?.title;
                return (
                  <div
                    className={`border-b-[1px] border-[#928982] p-2 font-bold cursor-pointer ${isSelected ? 'text-[#665f5b]' : 'text-[#928982]'} `}
                    onClick={() => handleOptionClick(item?.title)}
                  >
                    {item.title}
                  </div>
                );
              })}
            </div>
          </div>
          <div id="content" className="flex-[4] py-6 px-8">
            {selectedOption === 'Personal Info' ? (
              <PersonalInfo />
            ) : selectedOption === 'My Order' ? (
              <MyOrder />
            ) : selectedOption === 'Store Wallet' ? (
              <MyWallet warehouse={warehouse} />
            ) : selectedOption === 'My Course' ? (
              // <MyCourses />
              ''
            ) : (
              ''
            )}
          </div>
        </div>
      </section>
    </Container>
  );
};

export default ProfileDetailContent;
