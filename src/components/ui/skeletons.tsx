import React from 'react';
import Container from './container';

export const CategoriesSkeletons = () => {
  return (
    <Container>
      <div className="w-[350px] h-[50px] bg-gray-200 rounded-md animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
          <div
            key={index}
            className="w-[180px] h-[200px] bg-gray-200 rounded-md animate-pulse mt-5"
          ></div>
        ))}
      </div>
    </Container>
  );
};

export const ItemListSkeletons = () => {
  return (
    <Container>
      <div className="w-[350px] h-[50px] bg-gray-200 rounded-md animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
          <div
            key={index}
            className="w-[180px] h-[200px] bg-gray-200 rounded-md animate-pulse mt-5"
          ></div>
        ))}
      </div>
    </Container>
  );
};

export const SingleCardSkeletons = () => {
  return (
    <Container>
      {/* <div className="w-[350px] h-[50px] bg-gray-200 rounded-md animate-pulse"></div> */}
      <div className="w-[180px] h-[200px] bg-gray-200 rounded-md animate-pulse mt-5"></div>
    </Container>
  );
};

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm h-[130px] flex items-center gap-4 w-full animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="w-24 h-3 bg-gray-200 rounded" />
        <div className="w-32 h-5 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export function SkeletonLoaderTable() {
  const rows = Array(5).fill(0); // 5 skeleton rows

  return (
    <div className="w-full py-6 animate-pulse">
      <table className="w-full rounded-lg">
        <thead>
          <tr className="border-b bg-[#666665CC] text-white">
            <th className="text-left p-3">Course</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Weight</th>
            <th className="text-left p-3">Grade</th>
            <th className="text-left p-3">Certificate</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((_, idx) => (
            <tr key={idx} className="border-b">
              {/* Course */}
              <td className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="p-3">
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </td>

              {/* Weight */}
              <td className="p-3">
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
              </td>

              {/* Grade */}
              <td className="p-3">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
              </td>

              {/* Certificate Icons */}
              <td className="p-3">
                <div className="flex space-x-3">
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                  <div className="h-5 w-5 bg-gray-300 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InfoBoxSkeleton() {
  return (
    <div className="max-w-md bg-gray-50 rounded-lg animate-pulse">
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="mb-6 last:mb-0 bg-white p-4 rounded-lg shadow-sm"
        >
          {/* Title & View All */}
          <div className="flex justify-between items-center mb-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>

          {/* List Items */}
          <div className="p-3 space-y-4">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-start space-x-3 border-b border-gray-100 pb-3"
              >
                <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex-shrink-0" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-36 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-10 bg-gray-200 rounded ml-2 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export const NewProductSkeletons = () => {
  return (
    <Container>
      <div className="w-[150px] h-6 bg-gray-200 rounded-md animate-pulse mt-5"></div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((item, index) => (
          <div
            key={index}
            className="w-[260px] h-[400px] bg-gray-200 rounded-md animate-pulse mt-5"
          ></div>
        ))}
      </div>
    </Container>
  );
};

export const SpecialProductSkeletons = () => {
  return (
    <Container>
      <div className="flex justify-between items-center">
        <div className="w-[150px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div>
        <div className="w-[300px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item, index) => (
          <div
            key={index}
            className="w-[350px] h-[400px] bg-gray-200 rounded-md animate-pulse mt-5"
          ></div>
        ))}
      </div>
    </Container>
  );
};

export const SingleSpecialProductSkeletons = () => {
  return (
    <Container>
      <div className="flex flex-col md:flex-row justify-between gap-7">
        <div className="w-[630px] h-[420px] bg-gray-200 rounded-md animate-pulse mt-5"></div>
        <div className="flex flex-col flex-1 col-span-5 shrink-0 xl:col-span-4 xl:ltr:pl-2 xl:rtl:pr-2 p-6 justify-center gap-5 ml-5">
          <div className="w-[150px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div>
          <div className="w-[100px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div>
          {/* <div className="w-[130px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div> */}
          <div className="w-[300px] h-10 bg-gray-200 rounded-md animate-pulse mt-5"></div>
        </div>
      </div>
    </Container>
  );
};

export const OrderSkeleton = () => {
  return (
    <Container>
      <div id="container" className="p-3 border-b-[3px] animate-pulse">
        <div id="top" className="flex lg:w-[70vw] items-center">
          <div className="flex-[4] w-1/4 gap-5 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="py-[5px] px-[10px] bg-gray-300 border rounded w-24 h-6"></div>
              <div className="w-40 h-6 bg-gray-300 rounded"></div>
            </div>

            {/* Skeleton Items */}
            {[...Array(1)].map((_, index) => (
              <div
                key={index}
                className="flex-1 w-full flex items-center gap-4"
              >
                <div className="w-[80px] h-[80px] bg-gray-300 rounded"></div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                  <div className="w-20 h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="flex-1 w-full text-center h-4 bg-gray-300 rounded"></div>
                <div className="flex-1 w-full text-center h-4 bg-gray-300 rounded"></div>
                <div className="flex-1 w-full text-center h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
          <div
            id="btnList"
            className="flex-1 flex flex-col items-center gap-3 justify-center"
          >
            <div className="bg-gray-300 text-white font-semibold rounded-lg mt-10 px-5 py-3 w-[220px] h-8"></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-6 pt-5">
          <div className="w-40 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </Container>
  );
};

export const ProductListSkeleton = () => {
  return (
    <Container>
      <section className="my-10 animate-pulse">
        {/* Top Section Skeleton */}
        <div id="top" className="flex items-center justify-between mb-5">
          <div className="leftSide w-40 h-8 bg-gray-300 rounded"></div>
          <div className="rightSide w-60 h-10 bg-gray-300 rounded"></div>
        </div>

        {/* Bottom Section Skeleton */}
        <div id="bottom" className="flex flex-col md:flex-row gap-5 mt-10">
          {/* Filter Container Skeleton */}
          <div id="filterContainer" className="flex flex-col flex-1 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-full h-10 bg-gray-300 rounded"
              ></div>
            ))}
          </div>

          {/* Product List Skeleton */}
          <div
            id="itemListContainer"
            className="flex-[3] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {[...Array(4)].map((_, index) => (
              <div key={index} className="p-4 bg-white shadow-md rounded-lg">
                <div className="w-full h-40 bg-gray-300 rounded"></div>
                <div className="mt-4 w-3/4 h-6 bg-gray-300 rounded"></div>
                <div className="mt-2 w-1/2 h-4 bg-gray-300 rounded"></div>
                <div className="mt-4 w-full h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
};

// export default Skeletons;
