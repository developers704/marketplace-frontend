'use Effect';
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious, // Ensure this is imported correctly
// } from '@/components/ui/carousel-shadcn';

// const NewCarousel = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <Carousel>
//       <CarouselContent>
//         <CarouselItem>{children}</CarouselItem>
//       </CarouselContent>
//       <CarouselPrevious />
//       <CarouselNext />
//     </Carousel>
//   );
// };

// export default NewCarousel;

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const NewCarousel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slidesToScroll, setSlidesToScroll] = useState(3); // Set default to 3

  // Update slidesToScroll based on screen size
  const updateSlidesToScroll = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setSlidesToScroll(2); // Small screens, scroll 2 slides at a time
    } else {
      setSlidesToScroll(3); // Medium screens and above, scroll 3 slides at a time
    }
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: slidesToScroll,
  });

  // Function to update the active index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Auto-play functionality with proper interval cleanup
  useEffect(() => {
    if (!emblaApi) return;
    const autoplayInterval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000); // Scroll every 4 seconds

    emblaApi.on('select', onSelect); // Listen for slide changes

    return () => {
      clearInterval(autoplayInterval); // Clear interval when component unmounts or re-renders
    };
  }, [emblaApi, onSelect]);

  // Listen to screen resize and update slidesToScroll
  useEffect(() => {
    updateSlidesToScroll(); // Set initial value based on screen width
    window.addEventListener('resize', updateSlidesToScroll); // Update on resize

    return () => window.removeEventListener('resize', updateSlidesToScroll); // Cleanup
  }, [updateSlidesToScroll]);

  const totalDots = Math.ceil(React.Children.count(children) / 3);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex space-x-3">{children}</div>
      {/* Dots below the carousel */}
      <div className="md:flex justify-center space-x-2 mt-4 hidden">
        {Array.from({ length: totalDots }).map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              selectedIndex === index ? 'bg-brand-button-hover' : 'bg-gray-300'
            }`}
            aria-label={`Go to group ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewCarousel;
