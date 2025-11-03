'use client';
import { useUpdateUserMutation } from '@/framework/basic-rest/customer/use-update-customer';
import {
  fetchProfileData,
  useUserDataQuery,
} from '@/framework/basic-rest/user-data/use-user-data';
import React, { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';
// #0081FE

const PersonalInfo = () => {
  const { data: user, isLoading } = useUserDataQuery();
  // console.log(user, '===>>> user from query');

  const [editBtn, setEditBtn] = useState(false);
  const [username, setUsername] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [city, setCity] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [addressArray, setAddressArray] = useState<any>([]);
  const [addresses, setAddresses] = useState<any>();
  const [isDeactivated, setIsDeactivated] = useState<boolean | any>();
  const { mutate: updateUser, isPending } = useUpdateUserMutation();
  const [uploadedImage, setUploadedImage] = useState<any | null>(null);
  const [update, setUpdate] = useState<any>(false);
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  // Update state when user data is fetched
  useEffect(() => {
    // fetchProfileData();

    const fetchUserProfile = async () => {
      try {
        const user = await fetchProfileData();
        console.log(user, '===>>> userProfile');

        if (user) {
          setUsername(user.username || '');
          setPhone_number(user.phone_number || '');
          setCity(user.city || '');
          setProfileImage(user.profileImage || '');
          setAddresses(user.addresses?.[0] || '');
          setIsDeactivated(user.isDeactivated || false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, [update]);

  const editBtnHandler = () => {
    // console.log('editBtnHandler');
    setEditBtn(true);
  };

  const OnSaveChanges = () => {
    const formdata = {
      username,
      phone_number,
      city,
      profileImage: uploadedImage || '',

      addresses: addressArray.length > 0 ? addressArray : [],
      isDeactivated,
    };
    console.log(formdata, '===>>> formdata');
    setEditBtn(false);
    updateUser(formdata, {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Profile updated successfully',
          timer: 1500,
          showConfirmButton: true,
        }).then(() => {
          setUpdate(!update);
        });
        // fetchProfileData();
      },
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.message,
          timer: 1500,
          showConfirmButton: true,
        });
        console.error('Update error:', error);
      },
    });
  };

  const handleUploadImage = async (file: any) => {
    setUploadedImage(file);
  };

  return (
    <div>
      <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">
        Personal Information
      </h1>
      <div className="flex flex-col gap-4">
        <div id="profile" className="border rounded-xl border-[#ABAFB1] p-4">
          <div className="flex gap-4 items-center justify-between border-b py-3">
            <div className="flex items-center gap-4">
              {/* <Image
                // src={
                //   `${BASE_API}${profileImage}` ||
                //   `/assets/images/placeholderimg.jpeg`
                // }
                src={`https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=`}
                alt="Profile"
                className="border border-brand-dark rounded-full"
                width={70}
                height={70}
              /> */}
              <FiUser className="text-opacity-40 text-[40px]" />
              <div className="font-bold capitalize">
                {user?.username}{' '}
                <div className="font-normal text-brand-muted capitalize">
                  {user?.role.role_name}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-5 mt-4">
            <div className="flex items-center justify-between">
              <strong>Name:</strong>
              {editBtn ? (
                <input
                  type="text"
                  name="firstName"
                  className="border border-brand-dark rounded-lg px-4 py-2 w-fit"
                  placeholder="First Name"
                  defaultValue={user?.username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <p>{user?.username}</p>
              )}
              {/* <p>{user?.username}</p> */}
            </div>
            {/* <div className="flex items-center justify-between">
              <strong>Staff Id:</strong>
              <p>{user?.staffId || '-'}</p>
            </div> */}
            <div className="flex items-center justify-between">
              <strong>Postion/Role:</strong>
              <p>{user?.role.role_name}</p>
            </div>
            <div className="flex items-center justify-between">
              <strong>Department:</strong>
              <p>{user?.department?.name || '-'}</p>
            </div>
            <div className="flex items-center justify-between">
              <strong>Store:</strong>
              <p>
              {user?.warehouse?.length > 0
                ? user.warehouse.map((w: any, index: any) => (
                    <span key={w._id}>
                      {w.name}{index !== user.warehouse.length - 1 ? ', ' : ''}
                    </span>
                  ))
                : 'Store not available'}
            </p>
            </div>
            <div className="flex items-center justify-between">
              <strong>Status:</strong>
              {user?.isDeactivated ? (
                <p
                  className="text-red-500"
                  onClick={() => setIsDeactivated(false)}
                >
                  Deactivated
                </p>
              ) : (
                <p
                  className="text-green-500"
                  onClick={() => setIsDeactivated(true)}
                >
                  Active
                </p>
              )}
            </div>
          </div>
        </div>
        <div id="contact" className="border rounded-xl border-[#ABAFB1] p-4">
          <div className="flex gap-4 items-center justify-between border-b py-3">
            <h1 className="text-xl font-bold">Contact Info</h1>
            {/* <div className="text-[#0081FE]">
              <button onClick={editBtnHandler}>Edit</button>
            </div> */}
          </div>
          <div className="flex flex-col justify-between space-y-5 mt-4">
            <div className="flex items-center justify-between">
              <strong>Email:</strong>
              <p>{user?.email}</p>
            </div>
            <div className="flex items-center justify-between">
              <strong>Phone:</strong>
              {editBtn ? (
                <input
                  type="number"
                  name="phoneNumber"
                  className="border border-brand-dark rounded-lg px-4 py-2 w-fit"
                  placeholder="Phone Number"
                  defaultValue={user?.phone_number}
                  onChange={(e) => setPhone_number(e.target.value)}
                />
              ) : (
                <p>+{user?.phone_number}</p>
              )}
              {/* <p>+{user?.phone_number}</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
