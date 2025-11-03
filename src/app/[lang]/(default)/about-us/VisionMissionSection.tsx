// VisionSection.tsx
import React from 'react';
import Image from 'next/image';

const VisionSection: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto p-6 gap-8">
      <div className="md:w-1/2  md:max-w-96 mx-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 lg:text-3xl">
          Our Vision
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Providing customers with a one-stop shopping experience for a variety
          of products, from clothing and accessories to home goods and
          electronics, making shopping more convenient.
        </p>
      </div>
      <div className="md:w-1/2 relative h-64 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent z-10" />
        <Image
          src="/assets/images/aboutus/vision.png" // Update with your actual image path
          alt="Vision representation"
          fill
          className="object-cover rounded-lg"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-red-500 rounded-full z-20 animate-pulse" />
      </div>
    </div>
  );
};

// MissionSection.tsx
const MissionSection: React.FC = () => {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto p-6 gap-8 mt-9">
      <div className="md:w-1/2 relative h-64 w-full">
        <div className="absolute inset-0 bg-gradient-to-l from-red-500/20 to-transparent z-10" />
        <Image
          src="/assets/images/aboutus/mission.png" // Update with your actual image path
          alt="Mission representation - hands joined together"
          fill
          className="object-cover rounded-lg grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent mix-blend-overlay" />
      </div>
      <div className="md:w-1/2 md:max-w-96 mx-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 lg:text-3xl">
          Our Mission
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Providing customers with a one-stop shopping experience for a variety
          of products, from clothing and accessories to home goods and
          electronics, making shopping more convenient.
        </p>
      </div>
    </div>
  );
};

export { VisionSection, MissionSection };
