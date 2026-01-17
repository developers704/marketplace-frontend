'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiDownload } from 'react-icons/fi';
import SignaturePad from '@/components/university/SignCanvas';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { fetchUserCertificate } from '@/framework/basic-rest/university/dashboardApi';
import { useGetCourseQuery } from '@/framework/basic-rest/courses/get-course-by-id';
import { useGetCourseProgressQuery } from '@/framework/basic-rest/university/dashboardApi';

const CertificatePage = () => {
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useUserDataQuery();

  const {
    data: progressData,
  } = useGetCourseProgressQuery();

  // console.log(userData, 'userData');
  const [signature, setSignature] = useState<any>(null);
  const [certificateStatus, setCertificateStatus] = useState<any>();
  const [presidentSignature, setPresidentSignature] = useState<any>();
  const [isCertificateApproved, setIsCertificateApproved] = useState<any>();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [usernamePostion, setUsernamePostion] = useState<any>('300px');
  const certificateRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const { courseId } = params as { courseId: string };
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const programStats = progressData?.data?.summary?.programStats;
  const anchorCourseId = programStats?.anchorCourseId;

  // const userName = userData?.username;

  const downloadPDF = async () => {
    setUsernamePostion('270px');
    if (certificateRef.current) {
      // ✅ Dynamically import here
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: `certificate-${courseData?.name || 'certificate'}.pdf`,
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
      setCertificateData(res?.data);
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

  useEffect(() => {
    getCertificate();
  }, []);

  // Extract course data from progress data
  useEffect(() => {
    if (progressData?.data?.mainCourses) {
      const course = progressData?.data?.mainCourses.find(
        (c: any) => c?._id === courseId
      );
      if (course) {
        setCourseData(course);
        // console.log('Course Data:', course);
      }
    }
  }, [progressData, courseId]);

  // ✅ Program-level certificate: always use anchor course (final course)
  useEffect(() => {
    if (!anchorCourseId || !courseId) return;
    if (anchorCourseId.toString() !== courseId.toString()) {
      router.replace(`/valliani-university/achievements/certificate/${anchorCourseId}`);
    }
  }, [anchorCourseId, courseId, router]);

  return (
    <div className="p-10">
      {programStats?.requiresShortCourses ? (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Certificate not available yet</h2>
          <p className="text-gray-600">
            Your overall program score is below the passing criteria. Please complete the required short courses and retake quizzes.
          </p>
          <button
            onClick={() => router.push('/valliani-university/achievements')}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-brand-blue text-white hover:bg-blue-700 transition"
          >
            Back to Achievements
          </button>
        </div>
      ) : isCertificateApproved === 'Not Requested' ? (
        <SignaturePad
          onSave={(dataUrl) => setSignature(dataUrl)}
          username={userData?.username}
          setCertificateStatus={setCertificateStatus}
        />
      ) : isCertificateApproved === 'Approved' ? (
        <div className="flex flex-col justify-center items-center rounded-xl shadow-md py-8">
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
                fontSize: '40px',
                letterSpacing: '8px',
                fontWeight: 'bold',
                color: '#A8772B',
                // fontFamily: 'Dancing Script',
              }}
              className="capitalize"
            >
              {userData?.username || 'Student'}
            </div>

            {/* Course Name Position */}
            {courseData?.name && (
              <div
                style={{
                  position: 'absolute',
                  top: '360px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '16px',
                  letterSpacing: '2px',
                  fontWeight: '600',
                  color: '#4B5563',
                  textAlign: 'center',
                  maxWidth: '900px',
                }}
              >
                {courseData?.name || "-"}
              </div>
            )}

            {/* Grade and Percentage Position */}
            {(courseData?.gradeLabel || courseData?.gradePercentage) && (
              <div
                style={{
                  position: 'absolute',
                  top: '390px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                {courseData?.gradeLabel && (
                  <span style={{ marginRight: '20px' }}>
                    Grade: <strong style={{ color: '#A8772B' }}>{courseData?.gradeLabel || "-"}</strong>
                  </span>
                )}
                {courseData?.gradePercentage && (
                  <span>
                    Score: <strong style={{ color: '#A8772B' }}>{courseData?.gradePercentage || "-"}%</strong>
                  </span>
                )}
              </div>
            )}

            {/* Certificate ID Position */}
            {certificateData?.requestId?.certificateId && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '120px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#9CA3AF',
                  textAlign: 'center',
                }}
              >
                Certificate ID: {certificateData?.requestId?.certificateId}
              </div>
            )}

            {/* Date Position */}
            {certificateData?.requestId?.reviewedAt && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#9CA3AF',
                  textAlign: 'center',
                }}
              >
                Issued on: {new Date(certificateData.requestId.reviewedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}

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
              className="bg-[#374dcc] text-white text-[20px] rounded-lg px-4 py-2"
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
