import { DotLoader } from 'react-spinners';

const LoadingComp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <DotLoader
        color="#6f4e37"
        size={65}
        speedMultiplier={1.4}
      />
      <span className="mt-4 text-lg font-semibold text-[#6f4e37]  animate-pulse">
        please wait...
      </span>
    </div>
  );
};

export default LoadingComp;
