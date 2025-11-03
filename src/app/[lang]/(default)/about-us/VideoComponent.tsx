import React from 'react';

interface VideoHeroProps {
  videoUrl?: string;
  title?: string;
  thumbnailUrl?: string;
}

const VideoHero: React.FC<VideoHeroProps> = ({
  videoUrl,
  title = 'Corporate Video',
  thumbnailUrl,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-0">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">{title}</h2>
      <div className="max-w-4xl h-[400px] relative">
        {!isPlaying && (
          <div className="absolute inset-0 z-10">
            <img
              src={thumbnailUrl || '/assets/images/aboutus/video.png'}
              alt="Video thumbnail"
              className="w-full h-full object-cover rounded-xl"
            />
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 p-6 rounded-full"
            >
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2" />
            </button>
          </div>
        )}
        {isPlaying && (
          <iframe
            src="https://www.youtube.com/embed/SniA8cWgQAc?si=4ZsIygtfFtHR9m_R&autoplay=1"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-xl"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default VideoHero;
