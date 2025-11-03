import { CSSProperties } from 'react';
import { DotLoader } from 'react-spinners';

const LoadingComp = () => {
  const override: CSSProperties = {
    display: 'block',
    margin: '0 auto',
    borderColor: 'red',
  };

  return (
    <>
      <DotLoader
        color="red"
        cssOverride={override}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
        speedMultiplier={1}
      />
    </>
  );
};
export default LoadingComp;
