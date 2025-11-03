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
  const [likes, setLikes] = useState<any>(selectedVideo?.likes || 0);
  const [dislikes, setDislikes] = useState<any>(selectedVideo?.dislikes || 0);
  const [watchedVideos, setWatchedVideos] = useState<Record<number, boolean>>(
    {},
  );
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  // const courseVideos = [
  //   { id: 1, url: 'https://youtu.be/moRqo158NGc?si=M8UqSqynEew-4MWq' },
  //   { id: 2, url: 'https://www.example.com/video2.mp4' },
  // ];
  const handleVideoComplete = () => {
    setWatchedVideos((prev) => ({ ...prev, [currentVideo]: true }));
  };

  useEffect(() => {
    const filterVideo = content?.filter((video: any) => video._id === videoId);
    setSelectedVideo(filterVideo[0]);
  }, [videoId]);

  const likeHandler = async () => {
    const res = await videoReactionHandler('like');
    if (res?.success === true) {
      toast.success(res?.message);
      if (res?.message === 'Like removed') {
        setLikes(likes - 1);
      } else if (res?.message === 'Content liked') {
        setLikes(likes + 1);
      }
    }
    // console.log(res, 'res from next video');
  };

  const dislikeHandler = async () => {
    const res = await videoReactionHandler('dislike');
    if (res?.success === true) {
      toast.success(res?.message);
      if (res?.message === 'Content disliked') {
        setDislikes(dislikes + 1);
      } else if (res?.message === 'Dislike removed') {
        setDislikes(dislikes - 1);
      }
    }
    // console.log(res, 'res from next video');
  };

  useEffect(() => {
    const refetchData = async () => {
      const res = await refetchSectionData();
      const filterVideo = res?.data?.data?.content?.filter(
        (video: any) => video._id === videoId,
      );
      setSelectedVideo(filterVideo[0]);
      setLikes(filterVideo[0]?.likes);
      setDislikes(filterVideo[0]?.dislikes);
      // console.log(res?.data?.data, 'refetchData');
    };
    refetchData();
  }, [likes, dislikes]);
  // console.log(content, '===>>>Content');
  // console.log(videoId, '===>>>Content');
  // console.log(selectedVideo, '===>>>Content');
  // console.log(`${BASE_API}/${selectedVideo?.videoUrl}`, '===>>>Content');

  return (
    <div>
      <div className="flex-[2] p-4 pt-0 flex flex-col">
        <div>
          <VideoPlayer
            videoUrl={`${BASE_API}/${selectedVideo?.videoUrl}`}
            onComplete={handleVideoComplete}
            setWatchedDuration={setWatchedDuration}
          />
          <div className="flex items-center justify-between my-4">
            <h1 className="text-xl font-bold">{selectedVideo?.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer">
                <AiOutlineLike
                  className="text-2xl"
                  onClick={() => likeHandler()}
                />{' '}
                <span className="text-xl"> {likes || 0}</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <AiOutlineDislike
                  className="text-2xl"
                  onClick={dislikeHandler}
                />{' '}
                <span className="text-xl"> {dislikes || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="my-4">
          <p className="text-gray-800">{selectedVideo?.description}</p>
          <br />
        </div>
      </div>
    </div>
  );
};

export default VideoSectionContent;
