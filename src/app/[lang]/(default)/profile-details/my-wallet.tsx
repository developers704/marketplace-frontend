'use client';
import { PermissionsContext } from '@/contexts/permissionsContext';
import {
  // getStoreWallet,
  // getUserWallet,
  getWarehouseWallet,
  requestWalletCredit,
} from '@/framework/basic-rest/wallet/useWallet';
import React, { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const showCreditRequestModal = (targetWallet: any) => {
  Swal.fire({
    title:
      "<h2 class='text-left text-gray-800 font-semibold text-2xl'>Credit Request Form</h2>",
    html: `
      <div class="text-left">
        <label class="block text-sm font-medium text-gray-600 mb-1">Amount Requested</label>
        <input type="number" id="amount" class="w-full p-2 border rounded-md focus:ring focus:ring-blue-200" placeholder="0.00"/>

        <label class="block text-sm font-medium text-gray-600 mt-3">Reason</label>
        <textarea id="reason" rows="3" class="w-full p-2 border rounded-md focus:ring focus:ring-blue-200" placeholder="Enter your reason for requesting credit.."></textarea>
      </div>
    `,
    // showCancelButton: true,
    confirmButtonText: 'Submit',
    customClass: {
      popup: 'rounded-lg shadow-md p-6',
      confirmButton: 'w-[300px] bg-blue-600 text-white px-4 py-2 rounded-md',
    },
    preConfirm: () => {
      const amount = (document.getElementById('amount') as HTMLInputElement)
        ?.value;
      const reason = (document.getElementById('reason') as HTMLTextAreaElement)
        ?.value;

      if (!amount || parseFloat(amount) <= 0) {
        Swal.showValidationMessage('Please enter a valid amount.');
        return false;
      }
      if (!reason) {
        Swal.showValidationMessage(
          'Please enter a reason for requesting credit.',
        );
        return false;
      }

      return { amount, reason };
    },
  }).then(async (result) => {
    // console.log(result, '===>>> result from the modal');
    if (result.isConfirmed && result.value) {
      const { amount, reason } = result.value;
      const amountInNumber = parseFloat(amount);

      // ✅ Call requestWalletCredit function when confirmed
      const response = await requestWalletCredit(amount, reason, targetWallet);

      if (response) {
        Swal.fire(
          'Success!',
          'Your credit request has been submitted.',
          'success',
        );
      } else {
        Swal.fire('Error!', 'Failed to submit request. Try again.', 'error');
      }
    }
  });
};

const MyWallet = ({ warehouse }: any) => {
  const [walletBalance, setWalletBalance] = useState<any>(0);
  const [storeWalletBalance, setStoreWalletBalance] = useState<any>(0);
  // const [warehouseWalletBalance, setWarehouseWalletBalance] = useState<any>(0);
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';
  // console.log(warehouse, '===>>> warehouse');

  // console.log(permissions[key]?.View, '===>>> permissions');
  // const fetchUserWallet = async () => {
  //   const response = await getUserWallet();

  //   if (response.message === 'Wallet data retrieved successfully') {
  //     // console.log(response.message, '===>>> response message');
  //     setWalletBalance(response.wallet.balance);
  //   }
  //   // console.log(response, '===>>> response');
  // };

  // const fetchStoreWallet = async (warehouseId: any) => {
  //   const response = await getStoreWallet(warehouseId);

  //   // console.log(response, '===>>> response message store');
  //   if (response) {
  //     setStoreWalletBalance(response.balance);
  //   }
  //   // console.log(response, '===>>> response');
  // };

  const fetchWarehouseWallet = async (warehouseId: any) => {
    const response = await getWarehouseWallet(warehouseId);

    // console.log(response, '===>>> response message store');
    if (response) {
      setWalletBalance(response?.inventoryWallet?.balance);
      setStoreWalletBalance(response?.suppliesWallet?.balance);
      // setWarehouseWalletBalance(response.balance);
    }
    // console.log(response, '===>>> response');
  };

  useEffect(() => {
    // fetchUserWallet();
    // fetchStoreWallet(warehouse?._id);
    fetchWarehouseWallet(warehouse?._id);
  }, [warehouse]);

  const handleCreditRequest = (targetWallet: any) => {
    showCreditRequestModal(targetWallet);
  };

  // console.log(walletBalance, '===>>> wallet balance');
  return (
    <div>
      <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">
        {warehouse?.name} Inventory Wallet
      </h1>
      <div className="flex flex-col ">
        <div
          id="profile"
          className="border rounded-xl border-[#ABAFB1] p-4 mb-20"
        >
          <div className="flex gap-4 items-center justify-between py-3">
            <h1 className="text-4xl font-semibold">
              $ {walletBalance?.toLocaleString()}{' '}
              <span className="text-lg font-normal">{`(Total)`}</span>
            </h1>
            <div className="flex gap-4 items-center ">
              <button
                className="bg-[#34A853] rounded-lg px-10 py-3 text-white w-fit"
                onClick={() => showCreditRequestModal('inventory')}
              >
                Request Credit
              </button>
              {/* <button className="bg-[#0081FE] rounded-lg px-10 py-3 text-white w-fit">
                Use it now
              </button> */}
            </div>
          </div>
        </div>

        {/* Store wallet */}
        {permissions[key]?.View && (
          <>
            <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">
              {warehouse?.name} Supplies Wallet
            </h1>
            <div
              id="profile"
              className="border rounded-xl border-[#ABAFB1] p-4 mb-20"
            >
              <div className="flex gap-4 items-center justify-between py-3">
                <h1 className="text-4xl font-semibold">
                  $ {storeWalletBalance?.toLocaleString()}{' '}
                  <span className="text-lg font-normal">{`(Total)`}</span>
                </h1>
                <div className="flex gap-4 items-center ">
                  <button
                    className="bg-[#34A853] rounded-lg px-10 py-3 text-white w-fit"
                    onClick={() => showCreditRequestModal('supplies')}
                  >
                    Request Credit
                  </button>
                  {/* <button className="bg-[#0081FE] rounded-lg px-10 py-3 text-white w-fit">
                    Use it now
                  </button> */}
                </div>
              </div>
            </div>
          </>
        )}

        {/* <div id="table">
          <div className="flex items-center w-full border-b-[4px] border-[#ABAFB1] py-3 px-2">
            <div className="w-full flex-1 font-bold text-lg">Date</div>
            <div className="w-full flex-[3] font-bold text-lg">Description</div>
            <div className="w-full flex-1 font-bold text-lg">Amount</div>
            <div className="w-full flex-1 font-bold text-lg">Status</div>
          </div>
          <div className="border-[2px] border-[#ABAFB1] rounded-lg my-5">
            {[1, 2, 3, 4].map((item) => {
              return (
                <div className="flex items-center w-full border-b-[2px] border-brand-muted py-4 px-2">
                  <div className="w-full flex-1 text-lg">Date</div>
                  <div className="w-full flex-[3] text-lg">Done</div>
                  <div className="w-full flex-1 text-lg">Amount</div>
                  <div className="w-full flex-1 text-lg">Status</div>
                </div>
              );
            })}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default MyWallet;
