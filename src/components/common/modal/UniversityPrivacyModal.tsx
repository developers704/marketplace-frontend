// 'use client';

// import {
//   acceptTermsAndConditions,
//   useMainPolicyDataQuery,
// } from '@/framework/basic-rest/auth/use-policies';
// import { useEffect, useState } from 'react';
// import DOMPurify from 'dompurify';
// import { useUI } from '@/contexts/ui.context'; // ✅ Import this
// import { toast } from 'react-toastify';
// import {
//   fetchUniversityPolicy,
//   useUniversityPolicyDataQuery,
// } from '@/framework/basic-rest/university/dashboardApi';
// import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

// export default function UniversityPrivacyModal() {
//   const [showModal, setShowModal] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [policy, setPolicy] = useState('');
//   const {
//     data: userData,
//     isLoading: userLoading,
//     error: userError,
//   } = useUserDataQuery();
//   // const { data, isLoading, error } = useUniversityPolicyDataQuery();
//   const { isAuthorized } = useUI(); // ✅ Access isAuthorized

//   const getPolicy = async (roleId: string, warehouseId: string) => {
//     const res = await fetchUniversityPolicy(roleId, warehouseId);
//     console.log(res, 'poloioasd');
//     setPolicy(res?.policy?.content);
//     return res;
//   };
//   useEffect(() => {
//     if (!userLoading && userData) {
//       getPolicy(userData?.role?._id, userData?.warehouse?._id);
//     }
//   }, [userData, userLoading]);

//   useEffect(() => {
//     if (!isAuthorized) {
//       setShowModal(false);
//       return;
//     }
//     if (typeof window !== 'undefined') {
//       // const agreed = localStorage.getItem('UniversityPrivacyPolicyAgreed');
//       // const agreedAt = localStorage.getItem('UniversityPrivacyPolicyAgreedAt');
//       // if (agreed && agreedAt) {
//       //   const agreedTime = new Date(agreedAt).getTime();
//       //   const now = new Date().getTime();
//       //   const hours24 = 24 * 60 * 60 * 1000;
//       //   if (now - agreedTime <= hours24) {
//       //     setShowModal(false);
//       //     return;
//       //   } else {
//       //     localStorage.removeItem('UniversityPrivacyPolicyAgreed');
//       //     localStorage.removeItem('UniversityPrivacyPolicyAgreedAt');
//       //   }
//       // }
//     }
//     setShowModal(true);
//   }, [isAuthorized]);

//   const handleAgree = async () => {
//     if (isChecked) {
//       //   const res = await acceptTermsAndConditions();
//       toast.success('Agreed to the terms and conditions');
//       if (typeof window !== 'undefined') {
//         // localStorage.setItem('UniversityPrivacyPolicyAgreed', 'true');
//         // localStorage.setItem(
//         //   'UniversityPrivacyPolicyAgreedAt',
//         //   new Date().toISOString(),
//         // );
//       }
//       setShowModal(false);
//     }
//   };

//   if (!isAuthorized || !showModal) return null;
//   if (userLoading) return <p>Loading...</p>;

//   const safeHTML = DOMPurify.sanitize(policy);

//   return (
//     <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
//       <div className="bg-[#dedede] rounded-xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
//         <h2 className="text-[32px] font-semibold mb-4 text-center">
//           University Privacy Policy
//         </h2>

//         <div
//           className="overflow-y-auto pr-3 mb-4"
//           style={{ maxHeight: '60vh' }}
//         >
//           <section className="text-sm text-gray-800 space-y-6">
//             <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
//           </section>
//         </div>

//         <label className="flex items-start gap-2 text-sm text-gray-700 mb-4 cursor-pointer">
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={(e) => setIsChecked(e.target.checked)}
//             className="mt-1 accent-blue-600"
//           />
//           <span>
//             I have read and agreed to the <strong>Privacy Policy</strong>.
//           </span>
//         </label>

//         <div className="flex justify-end">
//           <button
//             onClick={handleAgree}
//             disabled={!isChecked}
//             className={`px-5 py-2 rounded-md transition text-white ${
//               isChecked
//                 ? 'bg-blue-600 hover:bg-blue-700'
//                 : 'bg-gray-400 cursor-not-allowed'
//             }`}
//           >
//             I Agree
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import { useUI } from '@/contexts/ui.context';
import {
  fetchUniversityPolicy,
  signPolicy,
} from '@/framework/basic-rest/university/dashboardApi';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

