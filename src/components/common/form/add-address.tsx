import Input from '@components/ui/form/input';
import Button from '@components/ui/button';
import TextArea from '@components/ui/form/text-area';
import { useForm } from 'react-hook-form';
import {
  useModalAction,
  useModalState,
} from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import Heading from '@components/ui/heading';
import Map from '@components/ui/map';
import { useTranslation } from 'src/app/i18n/client';
import Cookies from 'js-cookie';
import { fetchAddress, useAddressQuery } from '@framework/address/address';
import { useUpdateAddressMutation } from '@framework/customer/use-update-address';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

export interface ContactFormValues {
  title: string;
  default: boolean;
  lat: number;
  lng: number;
  formatted_address?: string;
}

const AddAddressForm: React.FC<{ lang: string }> = ({ lang }) => {
  const { t } = useTranslation(lang);
  const { data } = useModalState();
  const { mutate: updateAddress, isPending } = useUpdateAddressMutation();
  const { closeModal } = useModalAction();
  const { refetch } = useAddressQuery();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  async function onSubmit(values: any, e: any) {
    try {
      // call api to add address
      const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
      const token = Cookies.get('auth_token');
      if (!token) {
        throw new Error('Token not found');
      }
      let response;
      if (data._id) {
        response = await fetch(`${BASE_API}/api/addresses/${data._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: values.formatted_address,
            title: values.title,
          }),
        });
      } else {
        response = await fetch(`${BASE_API}/api/addresses`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: values.formatted_address,
            title: values.title,
          }),
        });
      }
      if (!response?.ok) {
        throw new Error('Failed to add address');
      }
      const res = await response.json();
      if (res) {
        if (values.default) {
          await updateAddress({ address: values, resId: res._id }); // Call the function to set this address as default
        }
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Address added successfully',
          timer: 1500,
          showConfirmButton: true,
        });
        await refetch();
        closeModal();
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to add address');
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      title: data || data?.title ? data?.title : '',
      formatted_address: data || data?.address ? data?.address : '',
      default: data || data?.isDefault ? data?.isDefault : false,
    },
  });

  return (
    <div className="w-full md:w-[600px] lg:w-[900px] xl:w-[1000px] mx-auto p-5 sm:p-8 bg-brand-light rounded-md">
      <CloseButton onClick={closeModal} />
      <Heading variant="title" className="mb-8 -mt-1.5">
        {t('common:text-add-delivery-address')}
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <Input
            variant="solid"
            label="Address Title"
            {...register('title', { required: 'Title Required' })}
            error={errors.title?.message}
            lang={lang}
          />
        </div>
        <div className="grid grid-cols-1 mb-6 gap-7">
          {apiKey ? (
            <Map
              lat={data?.address?.lat || 1.295831}
              lng={data?.address?.lng || 103.76261}
              height={'420px'}
              zoom={15}
              showInfoWindow={false}
              mapCurrentPosition={(value: string) =>
                setValue('formatted_address', value)
              }
            />
          ) : (
            <FallbackMessage />
          )}
          <TextArea
            label="Address"
            {...register('formatted_address', {
              required: 'forms:address-required',
            })}
            error={errors.formatted_address?.message}
            className="text-brand-dark"
            variant="solid"
            lang={lang}
          />
          <div className="flex items-center mb-4">
            <input type="checkbox" {...register('default')} className="mr-2" />
            <label className="text-brand-dark opacity-80">
              {t('Set as default address')}
            </label>
          </div>
        </div>
        <div className="flex justify-end w-full">
          <Button className="h-11 md:h-12 mt-1.5" type="submit">
            {t('common:text-save-address')}
          </Button>
        </div>
      </form>
      <ToastContainer
        autoClose={1000}
        hideProgressBar={true}
        position="top-center"
      />
    </div>
  );
};

export default AddAddressForm;

const FallbackMessage = () => (
  <div className="flex justify-center items-center h-[420px] bg-gray-200 text-gray-700">
    <p>
      Map could not be displayed. Please ensure the API key is configured
      correctly.
    </p>
  </div>
);
