'use client';

import React from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { MdClose } from 'react-icons/md';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: any;
  baseApi: string;
}

const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  baseApi,
}) => {
  if (!isOpen || !policy) return null;

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify?.sanitize(policy?.content || '');

  return (
    <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#dedede] rounded-xl shadow-2xl p-6 w-[90%] max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[32px] font-semibold text-gray-900">{policy?.title || "-"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto pr-3 mb-4" style={{ maxHeight: '60vh' }}>
          {/* Policy Image */}
          {policy?.picture && (
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-6">
              <Image
                src={`${baseApi}/${policy?.picture}`}
                alt={policy?.title || '-'}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Policy Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
            <div>
              <p className="font-semibold text-gray-900">Policy Type</p>
              <p className="capitalize">{policy?.policyType}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Version</p>
              <p>{policy?.policyVersion}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Created</p>
              <p>{new Date(policy?.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Last Updated</p>
              <p>{new Date(policy?.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Policy Content (HTML Sanitized) */}
          <section className="text-sm text-gray-800 space-y-6 mb-6">
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
          </section>

          {/* Signed Status */}
          {policy?.isSigned && (
            <div className=" bg-white rounded-lg p-4">
              <p className="text-gray-800 font-semibold text-center">You have signed this policy</p>
              {policy?.picture && (
            <div className="relative w-full h-[300px]  rounded-lg overflow-hidden mb-6">
              <Image
                src={`${baseApi}/${policy?.signedDocumentPath}`}
                alt={policy?.documentUrl || '-'}
                fill
                className="object-contain"
              />
            </div>
          )}
               <div className="flex justify-center items-center">
              <p className="text-gary-800 text-sm font-semibold">
                Signed on: <span className="font-normal">
                   {new Date(policy?.signedAt).toLocaleDateString()}
                  
                  </span>
              </p>
                
                </div> 
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-400 text-white rounded-md font-medium hover:bg-gray-500 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
