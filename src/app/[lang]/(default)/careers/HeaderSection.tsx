import React from 'react';
import bgImage from '@public/assets/images/careers/bg-main.png';

function HeaderSection() {
  return (
    <div
      className="bg-cover bg-center text-white py-20"
      style={{ backgroundImage: `url(${bgImage.src})` }}
    >
      <div className="max-w-[700px] mx-8 md:mx-16 lg:mx-24 text-left">
        <h2 className="md:text-3xl font-bold mb-4 text-2xl">Careers:</h2>
        <p className="md:text-lg text-base leading-relaxed">
          Welcome to Chase Up, where passion meets purpose in the dynamic world
          of retail! At Chase Up, we don't just sell products; we curate
          experiences that resonate with our diverse clientele. As a leading
          retail company committed to excellence, we are constantly seeking
          talented individuals who share our vision and are eager to make a
          difference in the retail landscape.
        </p>
      </div>
    </div>
  );
}

export default HeaderSection;