export default function UniversityPrivacyModal() {
  const [showModal, setShowModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [policy, setPolicy] = useState<any>();
  const sigCanvasRef = useRef<any>(null);
  const { isAuthorized } = useUI();

  const { data: userData, isLoading: userLoading } = useUserDataQuery();

  const getPolicy = async (
    roleId: string,
    warehouseId: string,
    customerId: string,
  ) => {
    const res = await fetchUniversityPolicy(roleId, warehouseId, customerId);
    setPolicy(res?.policy);
    if (res?.policy?.isSigned) {
      setShowModal(false);
    }
    return res;
  };

  // useEffect(() => {
  //   if (!isAuthorized) {
  //     setShowModal(false);
  //     return;
  //   }
  //   if (typeof window !== 'undefined') {
  //     const agreed = localStorage.getItem('UniversityPrivacyPolicyAgreed');
  //     const agreedAt = localStorage.getItem('UniversityPrivacyPolicyAgreedAt');
  //     if (agreed && agreedAt) {
  //       const agreedTime = new Date(agreedAt).getTime();
  //       const now = new Date().getTime();
  //       const hours24 = 24 * 60 * 60 * 1000;
  //       if (now - agreedTime <= hours24) {
  //         setShowModal(false);
  //         return;
  //       } else {
  //         localStorage.removeItem('UniversityPrivacyPolicyAgreed');
  //         localStorage.removeItem('UniversityPrivacyPolicyAgreedAt');
  //       }
  //     }
  //   }
  //   setShowModal(true);
  // }, [isAuthorized]);

  useEffect(() => {
    if (!userLoading && userData) {
      getPolicy(userData?.role?._id, userData?.warehouse?._id, userData?._id);
    }
  }, [userData, userLoading]);

  useEffect(() => {
    if (!isAuthorized) {
      setShowModal(false);
      return;
    }
    setShowModal(true);
  }, [isAuthorized]);

  // const handleAgree = async () => {
  //   if (isSigned) {
  //     const signatureImage = sigCanvasRef.current
  //       .getTrimmedCanvas()
  //       .toDataURL('image/png');
  //     console.log('User Signature Image Data:', signatureImage); // ✅ You can send this to backend if needed

  //     // Call your API here
  //     toast.success('Agreed to the terms and conditions');
  //     setShowModal(false);
  //   }
  // };

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

  const handleAgree = async () => {
    if (isSigned && sigCanvasRef.current) {
      // 1. Get base64 image data
      const signatureDataURL = sigCanvasRef.current.toDataURL('image/png');
      const signImage = dataURLtoFile(signatureDataURL, 'signature.png');

      // 2. Convert to Blob
      // const blob = await (await fetch(signatureDataURL)).blob();

      // 4. Send to API
      try {
        const response = await signPolicy(policy?._id, signImage);
        console.log('API Response:', response);

        // if (!response.ok) throw new Error('Upload failed');

        toast.success('Signature submitted successfully!');
        // if (typeof window !== 'undefined') {
        //   localStorage.setItem('UniversityPrivacyPolicyAgreed', 'true');
        //   localStorage.setItem(
        //     'UniversityPrivacyPolicyAgreedAt',
        //     new Date().toISOString(),
        //   );
        // }
        setShowModal(false);
      } catch (error) {
        toast.error('Failed to submit signature.');
        console.error(error);
      }
    }
  };

  const handleEnd = () => {
    if (!sigCanvasRef.current.isEmpty()) {
      setIsSigned(true);
    }
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
    setIsSigned(false);
  };

  if (!isAuthorized || !showModal) return null;
  if (userLoading) return <p>Loading...</p>;

  const safeHTML = DOMPurify.sanitize(policy?.content || '');

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-[#dedede] rounded-xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
        <h2 className="text-[32px] font-semibold mb-4 text-center">
          University Privacy Policy
        </h2>

        <div
          className="overflow-y-auto pr-3 mb-4"
          style={{ maxHeight: '60vh' }}
        >
          <section className="text-sm text-gray-800 space-y-6">
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
          </section>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            Please sign below to agree:
          </p>
          <div className="border border-gray-400 rounded bg-white">
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
              ref={sigCanvasRef}
              onEnd={handleEnd}
            />
          </div>
          <button
            onClick={clearSignature}
            className="mt-2 text-blue-600 underline text-sm"
          >
            Clear Signature
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAgree}
            disabled={!isSigned}
            className={`px-5 py-2 rounded-md transition text-white ${
              isSigned
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
