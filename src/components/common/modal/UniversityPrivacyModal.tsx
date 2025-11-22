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

interface Policy {
  _id: string;
  title: string;
  policyType?: string;
  content: string;
  version?: number;
  picture?: string;
  isActive?: boolean;
  showFirst?: boolean;
  sequence?: number;
  applicableRoles?: Array<{ _id: string; role_name: string }>;
  applicableWarehouses?: Array<{ _id: string; name: string; location: string }>;
  forceForUsers?: any[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  isSigned?: boolean; 
}

export default function UniversityPrivacyModal() {
  const [showModal, setShowModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);
  const [warehouse, setWarehouse] = useState<any>();
  // const [modalShown, setModalShown] = useState(false);

  const sigCanvasRef = useRef<any>(null);
  const { isAuthorized, user, setUser } = useUI();

  // console.log("policy set in ke lengtj", policies.length);
  const currentPolicy = policies[currentPolicyIndex];
  
  console.log("current policy ke length currentPolicy", currentPolicy);
  console.log('isAuthorized:', isAuthorized, 'showModal:', showModal, 'warehouse:', warehouse);
console.log('currentPolicyIndex:', currentPolicyIndex, 'currentPolicy:', currentPolicy);

  const { data: userData, isLoading: userLoading } = useUserDataQuery();
  // console.log("user data is here in uni",user);

  // console.log("warehouses data in uni ",warehouse);
  
  

useEffect(() => {
  if (!userLoading) {
    const savedWarehouse = localStorage.getItem('selectedWarehouse');

    if (savedWarehouse) {
      try {
        const parsedWarehouse = JSON.parse(savedWarehouse);
        setWarehouse(parsedWarehouse);
      } catch (error) {
        console.error("Failed to parse saved warehouse:", error);
        setWarehouse(null);
      }
    } else {
      console.warn("No saved warehouse found in localStorage.");
      setWarehouse(null);
    }
  }
}, [userLoading]);
  

const getPolicy = async (
    roleId: string,
    warehouseId: string,
    customerId: string,
  ) => {
    if (!roleId || !warehouseId || !customerId) {
    console.warn("Missing parameters", { roleId, warehouseId, customerId });
    return;
  }

    console.log("fetching uni policy with ", roleId, warehouseId, customerId);
    const res : { pending : Policy[] }= await fetchUniversityPolicy();
    console.log("uni response here ",res);
    
    const pendingPolicies : Policy[] = (res.pending  || []).filter(p => p.isActive && !p.isSigned);
    
    setPolicies(pendingPolicies);  
    setCurrentPolicyIndex(0);
    if (pendingPolicies.length === 0) {
      setShowModal(false);
    }
    return res;
  };

  useEffect(() => {
    if (!userLoading && userData && warehouse?._id) {
      getPolicy(userData?.role?._id, warehouse?._id, userData?._id);
    }
  }, [userData, userLoading, warehouse]);


  
useEffect(() => {
  if (isAuthorized && policies.length > 0) {
    setShowModal(true);
  } else {
    setShowModal(false);
  }
}, [isAuthorized, policies]);



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

      try {
        const response = await signPolicy(currentPolicy?._id, signImage);
        // console.log('API Response:', response);


        toast.success(response?.data?.message || "Policy  signed successfully!");
   
        if (currentPolicyIndex < policies.length - 1) {
        setCurrentPolicyIndex(prev => prev + 1);
        clearSignature(); 
      } else {
        setShowModal(false);
      }
      } catch (error : any) {
        toast.error(error.response?.data?.message || 'Failed to submit signature.');
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

  const safeHTML = DOMPurify.sanitize(currentPolicy?.content || '');

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
        Policy {currentPolicyIndex + 1} of {policies.length}: Please sign below to agree:
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
