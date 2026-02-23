'use client';
import { useUpdateUserMutation } from '@/framework/basic-rest/customer/use-update-customer';
import { fetchProfileData, useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import React, { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';
import cn from 'classnames';

const PersonalInfo = () => {
  const { data: user } = useUserDataQuery();
  const [editBtn, setEditBtn] = useState(false);
  const [username, setUsername] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [city, setCity] = useState('');
  const [isDeactivated, setIsDeactivated] = useState<boolean | any>();
  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userData = await fetchProfileData();
      if (userData) {
        setUsername(userData?.username || '');
        setPhone_number(userData?.phone_number || '');
        setCity(userData?.city || '');
        setIsDeactivated(userData?.isDeactivated || false);
      }
    };
    fetchUserProfile();
  }, []);

  const OnSaveChanges = () => {
    const formdata = { username, phone_number, city, isDeactivated };
    setEditBtn(false);
    updateUser(formdata, {
      onSuccess: () => {
        Swal.fire({ icon: 'success', title: 'Updated!', timer: 1500 });
      },
      onError: (error: any) => {
        Swal.fire({ icon: 'error', title: 'Oops...', text: error.message, timer: 1500 });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-4 ">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937]">Personal Information</h1>

      {/* Profile Card */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-6 p-6 border-b border-gray-100">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
            {user?.profileImage ? (
              <img
                src={user?.profileImage}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FiUser className="text-gray-400 text-4xl md:text-5xl" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 capitalize">{user?.username || "-"}</h2>
            <span className="text-gray-500 capitalize">{user?.role?.role_name || "-"}</span>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 font-medium">Name</span>
            {editBtn ? (
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F2937] transition"
              />
            ) : (
              <span className="text-gray-700">{user?.username || "-"}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-gray-500 font-medium">Phone</span>
            {editBtn ? (
              <input
                type="number"
                value={phone_number}
                onChange={(e) => setPhone_number(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F2937] transition"
              />
            ) : (
              <span className="text-gray-700">+{user?.phone_number || "-"}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-gray-500 font-medium">Department</span>
            <span className="text-gray-700">{user?.department?.name || '-'}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-gray-500 font-medium">Status</span>
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-sm font-semibold',
                user?.isDeactivated ? 'bg-red-100 text-red-600 w-[100px]' : 'bg-green-100 w-[70px] text-green-600'
              )}
              onClick={() => setIsDeactivated(!isDeactivated)}
            >
              {user?.isDeactivated ? 'Deactivated' : 'Active'}
            </span>
          </div>

          {/* Stores */}
          <div className="col-span-full flex flex-col gap-2">
            <span className="text-gray-500 font-medium">Stores</span>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              {user?.warehouse?.length ? (
                user?.warehouse.map((w: any) => (
                  <span
                    key={w?._id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#1F2937] hover:text-white transition cursor-default"
                  >
                    {w?.name || "-"}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No stores available</span>
              )}
            </div>
          </div>
        </div>

        {/* {editBtn && (
          <div className="flex justify-end p-6 border-t border-gray-100 gap-4">
            <button
              onClick={() => setEditBtn(false)}
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={OnSaveChanges}
              className="px-6 py-2 rounded-lg bg-[#1F2937] text-white hover:bg-[#374151] transition font-semibold"
            >
              Save
            </button>
          </div>
        )} */}
      </div>

      {/* {!editBtn && (
        <button
          onClick={() => setEditBtn(true)}
          className="px-6 py-2 rounded-xl bg-[#0081FE] text-white hover:bg-[#0066CC] transition font-semibold self-start"
        >
          Edit Profile
        </button>
      )} */}
    </div>
  );
};

export default PersonalInfo;
