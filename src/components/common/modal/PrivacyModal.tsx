'use client';

import {
  acceptTermsAndConditions,
  useMainPolicyDataQuery,
} from '@/framework/basic-rest/auth/use-policies';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useUI } from '@/contexts/ui.context'; 
import { toast } from 'react-toastify';

export default function PrivacyPolicyModal() {
  const [showModal, setShowModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { data, isLoading, error } = useMainPolicyDataQuery();
  const { isAuthorized } = useUI(); 

  useEffect(() => {
    if (!isAuthorized) {
      setShowModal(false);
      return;
    }
    if (typeof window !== 'undefined') {
      const agreed = localStorage.getItem('privacyPolicyAgreed');
      const agreedAt = localStorage.getItem('privacyPolicyAgreedAt');
      if (agreed && agreedAt) {
        const agreedTime = new Date(agreedAt).getTime();
        const now = new Date().getTime();
        const hours24 = 24 * 60 * 60 * 1000;
        if (now - agreedTime <= hours24) {
          setShowModal(false);
          return;
        } else {
          localStorage.removeItem('privacyPolicyAgreed');
          localStorage.removeItem('privacyPolicyAgreedAt');
        }
      }
    }
    setShowModal(true);
  }, [isAuthorized]);

  const handleAgree = async () => {
    if (isChecked) {
      const res = await acceptTermsAndConditions();
      toast.success(res.message);
      if (typeof window !== 'undefined') {
        localStorage.setItem('privacyPolicyAgreed', 'true');
        localStorage.setItem('privacyPolicyAgreedAt', new Date().toISOString());
      }
      setShowModal(false);
    }
  };

  if (!isAuthorized || !showModal) return null;
  if (isLoading) return <p>Loading...</p>;

  // API returns an array with a single object; normalize it
  const policy = Array.isArray(data) ? data[0] : data;
  const isActive = policy?.isActive;
  const safeHTML = DOMPurify.sanitize(policy?.content);

  return (
  <>
  {/* Show T&C only when policy is active (isActive === true) */}
  {isActive && (
      <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#dedede] rounded-xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
        <h2 className="text-[32px] font-semibold mb-4 text-center">
          Terms & Conditions
        </h2>

        <div
          className="overflow-y-auto pr-3 mb-4"
          style={{ maxHeight: '60vh' }}
        >
          <section className="text-sm text-gray-800 space-y-6">
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
          </section>
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-1 accent-blue-600"
          />
          <span>
            I have read and agreed to the <strong>Terms & Conditions</strong>.
          </span>
        </label>

        <div className="flex justify-end">
          <button
            onClick={handleAgree}
            disabled={!isChecked}
            className={`px-5 py-2 rounded-md transition text-white ${
              isChecked
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  )}
  </>
  );
}
