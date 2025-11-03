'use client';
import { useContext, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/framework/basic-rest/auth/use-login';
import { verifyOTP, resendOTP } from '@/framework/basic-rest/auth/use-verify-otp';
import { useRouter } from 'next/navigation';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUI } from '@/contexts/ui.context';
import OTPVerificationModal from './otp-verification-modal';

const LoginForm = ({ lang }: { lang: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember_me, setRemember_me] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { mutate: login, isPending } = useLoginMutation();
  const { setPermissions } = useContext(PermissionsContext) || {};
  // const { wishlist } = useWishlist();
  const router = useRouter();
  const { authorize } = useUI();

  const handleRememberMeChange = () => {
    setRemember_me(!remember_me);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const loginData = {
      email: email,
      password: password,
      remember_me: remember_me,
    };
    
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
      } else {
        // Other error cases
        return;
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
    <div className="flex items-center justify-center pb-20">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px] text-center flex flex-col gap-3">
        <h2 className="text-[40px] font-bold mb-2">Welcome</h2>
        {/* <p className="text-gray-500 mb-6 ">Login into your account</p> */}

        {/* Email Input */}
        <div>
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
        </div>

        {/* Login Button */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
