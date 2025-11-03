import Image from 'next/image';
import React from 'react';
import sideImage1 from '@public/assets/images/careers/side-2-c.png';
function TeamSection() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="py-16 mx-8 md:ml-16 lg:ml-24 text-left">
        <h2 className="text-2xl md:text-3xl font-medium mb-4 text-blue-900">
          Join Our Nationwide Team:
        </h2>
        <p className="md:text-lg text-base max-w-[600px] mx-auto mb-6 text-blue-950">
          Join a nationwide team like no other at Chase Up! As a thriving retail
          company with a presence across the nation, we offer the unique
          opportunity to be part of a diverse and dynamic team that spans
          regions and cultures. Whether you're in Karachi, Multan, Faisalabad,
          Gujranwala, Hyderabad or any other city, joining Chase Up means
          becoming part of a community that values collaboration, innovation,
          and excellence.
        </p>
        <button className="relative overflow-hidden bg-red-600 text-white py-2 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg group mt-4">
          <span className="relative z-10 group-hover:text-white transition-colors">
            Join Chase Up
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>
      <div>
        <Image
          src={sideImage1}
          alt="sideImage1"
          width={600}
          height={600}
          className=""
        />
      </div>
    </div>
  );
}

export default TeamSection;
