// 'use client';

// import { motion } from 'framer-motion';

// export default function AppLoader({
//   label = 'Loading, please wait...',
// }: {
//   label?: string;
// }) {
//   return (
//     <div className="flex flex-col items-center justify-center gap-4 py-10 ">
//       {/* Spinner */}
//       <motion.div
//         className="w-12 h-12 border-4  border-blue-300 border-t-transparent rounded-full"
//         animate={{ rotate: 360 }}
//         transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
//       />

//       {/* Text */}
//       <motion.p
//         className="text-sm text-brand-muted"
//         initial={{ opacity: 0.4 }}
//         animate={{ opacity: [0.4, 1, 0.4] }}
//         transition={{ repeat: Infinity, duration: 1.5 }}
//       >
//         {label}
//       </motion.p>
//     </div>
//   );
// }

// 'use client';

// import { motion } from 'framer-motion';

// export default function AppLoader({
//   label = 'Loading, please wait...',
// }: {
//   label?: string;
// }) {
//   return (
//     <div className="flex flex-col items-center justify-center gap-5 py-12">
      
//       {/* Smooth Gradient Ring */}
//       <motion.div
//         className="relative w-14 h-14 rounded-full"
//         style={{
//           background:
//             'conic-gradient(from 0deg, #3A7BD5, #02b290, #3A7BD5)',
//         }}
//         animate={{ rotate: 360 }}
//         transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
//       >
//         <div className="absolute inset-1 bg-white rounded-full" />
//       </motion.div>

//       {/* Animated Text */}
//       <motion.p
//         className="text-sm text-brand-muted tracking-wide"
//         animate={{ opacity: [0.4, 1, 0.4] }}
//         transition={{ duration: 1.4, repeat: Infinity }}
//       >
//         {label}
//       </motion.p>
//     </div>
//   );
// }
'use client';

import { motion } from 'framer-motion';

export default function AppLoader({
  label = 'Loading...',
}: {
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-brand"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <p className="text-xs text-brand-muted">{label}</p>
    </div>
  );
}
