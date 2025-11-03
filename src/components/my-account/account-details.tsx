'use client';
import Input from '@components/ui/form/input';
import PasswordInput from '@components/ui/form/password-input';
import Button from '@components/ui/button';
import Heading from '@components/ui/heading';
import { useForm, Controller } from 'react-hook-form';
import {
  useUpdateUserMutation,
  UpdateUserType,
} from '@framework/customer/use-update-customer';
import Switch from '@components/ui/switch';
import Text from '@components/ui/text';
import { useTranslation } from 'src/app/i18n/client';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import LoadingComp from '@components/common/loading';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDeactivateAccountMutation } from '@framework/customer/use-account-status';
import Swal from 'sweetalert2';
import UserAvatar from '../ui/user-avator';
import { useProfile } from '@/contexts/profileContext';

export interface CustomerProfile {
  otpCode: string | null;
  otpExpires: Date | null;
  _id: string;
  username: string;
  email: string;
  phone_number: string;
  city?: string;
  gender?: string;
  date_of_birth?: string;
  profileImage: any;
  verified: boolean;
  verificationToken: string;
  role?: any;
  addresses: any[]; // Assuming addresses is an array, you can provide a more specific type if available.
  isDeactivated: boolean;
  deactivationDate: Date | null;
  date_joined: Date; // Using Date for ISO timestamp strings
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const AccountDetails: React.FC<{ lang: string }> = ({ lang }) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const { updateProfileImage } = useProfile();
  const { t } = useTranslation(lang);
  const { mutate: updateUser, isPending } = useUpdateUserMutation();
  const { mutate: deactivateAccount, isSuccess } =
    useDeactivateAccountMutation();
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [profileData, setProfileData] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const [genderOptions, setGenderOptions] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset, // Use reset to set default form values dynamically
  } = useForm<UpdateUserType>();

  // Fetch user profile and set as default values
  const fetchProfileData = async () => {
    try {
      const token = Cookies.get('auth_token');
      if (!token) throw new Error('Authorization token is missing');

      const response = await fetch(`${BASE_API}/api/customers/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data: CustomerProfile = await response.json();
      console.log('Fetched profile data:', data);

      setProfileData(data);
      if (data.profileImage) {
        setCurrentImageUrl(`${BASE_API}/${data.profileImage}`);
      }
      reset({
        firstName: data.username || '',
        lastName: '', // Add if you want lastName from profile
        phoneNumber: data.phone_number || '',
        city: data.city || '',
        email: data.email || '',
        gender: data.gender || '',
        image: currentImageUrl || '',
        date_of_birth: data.date_of_birth
          ? data.date_of_birth.split('T')[0]
          : '', // Format to YYYY-MM-DD
        shareProfileData: true, // You can adjust this based on actual data
        setAdsPerformance: true, // Adjust as necessary
      });

      // Update the account status based on the fetched profile
      setIsDeactivated(data.isDeactivated);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProfileData();
  }, [reset]);

  // Handle form submission
  const onSubmit = (input: UpdateUserType) => {
    const formData = {
      ...input,
      image: uploadedImage,
    };
    console.log('data before sendoingv ', formData);

    updateUser(formData, {
      onSuccess: () => {
        if (currentImageUrl) {
          updateProfileImage(currentImageUrl);
        }
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Profile updated successfully',
          timer: 1500,
          showConfirmButton: true,
        });
        fetchProfileData();
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

  const handleToggleAccountStatus = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault(); // Prevent form submission

    const token = Cookies.get('auth_token');
    if (!token) {
      toast.error('Authorization token is missing');
      return;
    }

    const endpoint = isDeactivated
      ? '/api/customers/reactivate'
      : '/api/customers/deactivate';
    const method = 'POST';

    try {
      const response = await fetch(`${BASE_API}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update account status');
      }
      const data = await response.json();
      if (isDeactivated) {
        setIsDeactivated(false);
        Swal.fire({
          icon: 'success',
          title: 'Re-Activated!',
          text: 'Your account has been reactivated. You can now shop.',
          showConfirmButton: true,
          timer: 2000,
        });
      } else {
        setIsDeactivated(true);
        Swal.fire({
          icon: 'success',
          title: 'De-Activated!',
          text: 'Your account deactivation request has been submitted.',
          showConfirmButton: true,
          timer: 2000,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      console.error('Toggle account status error:', error);
    }
  };

  const handleUploadImage = async (file: File) => {
    setUploadedImage(file);
    setCurrentImageUrl(URL.createObjectURL(file));
  };

  if (loading) {
    return <LoadingComp />;
  }

  return (
    <div className="flex flex-col w-full">
      <Heading variant="titleLarge" className="mb-5 md:mb-6 lg:mb-7 lg:-mt-1">
        {t('common:text-account-details-personal')}
      </Heading>
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        {/* Instructions - Left side on desktop, below on mobile */}
        <div className="order-2 md:order-1 text-xs text-gray-500 self-start md:self-center">
          <p className="leading-tight">
            📸 Recommended size: 225 x 225px <br />
            Supported formats: JPG, PNG • Max size: 2MB
          </p>
        </div>

        {/* Image Upload Section - Center */}
        <div className="flex flex-col items-center space-y-3 order-1 md:order-2">
          <UserAvatar
            initialImageUrl={currentImageUrl}
            onUpload={handleUploadImage}
            size="lg"
            className="border border-indigo-300 rounded-full p-1 shadow-lg hover:shadow-xl transition-shadow duration-300"
          />
          <p className="text-sm text-gray-600 italic">
            Upload or update your profile picture!
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center w-full mx-auto"
        noValidate
      >
        <div className="border-b border-border-base pb-7 md:pb-8 lg:pb-10">
          <div className="flex flex-col space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                label={'Full Name'}
                {...register('firstName', {
                  required: 'forms:first-name-required',
                })}
                variant="solid"
                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                error={errors.firstName?.message}
                lang={lang}
              />
              <Input
                type="tel"
                label={t('forms:label-phone') as string}
                {...register('phoneNumber', {
                  required: 'forms:phone-required',
                })}
                variant="solid"
                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                error={errors.phoneNumber?.message}
                lang={lang}
              />
            </div>
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                type="text"
                label={'City'}
                {...register('city')}
                variant="solid"
                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                error={errors.city?.message}
                lang={lang}
              />
              <div className="w-full sm:w-1/2 px-1.5 md:px-2.5">
                <label className="block text-sm font-medium mb-1">
                  {t('Gender')}
                </label>
                <select
                  {...register('gender')}
                  className={`block w-full border ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  } rounded-md`}
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-red-500">{errors.gender.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                type="date"
                label={'Date Of Birth'}
                {...register('date_of_birth')}
                variant="solid"
                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                error={errors.date_of_birth?.message}
                lang={lang}
              />
            </div>
          </div>
        </div>
        <Heading
          variant="titleLarge"
          className="pt-6 mb-5 xl:mb-8 md:pt-7 lg:pt-8"
        >
          {t('common:text-account-details-account')}
        </Heading>
        <div className="border-b border-border-base pb-7 md:pb-9 lg:pb-10">
          <div className="flex flex-col space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row -mx-1.5 md:-mx-2.5 space-y-4 sm:space-y-0">
              <Input
                type="email"
                label={t('forms:label-email-star') as string}
                {...register('email', {
                  pattern: {
                    value:
                      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

                    message: 'forms:email-error',
                  },
                })}
                variant="solid"
                className="w-full sm:w-1/2 px-1.5 md:px-2.5"
                error={errors.email?.message}
                lang={lang}
              />
            </div>
          </div>
        </div>
        <div className="relative flex pt-6 md:pt-8 lg:pt-10">
          <div className="ltr:pr-2.5 rtl:pl-2.5">
            <Heading className="mb-1 font-medium">
              {t('common:text-share-profile-data')}
            </Heading>
            <Text variant="small">
              {t('common:text-share-profile-data-description')}
            </Text>
          </div>
          <div className="ltr:ml-auto rtl:mr-auto">
            <Controller
              name="shareProfileData"
              control={control}
              defaultValue={true}
              render={({ field: { value, onChange } }) => (
                <Switch onChange={onChange} checked={value} />
              )}
            />
          </div>
        </div>
        <div className="relative flex mt-5 mb-1 md:mt-6 lg:mt-7 sm:mb-4 lg:mb-6">
          <div className="ltr:pr-2.5 rtl:pl-2.5">
            <Heading className="mb-1 font-medium">
              {t('common:text-ads-performance')}
            </Heading>
            <Text variant="small">
              {t('common:text-ads-performance-description')}
            </Text>
          </div>
          <div className="ltr:ml-auto rtl:mr-auto">
            <Controller
              name="setAdsPerformance"
              control={control}
              defaultValue={true}
              render={({ field: { value, onChange } }) => (
                <Switch onChange={onChange} checked={value} />
              )}
            />
          </div>
        </div>
        <div className="relative flex md:flex-row flex-col justify-between pb-2 mt-5 lg:pb-0 gap-y-4 md:gap-y-0">
          <Button
            type="button"
            onClick={handleToggleAccountStatus}
            className={`w-full sm:w-auto ${
              isDeactivated ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isDeactivated ? 'Activate Account' : 'Deactivate Account'}
          </Button>
          <Button
            type="submit"
            loading={isPending}
            disabled={isPending}
            variant="formButton"
            className="w-full sm:w-auto order-first md:order-none"
          >
            {t('common:button-save-changes')}
          </Button>
        </div>
      </form>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={true}
      />
    </div>
  );
};

export default AccountDetails;
