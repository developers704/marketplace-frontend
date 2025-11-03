import React from 'react';

function StatsSection() {
  return (
    <>
      <div className="mx-8 md:ml-16 lg:ml-24 text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-medium mb-4 text-blue-900">
          We Are Flourishing
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 w-full hover:cursor-pointer">
        <div className="group flex flex-col items-center justify-center py-16 px-8 bg-red-700 text-white transition-all duration-500 hover:bg-red-800 overflow-hidden relative">
          <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
            <h3 className="text-4xl font-bold mb-3 group-hover:scale-110 transition-all">
              3500+
            </h3> 
            <p className="text-2xl font-medium group-hover:text-yellow-200">
              Employees
            </p>
            <p className="text-lg opacity-90 mt-2 group-hover:text-yellow-100">
              Nationwide
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-red-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        </div>

        <div className="group flex flex-col items-center justify-center py-16 px-8 bg-blue-800 text-white transition-all duration-500 hover:bg-blue-900 overflow-hidden relative">
          <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
            <h3 className="text-4xl font-bold mb-3 group-hover:scale-110 transition-all">
              19+
            </h3>
            <p className="text-2xl font-medium group-hover:text-blue-200">
              Stores
            </p>
            <p className="text-lg opacity-90 mt-2 group-hover:text-blue-100">
              Across Pakistan
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        </div>

        <div className="group flex flex-col items-center justify-center py-16 px-8 bg-red-700 text-white transition-all duration-500 hover:bg-red-800 overflow-hidden relative">
          <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
            <h3 className="text-4xl font-bold mb-3 group-hover:scale-110 transition-all">
              20+
            </h3>
            <p className="text-2xl font-medium group-hover:text-yellow-200">
              Own Brands
            </p>
            <p className="text-lg opacity-90 mt-2 group-hover:text-yellow-100">
              And Growing
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-red-900 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
        </div>
      </div>
    </>
  );
}

export default StatsSection;
