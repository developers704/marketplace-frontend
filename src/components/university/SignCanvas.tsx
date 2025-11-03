// components/SignaturePad.tsx
import { requestCertificate } from '@/framework/basic-rest/university/dashboardApi';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import Swal from 'sweetalert2';

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
  // console.log(courseId, 'params');
  const router = useRouter();

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

  const saveSignature = async () => {
    const dataUrl = sigCanvas.current?.toDataURL();
    if (dataUrl) {
      onSave(dataUrl); // optional if needed
      const file = dataURLtoFile(dataUrl, 'signature.png');

      const res = await requestCertificate(courseId, file);
      // console.log(res, 'res certificate request');
      if (res?.success) {
        Swal.fire({
          title: 'Certificate Request',
          text: res?.message,
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/valliani-university/achievements'); // Replace with your desired route
          }
        });
      } else {
        Swal.fire({
          title: 'Certificate Request',
          text: res?.message,
          icon: 'error',
          confirmButtonText: 'OK',
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/valliani-university/achievements'); // Replace with your desired route
          }
        });
      }
      setCertificateStatus(res?.certificateRequest);
      // console.log('Uploaded Image URL:', res.url); // save this in DB
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-xl font-bold">Draw your signature below</h2>
      <div className="border border-gray-300 inline-block">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{ width: 500, height: 200, className: 'bg-white' }}
        />
      </div>
      <div className="flex justify-center gap-4">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => sigCanvas.current?.clear()}
        >
          Clear
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={saveSignature}
        >
          Submit Signature
        </button>
      </div>
    </div>
  );
}
