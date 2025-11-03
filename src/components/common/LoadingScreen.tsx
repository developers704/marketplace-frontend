'use client';
import React from 'react';
import { RotatingLines } from "react-loader-spinner";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <RotatingLines
          strokeColor="#000000"
          strokeWidth="3"
          animationDuration="0.75"
          width="80"
          visible={true}
        />
        <span className="text-brand-dark animate-pulse font-semibold">Loading...</span>
      </div>
    </div>
  );
}
