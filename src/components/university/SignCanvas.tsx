// components/SignaturePad.tsx
import { requestCertificate } from '@/framework/basic-rest/university/dashboardApi';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Pen, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function SignaturePad({
  onSave,
  username,
  setCertificateStatus,
}: {
  onSave: (dataUrl: string) => void;
  username: string;
  setCertificateStatus: any;
}) {
  const params = useParams();
  const { courseId } = params as { courseId: string };
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveSignature = async () => {
    setIsSubmitting(true);
    try {
      const res = await requestCertificate(courseId);
      
      if (res?.success) {
        Swal.fire({
          title: 'Success!',
          text: res?.message || 'Your certificate request has been submitted successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2563eb',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/valliani-university/achievements');
          }
        });
      } else {
        Swal.fire({
          title: 'Request Failed',
          text: res?.message || 'Unable to submit certificate request. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc2626',
        });
      }
      setCertificateStatus(res?.certificateRequest);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while submitting your request. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-brand-blue to-blue-600 rounded-t-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Pen className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold">Certificate Request</h2>
        </div>
        <p className="text-blue-50 text-sm">
          Submit your certificate request. Admin will sign and approve.
        </p>
      </div>

      {/* Request Card */}
      <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-brand-blue" />
          <p className="text-sm text-gray-700">
            No signature required. Your request will be reviewed and signed by admin.
          </p>
        </div>

        <button
          type="button"
          onClick={saveSignature}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Submit Certificate Request
            </>
          )}
        </button>
      </div>
    </div>
  );
}
