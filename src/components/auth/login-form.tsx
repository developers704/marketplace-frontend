'use client';
import { useContext, useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/framework/basic-rest/auth/use-login';
import { verifyOTP, resendOTP } from '@/framework/basic-rest/auth/use-verify-otp';
import { useRouter } from 'next/navigation';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import OTPVerificationModal from './otp-verification-modal';
import { toast } from 'react-toastify';

const LoginForm = ({ lang }: { lang: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember_me, setRemember_me] = useState(false);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  // selectedWarehouse stores the selected warehouse _id
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { mutate: login, isPending } = useLoginMutation();
  const { setPermissions } = useContext(PermissionsContext) || {};
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

    const loginData = { email, password, remember_me, warehouseId: selectedWarehouse };

    try {
      const response = await login(loginData, setPermissions);
      if (response?.token) {
        authorize();
        router.push(`/${lang}/`);
      } else if (response?.requireOTP) {
        setShowOTPModal(true);
      }
    } catch (error: any) {
      const message = error.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ────── OTP HANDLERS ────── */
  const handleOTPVerification = async (otp: string, email: string) => {
    return await verifyOTP({ otpCode: otp, email }, setPermissions);
  };
  const handleResendOTP = async (email: string) => {
    return await resendOTP({ email });
  };
  const handleOTPSuccess = () => {
    setShowOTPModal(false);
    authorize();
    router.push(`/${lang}/`);
  };
  const handleCloseOTPModal = () => setShowOTPModal(false);

  /* ────── RENDER ────── */
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-100 to-teal-50 p-4">
      {/* ───── RIGHT PANEL (FORM) ───── */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Sign in</h2>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Warehouse Dropdown */}
        <div className="mb-6">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
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
        email={email}
        onVerifySuccess={handleOTPSuccess}
        verifyOTP={handleOTPVerification}
        resendOTP={handleResendOTP}
      />
    </div>
  );
};

export default LoginForm;