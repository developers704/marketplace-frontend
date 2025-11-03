'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiDownload } from 'react-icons/fi';
import SignaturePad from '@/components/university/SignCanvas';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { fetchUserCertificate } from '@/framework/basic-rest/university/dashboardApi';

const CertificatePage = () => {
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUserDataQuery();

  // console.log(userData, 'userData');
  const [signature, setSignature] = useState<any>(null);
  const [certificateStatus, setCertificateStatus] = useState<any>();
  const [presidentSignature, setPresidentSignature] = useState<any>();
  const [isCertificateApproved, setIsCertificateApproved] = useState<any>();
  const [usernamePostion, setUsernamePostion] = useState<any>('300px');
  const certificateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const { courseId } = params as { courseId: string };
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const userName = userData?.username;

  const downloadPDF = async () => {
    setUsernamePostion('270px');
    if (certificateRef.current) {
      // ✅ Dynamically import here
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: 'certificate.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: 'px',
          format: [1122, 793],
          orientation: 'landscape',
        },
      };

      html2pdf()
        .set(opt)
        .from(certificateRef.current)
        .save()
        .then(() => {
          setUsernamePostion('300px');
        });
    }
  };

  const getCertificate = async () => {
    const res = await fetchUserCertificate(courseId);
    if (res?.success) {
      if (res?.data?.status === 'Approved') {
        setIsCertificateApproved('Approved');
        setPresidentSignature(
          `${BASE_API}/${res?.data?.signatures?.presidentSignaturePath}`,
        );
        setSignature(`${BASE_API}/${res?.data?.signatures?.userSignaturePath}`);
      } else if (res?.data?.status === 'Requested') {
        setIsCertificateApproved('Requested');
        // setUserSignature(`${BASE_API}/${res?.data?.signatures?.userSignaturePath}`);
      }
    } else {
      setIsCertificateApproved('Not Requested');
    }
    // console.log(res, 'from certificate api');
  };
  // console.log(certificateStatus, "certificateStatus")
  useEffect(() => {
    getCertificate();
  }, []);

  return (
    <div className="p-10">
      {isCertificateApproved === 'Not Requested' ? (
        <SignaturePad
          onSave={(dataUrl) => setSignature(dataUrl)}
          username={userData?.username}
          setCertificateStatus={setCertificateStatus}
        />
      ) : isCertificateApproved === 'Approved' ? (
        <div className="bg-white rounded-xl shadow-md py-8">
          <div
            ref={certificateRef}
            style={{
              width: '1122px',
              height: '793px',
              position: 'relative',
              backgroundImage:
                'url(/assets/images/Certificates/CertificateHighRes.jpg)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {/* Name Position */}
            <div
              style={{
                position: 'absolute',
                top: usernamePostion,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '75px',
                letterSpacing: '8px',
                fontWeight: 'bold',
                color: '#A8772B',
                // fontFamily: 'Dancing Script',
              }}
              className="capitalize"
            >
              {userName}
            </div>

            {/* Signature Position */}
            <div
              style={{
                position: 'absolute',
                bottom: '200px',
                right: '200px',
                textAlign: 'center',
              }}
            >
              <img src={signature} alt="Signature" style={{ height: '80px' }} />
            </div>

            {/* Presedent Signature Position */}
            <div
              style={{
                position: 'absolute',
                bottom: '200px',
                left: '200px',
                textAlign: 'center',
              }}
            >
              <img
                src={presidentSignature}
                alt="Signature"
                style={{ height: '80px' }}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-around gap-10 w-full">
            <button
              className="bg-[#1935CA] text-white text-[20px] rounded-lg px-4 py-2"
              onClick={() => router.back()}
            >
              Back
            </button>
            <button
              onClick={downloadPDF}
              className="bg-[#75BD7A] text-white text-[20px] rounded-lg px-4 py-2 flex items-center gap-3"
            >
              <FiDownload /> Download
            </button>
          </div>
        </div>
      ) : (
        isCertificateApproved === 'Requested' && (
          <>
            <div>
              <p>
                Your certificate is under review. Please wait for the approval.
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default CertificatePage;
