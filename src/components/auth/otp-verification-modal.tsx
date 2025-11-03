'use client';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerifySuccess: () => void;
  verifyOTP: (otp: string, email: string) => Promise<any>;
  resendOTP?: (email: string) => Promise<any>;
}

const OTPVerificationModal = ({
  isOpen,
  onClose,
  email,
  onVerifySuccess,
  verifyOTP,
  resendOTP,
}: OTPVerificationModalProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await verifyOTP(otpString, email);
      if (response?.token) {
        onVerifySuccess();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setIsVerifying(false);
    setIsResending(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[500px] max-w-[90vw] text-center">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit OTP sent to your email
        </p>
        <p className="text-sm text-gray-500 mb-6">
          OTP sent to: <span className="font-medium">{email}</span>
        </p>

        {/* OTP Input Fields */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.join('').length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </button>

        {/* Resend OTP */}
        <button
          onClick={async () => {
            if (resendOTP) {
              setIsResending(true);
              try {
                await resendOTP(email);
              } catch (error) {
                console.error('Resend OTP error:', error);
              } finally {
                setIsResending(false);
              }
            }
          }}
          disabled={isResending || !resendOTP}
          className="mt-4 text-blue-600 hover:text-blue-700 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isResending ? 'Resending...' : "Didn't receive OTP? Resend"}
        </button>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
