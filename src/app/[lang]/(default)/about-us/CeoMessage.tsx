import React from 'react';

interface CEOMessageProps {
  title?: string;
  message?: string;
  imageUrl?: string;
}

const CEOMessage = ({
  title = "CEO's Message",
  message = "I am delighted to share with you the inspiring journey of Chase Up, a retail venture that has grown to become one of Pakistan's most cherished shopping destinations. \n\n Chase Up was founded with a vision to redefine the retail experience in Pakistan, offering customers a diverse range of high-quality products at unbeatable prices. Our story began with a single store and a commitment to providing exceptional value and service to our customers. \n\n Over the years, Chase Up has evolved into a multi-store retail chain, thanks to the unwavering support of our loyal customers and the dedication of our talented team. Our success is a testament to the trust and confidence that you, our customers, have placed in us.",
  imageUrl = '/assets/images/aboutus/ceo.png',
}: CEOMessageProps) => {
  return (
    <section className="container max-w-6xl mx-auto mt-12 p-6 sm:p-0">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {/* Text Content - Left Side */}
        <div className="w-full lg:w-1/2 space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-blue-900">
            {title}
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Image - Right Side */}
        <div className="w-full lg:w-1/2">
          {/* Main image */}
          <img
            src={imageUrl}
            alt="CEO Portrait"
            className="inset-0 w-full h-full object-cover z-10"
          />
        </div>
      </div>
    </section>
  );
};

export default CEOMessage;
