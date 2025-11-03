'use client';

import { useState } from 'react';
import { TiPencil } from 'react-icons/ti';
import { AiOutlinePlus } from 'react-icons/ai';
import { RadioGroup } from '@headlessui/react';
import { useModalAction } from '@components/common/modal/modal.context';
import { formatAddress } from '@utils/format-address';
import Button from '@components/ui/button';
import { useTranslation } from 'src/app/i18n/client';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { useAddressQuery } from '@framework/address/address';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

const AddressGrid: React.FC<{ address?: any; lang: string }> = ({
  address,
  lang,
}) => {
  const { t } = useTranslation(lang, 'common');
  const { openModal } = useModalAction();
  const { refetch } = useAddressQuery();

  function handlePopupView(item: any) {
    openModal('ADDRESS_VIEW_AND_EDIT', item);
  }
  async function handleDelete(id: any) {
    try {
      const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
      const token = Cookies.get('auth_token');
      if (!token) {
        throw new Error('Token not found');
      }
      let response;
      if (id) {
        response = await fetch(`${BASE_API}/api/addresses/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      if (!response) {
        throw new Error('Failed to delete address');
      }
      const res = await response.json();
      if (res) {
        await refetch();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Address deleted successfully',
          timer: 1500,
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete address');
    }
  }

  address = address || [];

  const [selected, setSelected] = useState(address[0]);
  return (
    <div className="flex flex-col justify-between h-full -mt-4 text-15px md:mt-0">
      <RadioGroup
        value={selected}
        onChange={setSelected}
        className="space-y-4 md:grid md:grid-cols-2 md:gap-5 auto-rows-auto md:space-y-0"
      >
        <RadioGroup.Label className="sr-only">{t('address')}</RadioGroup.Label>
        {address?.length > 0 ? (
          address?.map((item: any, index: any) => (
            <RadioGroup.Option
              key={index}
              value={item}
              className={({ checked }) =>
                `${checked ? 'border-blue-900' : 'border-border-base'}
                  border-2 relative focus:outline-none rounded-md p-5 block cursor-pointer min-h-[112px] h-full group address__box`
              }
            >
              <RadioGroup.Label
                as="h3"
                className="mb-2 -mt-1 font-semibold text-brand-dark "
              >
                {item?.title}
              </RadioGroup.Label>
              <RadioGroup.Description
                as="div"
                className="leading-6 text-brand-muted"
              >
                {item?.address}
              </RadioGroup.Description>
              <div className="absolute z-10 flex md:flex-row flex-col transition-all ltr:right-3 rtl:left-3 top-3 lg:opacity-0 address__actions md:gap-x-2 gap-y-2 md:gap-y-0">
                <button
                  className="flex items-center justify-center w-6 h-6 text-base rounded-full bg-red-600 text-brand-light text-opacity-80"
                  onClick={() => handleDelete(item?._id)}
                >
                  <RiDeleteBin6Line />
                </button>
                <button
                  onClick={() => handlePopupView(item)}
                  className="flex items-center justify-center w-6 h-6 text-base rounded-full bg-blue-900 text-brand-light text-opacity-80 order-first md:order-none"
                >
                  <span className="sr-only">{t(item?.title)}</span>
                  <TiPencil />
                </button>
              </div>
            </RadioGroup.Option>
          ))
        ) : (
          <div className="border-2 border-border-base rounded font-semibold p-5 px-10 text-brand-danger flex justify-start items-center min-h-[112px] h-full">
            {t('text-no-address-found')}
          </div>
        )}
        <button
          className="w-full border-2 transition-all border-border-base rounded font-semibold p-5 px-10 cursor-pointer text-blue-900 flex justify-start hover:border-blue-900 items-center min-h-[112px] h-full"
          onClick={handlePopupView}
        >
          <AiOutlinePlus size={18} className="ltr:mr-2 rtl:ml-2" />
          {t('text-add-address')}
        </button>
      </RadioGroup>

      <div className="flex mt-5 sm:justify-end md:mt-10 lg:mt-20 save-change-button">
        <Button className="w-full sm:w-auto">{t('button-save-changes')}</Button>
      </div>
      <ToastContainer
        autoClose={1000}
        hideProgressBar={true}
        position="top-center"
      />
    </div>
  );
};

export default AddressGrid;
