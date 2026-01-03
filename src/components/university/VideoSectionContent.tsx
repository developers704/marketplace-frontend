'use client';
import React, { useEffect, useState } from 'react';
import VideoPlayer from './video-player';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { toast } from 'react-toastify';

const VideoSectionContent = ({
  videoId,
  content,
  setWatchedDuration,
  videoReactionHandler,
  refetchSectionData,
}: any) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<Record<number, boolean>>(
    {},
  );
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const handleVideoComplete = () => {
    setWatchedVideos((prev) => ({ ...prev, [currentVideo]: true }));
  };

 useEffect(() => {
  if (!content || !videoId) return;

  const video = content.find((v: any) => v?._id === videoId);

  if (!video) return;

  setSelectedVideo(video);
  setLikes(video?.likes || 0);
  setDislikes(video?.dislikes || 0);
}, [videoId, content]);

  const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play();
  };


const likeHandler = async () => {
  playSound('/sounds/like-sound.mp3');

  setLikes((prevLikes) => {
    if (liked) return Math.max(prevLikes - 1, 0); // never below 0
    return prevLikes + 1;
  });

  setLiked((prev) => !prev);

  if (disliked) {
    setDislikes((prevDislikes) => Math.max(prevDislikes - 1, 0));
    setDisliked(false);
  }

  try {
    const res = await videoReactionHandler('like');
    if (!res?.success) {
      toast.error('Could not like the video');
      // optionally refetch likes from server
    }
  } catch (err) {
    toast.error('Something went wrong');
  }
};

const dislikeHandler = async () => {
  playSound('/sounds/like-sound.mp3');

  setDislikes((prevDislikes) => {
    if (disliked) return Math.max(prevDislikes - 1, 0);
    return prevDislikes + 1;
  });

  setDisliked((prev) => !prev);

  if (liked) {
    setLikes((prevLikes) => Math.max(prevLikes - 1, 0));
    setLiked(false);
  }

  try {
    const res = await videoReactionHandler('dislike');
    if (!res?.success) {
      toast.error('Could not dislike the video');
    }
  } catch (err) {
    toast.error('Something went wrong');
  }
};



// Removed automatic refetch on mount to avoid loops. Parent controls refetching.

  return (
    <div className=''>
      <div className="flex-[2] p-4 pt-0 flex flex-col">
        <div>
          <VideoPlayer
            videoUrl={`https://backend.vallianimarketplace.com/${selectedVideo?.videoUrl}`}
            onComplete={handleVideoComplete}
            setWatchedDuration={setWatchedDuration}
            
          />
          <div className="flex items-center justify-between my-4">
            <h1 className="text-xl font-bold">{selectedVideo?.title}</h1>
            <div className="flex items-center gap-4">
              <div onClick={() => likeHandler()} className="flex items-center gap-2 cursor-pointer">
                
                <AiOutlineLike
                  className={`text-2xl ${liked ? 'text-blue-600' : 'text-gray-700'}`}
                />
                <span className="text-xl"> {likes || 0}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <AiOutlineDislike
                  className={`text-2xl ${disliked ? 'text-blue-600' : 'text-gray-700'}`}
                  onClick={dislikeHandler}
                />{' '}
                <span className="text-xl"> {dislikes || 0}</span>
              </div>
            </div>
          </div>
        </div>
        {selectedVideo?.description && (
        <div className="">
          <p className="text-gray-800">{selectedVideo?.description}</p>
          <br />
        </div>
        )}
      </div>
    </div>
  );
};

export default VideoSectionContent;
