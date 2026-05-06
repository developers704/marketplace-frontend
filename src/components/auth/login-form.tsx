'use client';
import { useContext, useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { login } from '@/framework/basic-rest/auth/use-login';
import { verifyOTP, resendOTP } from '@/framework/basic-rest/auth/use-verify-otp';
import { useRouter } from 'next/navigation';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import OTPVerificationModal from './otp-verification-modal';
import { toast } from 'react-toastify';
import Image from 'next/image';


const LoginForm = ({ lang }: { lang: string }) => {
   const { setUser } = useUI();
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember_me, setRemember_me] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  // selectedWarehouse stores the selected warehouse _id
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // const { mutate: login, isPending } = useLoginMutation();
  const { refreshPermissions } = useContext(PermissionsContext) || {};
  const { authorize } = useUI();
  const router = useRouter();

  // ✅ Fetch warehouses before login
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
        const res = await fetch(`${BASE_API}/api/warehouses`);
        const data = await res.json();
        if (res.ok) setWarehouses(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch warehouses');
      }
    };
    fetchWarehouses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSubmit = async () => {
    if (!selectedWarehouse) {
      toast.error('Please select a warehouse before login.');
      return;
    }

    setIsLoading(true);
    const warehouseObj = warehouses.find((w) => w._id === selectedWarehouse);
    if (warehouseObj) {
      try {
        localStorage.setItem('selectedWarehouse', JSON.stringify(warehouseObj));
      } catch (err : any) {
        
        toast.error(err.message || 'Failed to save selected warehouse.');
      }
    }

    const loginData = { userId, password, remember_me, warehouseId: selectedWarehouse , setUser};

    try {
      const response = await login(loginData, setUser);
      if (response?.token) {
        authorize();
        await refreshPermissions?.();
        router.push(`/${lang}/`);
      } else if (response?.requireOTP) {
        setShowOTPModal(true);
      }
    } catch (error: any) {
      const message = error.message || 'Login failed';
      // toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ────── OTP HANDLERS ────── */
  const handleOTPVerification = async (otp: string, email: string) => {
    return await verifyOTP({ otpCode: otp, email });
  };
  const handleResendOTP = async (email: string) => {
    return await resendOTP({ email, userId: email });
  };
  const handleOTPSuccess = async () => {
    setShowOTPModal(false);
    authorize();
    await refreshPermissions?.();
    router.push(`/${lang}/`);
  };
  const handleCloseOTPModal = () => setShowOTPModal(false);

  /* ────── RENDER ────── */
  return (
    // HIGHLIGHT: Yeh parent div ab relative hai
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      
      {/* HIGHLIGHT: Background Image - Full Screen */}
      <Image
        src="/assets/images/store.jpg"
        alt="Login background"
        fill
        className="object-cover"
        priority
      />

      {/* HIGHLIGHT: Optional Dark Overlay (text readable rahe) */}
      <div className="absolute inset-0 bg-black/70" />

      {/* HIGHLIGHT: Login Form - Upar dikhega */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Sign in</h2>
      
        {/* User ID */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter your user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Warehouse Dropdown - Custom with fixed height */}
        <div className="mb-6 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white text-left flex items-center justify-between"
          >
            <span className={selectedWarehouse ? 'text-gray-900' : 'text-gray-500'}>
              {selectedWarehouse
                ? warehouses.find((w) => w._id === selectedWarehouse)?.name || 'Select Warehouse'
                : 'Select Warehouse'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedWarehouse('');
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                  !selectedWarehouse ? 'bg-teal-50 text-teal-600' : 'text-gray-900'
                }`}
              >
                Select Warehouse
              </button>
              {warehouses.map((w) => (
                <button
                  key={w._id}
                  type="button"
                  onClick={() => {
                    setSelectedWarehouse(w._id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                    selectedWarehouse === w._id ? 'bg-teal-50 text-teal-600' : 'text-gray-900'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full rounded-tr-3xl rounded-bl-3xl bg-teal-500 py-3.5 text-lg font-medium text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Divider */}
   
      </div>

      {/* OTP Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        email={userId}
        onVerifySuccess={handleOTPSuccess}
        verifyOTP={handleOTPVerification}
        resendOTP={handleResendOTP}
      />
    </div>
  );
};

export default LoginForm;