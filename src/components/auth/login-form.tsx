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
        if (res.ok) {
          setWarehouses(data);
        }
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
    const loginData = { email, password, remember_me, warehouseId: selectedWarehouse };

    try {
      const response = await login(loginData, setPermissions);
      console.log(response, '===>>> response login');
      
      if (response?.token) {
        // Direct login success
        authorize();
        router.push(`/${lang}/`);
      } else if (response?.requireOTP) {
        // OTP required - show modal
        setShowOTPModal(true);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-red-50 p-8 rounded-2xl shadow-2xl w-[500px] text-center flex flex-col gap-3">
        <h2 className="text-[40px] font-bold mb-2">Welcome</h2>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-4 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* ✅ Warehouse Dropdown */}
        <div className="mb-4">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="w-full bg-blue-400 text-white py-3 rounded-tr-[30px] rounded-bl-[30px] text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      {/* OTP Verification Modal */}
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
