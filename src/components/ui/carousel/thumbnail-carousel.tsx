import {
  Swiper,
  SwiperSlide,
  SwiperOptions,
  Navigation,
  Thumbs,
} from '@components/ui/carousel/slider';
import Image from '@components/ui/image';
import { useRef, useState } from 'react';
import cn from 'classnames';
import { productGalleryPlaceholder } from '@assets/placeholders';
import { getDirection } from '@utils/get-direction';
import { IoIosArrowBack, IoIosArrowForward, IoMdClose } from 'react-icons/io';

interface Props {
  gallery: any[];
  thumbnailClassName?: string;
  galleryClassName?: string;
  lang: string;
}

// product gallery breakpoints
const galleryCarouselBreakpoints = {
  '0': {
    slidesPerView: 4,
  },
};

const swiperParams: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
};

function MagnifierImage({ src, zoom = 2 }: any) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierStyle, setMagnifierStyle] = useState({});
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMagnifierStyle({
      backgroundImage: `url(${src})`,
      backgroundSize: `${width * zoom}px ${height * zoom}px`,
      backgroundPosition: `${x}% ${y}%`,
      left: `${e.clientX - left}px`,
      top: `${e.clientY - top}px`,
      transform: 'translate(-50%, -50%)', // ✅ Always centers the magnifier box
    });
  };

  return (
    <div className="relative w-full h-full cursor-crosshair">
      {/* Product Image */}
      <Image
        ref={imgRef}
        src={src}
        alt="Product"
        fill
        className="mx-auto rounded-lg object-contain"
        priority
        onMouseEnter={() => setShowMagnifier(true)}
        onMouseLeave={() => setShowMagnifier(false)}
        onMouseMove={handleMouseMove}
      />

      {/* Magnifier Lens (Always Centered on Cursor) */}
      {showMagnifier && (
        <div
          className="absolute w-40 h-40 border-2 border-gray-300 rounded-full shadow-lg pointer-events-none"
          style={{
            ...magnifierStyle,
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
          }}
        />
      )}
    </div>
  );
}

const ThumbnailCarousel: React.FC<Props> = ({
  gallery,
  thumbnailClassName = 'xl:w-[480px] 2xl:w-[650px]',
  galleryClassName = 'xl:w-28 2xl:w-[130px]',
  lang,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const dir = getDirection(lang);
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // New for zoom

  const openPreview = (item: any) => {
    setPreviewImage(`${BASE_API}/${item}`);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
    setZoomLevel(1); // Reset zoom
  };

  // console.log(gallery, 'gallery');

  return (
    <>
      <div className="w-full xl:flex xl:flex-row-reverse gap-3">
        <div
          className={cn(
            'w-full xl:ltr:ml-5 xl:rtl:mr-5 mb-2.5 md:mb-3 overflow-hidden rounded-md relative',
            thumbnailClassName,
          )}
        >
          <Swiper
            id="productGallery"
            thumbs={{
              swiper:
                thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
            }}
            modules={[Navigation, Thumbs]}
            navigation={{
              prevEl: prevRef.current!, // Assert non-null
              nextEl: nextRef.current!, // Assert non-null
            }}
            {...swiperParams}
          >
            {gallery?.map((item: any) => (
              <SwiperSlide
                key={`product-gallery-${item.id}`}
                className="flex items-center justify-center "
                onClick={() => openPreview(item)}
              >
                <div className="relative w-[450px] h-[450px]">
                  {/* <MagnifierImage
                    src={`${BASE_API}/${item}` || productGalleryPlaceholder}
                  /> */}
                  <Image
                  src={`${BASE_API}/${item}` || productGalleryPlaceholder}
                  alt={`Product gallery ${item.id}`}
                  // width={450}
                  // height={450}
                  fill
                  className="mx-auto rounded-lg object-conatin"
                  priority
                />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="flex items-center justify-between w-full absolute top-2/4 px-2.5">
            <div
              ref={prevRef}
              className="flex items-center justify-center text-base transition duration-300 transform -translate-y-1/2 rounded-full cursor-pointer w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 lg:text-lg xl:text-xl bg-brand-light hover:bg-brand hover:text-brand-light focus:outline-none shadow-navigation z-10"
            >
              {dir === 'rtl' ? <IoIosArrowForward /> : <IoIosArrowBack />}
            </div>
            <div
              ref={nextRef}
              className="flex items-center justify-center text-base transition duration-300 transform -translate-y-1/2 rounded-full cursor-pointer w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 lg:text-lg xl:text-xl bg-brand-light hover:bg-brand hover:text-brand-light focus:outline-none shadow-navigation z-10"
            >
              {dir === 'rtl' ? <IoIosArrowBack /> : <IoIosArrowForward />}
            </div>
          </div>
        </div>
        {/* End of product main slider */}

        <div className={`shrink-0 ${galleryClassName}`}>
          <Swiper
            id="productGalleryThumbs"
            onSwiper={setThumbsSwiper}
            spaceBetween={0}
            watchSlidesProgress={true}
            freeMode={true}
            observer={true}
            observeParents={true}
            breakpoints={galleryCarouselBreakpoints}
            // className='justify-between'
          >
            {gallery?.map((item: any) => (
              <SwiperSlide
                key={`product-thumb-gallery-${item.id}`}
                className="flex items-center justify-center overflow-hidden transition rounded cursor-pointer hover:opacity-75"
              >
                <Image
                  src={`${BASE_API}/${item}` || productGalleryPlaceholder}
                  alt={`Product thumb gallery ${item.id}`}
                  width={150}
                  height={150}
                  style={{ width: 'auto' }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      {isPreviewOpen && previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <button
            onClick={closePreview}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            <IoMdClose />
          </button>

          {/* Zoom Buttons */}
          <div className="absolute bottom-10 flex gap-4">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}
              className="bg-white text-black px-4 py-1 rounded shadow z-10"
            >
              Zoom In
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 1))}
              className="bg-white text-black px-4 py-1 rounded shadow z-10"
            >
              Zoom Out
            </button>
          </div>

          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-lg shadow-lg transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
      )}
    </>
  );
};

export default ThumbnailCarousel;
