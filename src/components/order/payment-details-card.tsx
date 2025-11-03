import React from 'react';

const PaymentDetailsCard = ({ data }: any) => {
  return (
    <div className="border rounded-lg p-4 shadow-md w-80 bg-white">
      <h2 className="text-green-600 font-semibold text-lg">Payment details</h2>
      <div className="mt-2">
        <p className="text-xl font-bold">Order total</p>
        <p className="text-2xl font-bold">$.2000</p>
      </div>
      <div className="mt-4 border-t pt-2 text-sm">
        <div className="flex justify-between">
          <span>Item(s) total:</span>
          <span>$.2000</span>
        </div>
        <div className="flex justify-between">
          <span>Item(s) discount:</span>
          <span className="text-red-500">-$.400</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Subtotal:</span>
          <span>$.400</span>
        </div>
      </div>
      <div className="mt-4 border-t pt-2 text-sm">
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className="font-semibold">Free</span>
        </div>
        <div className="flex justify-between">
          <span>Credit:</span>
          <span className="text-red-500">-$.400</span>
        </div>
      </div>
      <div className="mt-4 border-t pt-2 text-lg font-bold">
        <div className="flex justify-between">
          <span>Order total:</span>
          <span>$.2000</span>
        </div>
      </div>
      <div className="mt-2 text-sm text-red-500 font-semibold">
        <div className="flex justify-between">
          <span>You saved:</span>
          <span>-$.400</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsCard;
