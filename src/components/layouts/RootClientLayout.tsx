'use client';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? <LoadingScreen /> : children;
}
