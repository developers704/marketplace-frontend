'use client';
import { useUpdateUserMutation } from '@/framework/basic-rest/customer/use-update-customer';
import { fetchProfileData, useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';
import cn from 'classnames';
import Cookies from 'js-cookie';

const MIN_PASSWORD_LENGTH = 8;

/** Password modal uses `z-[10050]`; SweetAlert2 default ~1060 sits under it — bump at open */
const SWAL_ABOVE_MODAL_Z = 10070;
const swalAlert = Swal.mixin({
  didOpen: () => {
    document.querySelectorAll('.swal2-container').forEach((el) => {
      (el as HTMLElement).style.setProperty('z-index', String(SWAL_ABOVE_MODAL_Z), 'important');
    });
  },
});



const PersonalInfo = () => {

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API
  
  const { data: user } = useUserDataQuery();
  const [editBtn, setEditBtn] = useState(false);
  const [username, setUsername] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [city, setCity] = useState('');
  const [showPasswordModal , setShowPasswordModal] = useState(false);
  const [currentPassword , setCurrentPassword] = useState("");
  const [newPassword , setNewPassword] = useState("");
  const [confirmPassword , setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  /** Stops Chrome from injecting saved passwords before the user focuses a field */
  const [passwordFieldsUnlocked, setPasswordFieldsUnlocked] = useState(false);

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
        swalAlert.fire({ icon: 'success', title: 'Updated!', timer: 1500 });
      },
      onError: (error: any) => {
        swalAlert.fire({ icon: 'error', title: 'Oops...', text: error.message, timer: 1500 });
      },
    });
  };



  const resetPasswordForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  const unlockPasswordFields = useCallback(() => {
    setPasswordFieldsUnlocked(true);
  }, []);

  useEffect(() => {
    if (!showPasswordModal) {
      resetPasswordForm();
      setPasswordFieldsUnlocked(false);
      return;
    }
    setPasswordFieldsUnlocked(false);
    window.dispatchEvent(new Event('marketplace:clear-header-search'));
  }, [showPasswordModal, resetPasswordForm]);

  const changePassword = useCallback(async () => {
    const token = Cookies.get('auth_token');
    if (!token) {
      await swalAlert.fire({
        icon: 'error',
        title: 'Not signed in',
        text: 'Please log in again to change your password.',
      });
      return;
    }

    if (!currentPassword.trim()) {
      await swalAlert.fire({ icon: 'warning', title: 'Required', text: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      await swalAlert.fire({
        icon: 'warning',
        title: 'Weak password',
        text: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      await swalAlert.fire({
        icon: 'error',
        title: 'Password mismatch',
        text: 'New password and confirm password do not match.',
      });
      return;
    }
    if (currentPassword === newPassword) {
      await swalAlert.fire({
        icon: 'warning',
        title: 'Same password',
        text: 'Choose a new password that is different from your current one.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${BASE_API}/api/customers/change-password-profile`, {
        method: 'Post',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      let data: { message?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON body */
      }

      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`);
      }

      await swalAlert.fire({
        icon: 'success',
        title: 'Password changed',
        text: data?.message || 'Your password has been updated.',
        timer: 2000,
        showConfirmButton: false,
      });

      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      await swalAlert.fire({ icon: 'error', title: 'Could not update password', text: message });
    } finally {
      setIsChangingPassword(false);
    }
  }, [BASE_API, currentPassword, newPassword, confirmPassword, resetPasswordForm]);

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
            <span className="text-gray-500 font-medium">UserId</span>
            <span className="text-gray-700">{user?.userId || '-'}</span>
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
        <div className='mb-4 flex justify-end px-4 sm:px-6 lg:px-8 '>
        <button
          type="button"
          onClick={() => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordModal(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 text-white rounded-xl 
         hover:bg-gray-700 transition font-medium shadow-sm"
        >
          Change Password
        </button>

        </div>
        {showPasswordModal &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/50 p-4"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  setShowPasswordModal(false);
                }
              }}
            >
              <div
                className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="change-password-title"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <h2 id="change-password-title" className="mb-4 text-xl font-semibold">
                  Change Password
                </h2>

                <form
                  id="profile-change-password-form"
                  className="flex flex-col gap-3"
                  autoComplete="off"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void changePassword();
                  }}
                >
                  {/*
                    Chrome fills saved *username* (e.g. "admin") into the first text control it finds.
                    Without this field, that becomes the header global search. This field captures it.
                  */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="profile-change-pw-username" className="text-xs font-medium text-gray-500">
                      Account / sign-in ID
                    </label>
                    <input
                      id="profile-change-pw-username"
                      type="text"
                      name="username"
                      autoComplete="username"
                      readOnly
                      tabIndex={0}
                      value={
                        (user as { userId?: string } | undefined)?.userId ||
                        user?.email ||
                        user?.username ||
                        ''
                      }
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none read-only:bg-gray-50"
                    />
                  </div>

                  <input
                    type="password"
                    name="profile_existing_password"
                    id="profile_existing_password"
                    placeholder="Current password"
                    autoComplete="current-password"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={!passwordFieldsUnlocked}
                    onFocus={unlockPasswordFields}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-[#1F2937]/25"
                  />

                  <input
                    type="password"
                    name="profile_new_password"
                    id="profile_new_password"
                    placeholder="New password"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={!passwordFieldsUnlocked}
                    onFocus={unlockPasswordFields}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-[#1F2937]/25"
                  />

                  <input
                    type="password"
                    name="profile_confirm_password"
                    id="profile_confirm_password"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck={false}
                    readOnly={!passwordFieldsUnlocked}
                    onFocus={unlockPasswordFields}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2 outline-none focus:ring-2 focus:ring-[#1F2937]/25"
                  />
                </form>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isChangingPassword}
                    onClick={() => setShowPasswordModal(false)}
                    className="rounded-lg bg-gray-300 px-4 py-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    form="profile-change-password-form"
                    disabled={isChangingPassword}
                    className="rounded-lg bg-[#1F2937] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Updating…' : 'Update'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
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
