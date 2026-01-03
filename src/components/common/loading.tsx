import { DotLoader } from 'react-spinners';

const LoadingComp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <DotLoader
        color="#6366F1"
        size={65}
        speedMultiplier={1.4}
      />
      <span className="mt-4 text-lg font-semibold bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent animate-pulse">
        please wait...
      </span>
    </div>
  );
};

export default LoadingComp;
