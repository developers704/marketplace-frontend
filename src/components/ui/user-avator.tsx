// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Camera, Edit2 } from 'lucide-react';

// interface UserAvatarProps {
//   initialImageUrl?: string | null;
//   // onUpload?: (file: File) => void;
//   size?: 'sm' | 'md' | 'lg';
//   alt?: string;
//   className?: string;
// }

// const UserAvatar: React.FC<UserAvatarProps> = ({
//   initialImageUrl = null,
//   // onUpload,
//   size = 'md',
//   alt = 'User avatar',
//   className = '',
// }) => {
//   // State for managing image preview
//   const [imagePreview, setImagePreview] = useState<string | null>(
//     initialImageUrl,
//   );

//   // console.log(initialImageUrl, '===>>> initialImageUrl initialImageUrlpreview');
//   // console.log(imagePreview, '===>>> image preview');

//   // useEffect(()=>{
//   //   setImagePreview(initialImageUrl);
//   // },[initialImageUrl])

//   // Size configuration
//   const sizeConfig = {
//     sm: { containerSize: 'w-10 h-10', iconSize: 16 },
//     md: { containerSize: 'w-16 h-16', iconSize: 24 },
//     lg: { containerSize: 'w-24 h-24', iconSize: 32 },
//   };

//   const handleImageUpload = (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ): any => {
//     //   const file = event.target.files?.[0];
//     //   if (file) {
//     //     // Create preview URL for immediate display
//     //     const previewUrl = URL.createObjectURL(file);
//     //     setImagePreview(previewUrl);

//     //     // Call the parent's onUpload handler
//     //     onUpload(file);

//     //     // Clean up the preview URL when component unmounts
//     //     return () => URL.revokeObjectURL(previewUrl);
//     //   }
//     // };

//     // const triggerFileInput = () => {
//     //   const input = document.createElement('input');
//     //   input.type = 'file';
//     //   input.accept = 'image/*';
//     //   input.onchange = (e) => {
//     //     const target = e.target as HTMLInputElement;
//     //     if (target.files?.[0]) {
//     //       handleImageUpload({ target } as React.ChangeEvent<HTMLInputElement>);
//     //     }
//     //   };
//     //   input.click();
//     // };

//     return (
//       <div className="relative">
//         <div
//           className={`relative rounded-full overflow-hidden cursor-pointer group 
//           ${sizeConfig[size].containerSize} ${className} bg-gray-100`}
//           // onClick={triggerFileInput}
//           role="button"
//           tabIndex={0}
//           // onKeyDown={(e) => {
//           //   if (e.key === 'Enter' || e.key === ' ') {
//           //     triggerFileInput();
//           //   }
//           // }}
//         >
//           {imagePreview ? (
//             // Show uploaded/existing image
//             <div className="relative w-full h-full">
//               <img
//                 src={imagePreview}
//                 alt={alt}
//                 className="w-full h-full object-cover rounded-full"
//               />
//               {/* Edit overlay on hover */}
//               <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
//                 <Edit2
//                   className="text-white mb-1"
//                   size={sizeConfig[size].iconSize}
//                 />
//                 <span className="text-white text-xs">Edit</span>
//               </div>
//             </div>
//           ) : (
//             // Show placeholder with upload icon
//             <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 group-hover:bg-gray-300 transition-colors">
//               <Camera
//                 className="text-gray-400 mb-1"
//                 size={sizeConfig[size].iconSize}
//               />
//               <span className="text-gray-400 text-xs">Upload</span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };
// };

// export default UserAvatar;
