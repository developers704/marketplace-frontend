'use client';
// components/LocationSelector.tsx
import React, { useState } from 'react';
import { MdLocationPin } from 'react-icons/md';
import { IoMdArrowDropdown, IoMdClose } from 'react-icons/io';
import { useLocation } from '@/contexts/LocationContext';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  isInitialSelection?: boolean;
}

const LocationSelector = ({
  isInitialSelection = false,
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(isInitialSelection);
  const {
    location,
    setLocation,
    isInitialLocationSet,
    setIsInitialLocationSet,
  } = useLocation();

  const handleLocationSelect = () => {
    if (location.city) {
      if (isInitialSelection) {
        setIsInitialLocationSet(true);
      }
      setIsOpen(false);
    }
  };

  const handleCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );

        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );

        const data = await response.json();

        if (data.address?.city) {
          setLocation({ city: data.address.city });
        } else if (data.address?.town) {
          setLocation({ city: data.address.town });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      }
    }
  };

  return (
    <>
      {!isInitialSelection && (
        <div className="min-w-[140px] sm:min-w-[160px] md:min-w-[180px]">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-start space-x-2 p-2 sm:p-3 text-left md:mx-4"
          >
            <MdLocationPin size={22} />
            <div className="flex flex-col min-w-0">
              <span className="flex items-center whitespace-nowrap">
                <h1 className="text-xs sm:text-sm md:text-base font-medium hover:underline-offset-2 hover:underline">
                  Deliver to
                </h1>
                <IoMdArrowDropdown className="self-center md:ml-1" />
              </span>
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                {location.city || 'Select City'}
              </span>
            </div>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-center items-center p-4 relative">
              <img
                src="/assets/images/chaselogo.png"
                alt="Chase Up Logo"
                className="h-12"
              />
              {!isInitialSelection && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-4 text-gray-500 hover:text-gray-700"
                >
                  <IoMdClose size={24} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-center">
                Select your order type
              </h2>

              <div className="flex justify-center">
                <button className="w-2/5 bg-[#3f51b5] text-white py-2 px-4 rounded-md hover:bg-[#324090]">
                  DELIVERY
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-center">
                  Please select your location
                </h3>
                <button
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200"
                  onClick={handleCurrentLocation}
                >
                  <MapPin className="h-5 w-5" />
                  <span>Use Current Location</span>
                </button>

                <div className="relative">
                  <select
                    className="w-full p-3 border rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={location.city}
                    onChange={(e) => setLocation({ city: e.target.value })}
                  >
                    <option value="">Select City</option>
                    <option value="Multan">Multan</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                  </select>
                  <IoMdArrowDropdown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                </div>

                <button
                  onClick={handleLocationSelect}
                  disabled={!location.city}
                  className={`w-full py-3 px-4 rounded-md text-white transition-colors
                    ${
                      location.city
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationSelector;
