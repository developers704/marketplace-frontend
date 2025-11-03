import Image from 'next/image';
import React from 'react';
import sideImage2 from '@public/assets/images/careers/side-1.png';

function JourneySection() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="py-16 mx-8 md:ml-16 lg:ml-24 text-left">
        <h2 className="text-2xl md:text-3xl font-medium mb-4 text-blue-900">
          Launching Your Career with Chase Up:
        </h2>
        <h3 className="text-xl text-blue-900 font-semibold mb-4">
          Your journey starts here
        </h3>
        <p className="md:text-lg text-base max-w-[600px] mx-auto mb-6 text-blue-950">
          At Chase Up, we believe in empowering the next generation of talent to
          reach their full potential. As you embark on your career journey,
          there's no better place to start than with us. Whether you're a recent
          graduate eager to kickstart your career or a young professional
          seeking new challenges, Chase Up offers a range of opportunities to
          ignite your passion and drive your ambitions forward.
        </p>
      </div>
      <div className="mt-10 ml-6">
        <Image
          src={sideImage2}
          alt="side"
          height={400}
          width={450}
          className="w-80 mx-auto h-80 p-2"
        />
      </div>
    </div>
  );
}

export default JourneySection;
