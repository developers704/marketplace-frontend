import React, { useState } from 'react';

interface ToggleSwitchProps {
  initialState?: boolean;
  onChange?: (state?: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  initialState = false,
  onChange,
}) => {
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onChange) {
      onChange(newState); // Optional callback when the switch is toggled
    }
  };

  return (
    <div className="flex items-center">
      {/* <span className={`mr-2 ${isOn ? "text-green-500" : "text-gray-500"}`}>
        {isOn ? "ON" : "OFF"}
      </span> */}
      <button
        onClick={toggleSwitch}
        className={`relative inline-flex items-center cursor-pointer w-10 h-6 rounded-full transition-all duration-300 ease-in-out ${
          isOn ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${
            isOn ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
