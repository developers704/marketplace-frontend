// components/SignaturePad.tsx
import { requestCertificate } from '@/framework/basic-rest/university/dashboardApi';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Swal from 'sweetalert2';
import { Pen, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function SignaturePad({
  onSave,
  username,
  setCertificateStatus,
}: {
  onSave: (dataUrl: string) => void;
  username: string;
  setCertificateStatus: any;
}) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const params = useParams();
  const { courseId } = params as { courseId: string };
  const router = useRouter();
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  const checkSignature = () => {
    if (sigCanvas.current) {
      const isEmpty = sigCanvas.current.isEmpty();
      setIsEmpty(isEmpty);
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const saveSignature = async () => {
    if (!sigCanvas.current) return;
    
    const isEmpty = sigCanvas.current.isEmpty();
    if (isEmpty) {
      Swal.fire({
        title: 'Signature Required',
        text: 'Please provide your signature before submitting.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    const dataUrl = sigCanvas?.current?.toDataURL();
    if (dataUrl) {
      setIsSubmitting(true);
      try {
        onSave(dataUrl);
        const file = dataURLtoFile(dataUrl, 'signature.png');

        const res = await requestCertificate(courseId, file);
        
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
          <h2 className="text-2xl font-bold">Digital Signature</h2>
        </div>
        <p className="text-blue-50 text-sm">
          Please sign in the area below to request your certificate
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-blue-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Instructions:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Use your mouse or touchpad to draw your signature</li>
              <li>Make sure your signature is clear and readable</li>
              <li>You can clear and redraw if needed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signature Canvas Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 font-medium">Sign here</p>
          {username && (
            <p className="text-xs text-gray-500 mt-1">Requested by: {username || "-"} </p>
          )}
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-gray-50">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#1f2937"
                canvasProps={{
                  width: 600,
                  height: 250,
                  className: 'bg-white rounded-md cursor-crosshair shadow-inner',
                }}
                onBegin={checkSignature}
                onEnd={checkSignature}
              />
            </div>
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Pen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm font-medium">
                    Draw your signature here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          type="button"
          onClick={clearSignature}
          disabled={isEmpty || isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md border border-gray-300"
        >
          <Trash2 className="w-4 h-4" />
          Clear Signature
        </button>
        
        <button
          type="button"
          onClick={saveSignature}
          disabled={isEmpty || isSubmitting}
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

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By submitting, you agree that this is your authentic signature
        </p>
      </div>
    </div>
  );
}
