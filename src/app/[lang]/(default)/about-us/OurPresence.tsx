import React from 'react';

const PresenceSection = () => {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 lg:gap-x-16">
          <div className="pt-8 lg:pt-16">
            {/* Added padding top */}
            <h2 className="text-3xl font-bold text-blue-900 sm:text-4xl mb-6">
              {/* Added margin bottom */}
              Our Presence
            </h2>
            <p className="mt-6 max-w-[400px] leading-relaxed">
              {/* Added margin top and line height */}
              Our business growth strategies focus on expanding our presence in
              every neighborhood by utilizing the market potential with new
              innovative concept of convenience, quality and developing synergic
              business relations with brands.
            </p>
          </div>
          <div className="relative">
            <img
              src="/assets/images/aboutus/map.png"
              alt="Map"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresenceSection;
