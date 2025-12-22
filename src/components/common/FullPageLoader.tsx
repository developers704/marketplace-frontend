'use client';

import { motion } from 'framer-motion';

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        className="w-14 h-14 border-4 border-brand border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
    </div>
  );
}
