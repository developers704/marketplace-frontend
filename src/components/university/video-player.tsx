'use client';
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/lazy';
import {
  FaPause,
  FaPlay,
  FaVolumeUp,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import screenfull from 'screenfull';

interface VideoPlayerProps {
  videoUrl: string;
  onComplete: () => void;
  setWatchedDuration: (duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  onComplete,
  setWatchedDuration,
}) => {
  const playerRef = useRef<ReactPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format seconds to hh:mm:ss
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const hDisplay = h > 0 ? String(h).padStart(2, '0') + ':' : '';
    const mDisplay = String(m).padStart(2, '0') + ':';
    const sDisplay = String(s).padStart(2, '0');
    return hDisplay + mDisplay + sDisplay;
  };

  // Handle video progress
  const handleProgress = (state: { playedSeconds: number }) => {
    setProgress(state.playedSeconds);
    setWatchedDuration(state.playedSeconds);
  };

  // Handle total duration
  const handleDuration = (d: number) => {
    setDuration(d);
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setProgress(seekTime);
    playerRef.current?.seekTo(seekTime, 'seconds');
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
    }
  };

  // Track fullscreen changes
  useEffect(() => {
    if (!screenfull.isEnabled) return;

    const onChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };

    screenfull.on('change', onChange);
    return () => {
      screenfull.off('change', onChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden shadow-md rounded-2xl bg-black ${
        isFullscreen ? 'h-screen' : 'h-[350px]'
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReactPlayer
        ref={(player) => (playerRef.current = player)}
        url={videoUrl}
        playing={playing}
        volume={volume}
        width="100%"
        // height="350px"
        height="100%" // ✅ let it fill the container height
        controls={false}
        onProgress={handleProgress}
        onDuration={handleDuration}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
        {/* Left: Play/Pause and Time */}
        <div className="flex items-center gap-4">
          <button onClick={() => setPlaying(!playing)} className="text-xl">
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          <span className="text-xs">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 sm:px-4">
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            step={0.1}
            onChange={handleSeek}
            className="w-full h-1 rounded-lg cursor-pointer bg-gray-300 accent-blue-500"
          />
        </div>

        {/* Right: Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          <FaVolumeUp />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-blue-500"
          />
          <button onClick={toggleFullScreen} title="Toggle Fullscreen">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
