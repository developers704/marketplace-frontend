import React from 'react';

const Security = () => {
  return (
    <div>
      <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">Security</h1>
      <div className="flex flex-col gap-4">
        <div id="profile" className="border rounded-xl border-[#ABAFB1] p-4">
          <div className="flex gap-4 items-center justify-between border-b py-3">
            <h1 className="text-xl font-bold">Change Password</h1>
            <button className="bg-[#0081FE] rounded-lg px-10 py-3 text-white w-fit">
             Save Changes
            </button>
          </div>
          <div className="flex flex-col justify-between space-y-5 mt-4 p-3">
            <div className="flex items-center justify-between">
              <strong>Current:</strong>
              <p>user name</p>
            </div>
            <div className="flex items-center justify-between">
              <strong>New:</strong>
              <p>Staff Id</p>
            </div>
            <div className="flex items-center justify-between">
              <strong>Retype new:</strong>
              <p>Role</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
