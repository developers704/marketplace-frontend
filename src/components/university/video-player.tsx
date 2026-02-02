'use client';
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/lazy';
import {
  FaPause,
  FaPlay,
  FaVolumeUp,
  FaExpand,
  FaCompress,
  FaCog,
  FaCheck,
} from 'react-icons/fa';
import screenfull from 'screenfull';
import { QUALITY_LEVELS, detectNetworkSpeed, getRecommendedQuality, getQualityLevel, QualityLevel } from '@/utils/videoQuality';
import { videoCache } from '@/utils/videoCache';

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
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsPlayerRef = useRef<any>(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<QualityLevel[]>(QUALITY_LEVELS);
  const [networkSpeed, setNetworkSpeed] = useState<number | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Initialize video cache and detect network speed
  useEffect(() => {
    const init = async () => {
      // Initialize cache
      try {
        await videoCache.init();
        
        // Check if video is cached
        if (videoUrl) {
          const cached = await videoCache.get(videoUrl);
          setIsCached(!!cached);
        }
      } catch (err) {
        console.warn('Video cache initialization failed:', err);
      }

      // Detect network speed for auto quality
      if (selectedQuality === 'auto') {
        try {
          const speed = await detectNetworkSpeed();
          setNetworkSpeed(speed);
          const recommended = getRecommendedQuality(speed);
          // Auto-select recommended quality
          if (hlsPlayerRef.current?.hls) {
            const hls = hlsPlayerRef.current.hls;
            const levels = hls.levels;
            if (levels && levels.length > 0) {
              const targetLevel = levels.findIndex((level: any) => {
                return level.height <= parseInt(recommended);
              });
              if (targetLevel >= 0) {
                hls.currentLevel = targetLevel;
              }
            }
          }
        } catch (err) {
          console.warn('Network speed detection failed:', err);
        }
      }
    };

    init();
  }, [videoUrl, selectedQuality]);

  // Handle video errors
  useEffect(() => {
    const handleError = () => {
      setError('Video playback error. Please try again.');
    };

    // ReactPlayer handles errors internally, but we can catch them
    return () => {
      // Cleanup if needed
    };
  }, [videoUrl]);

  // Handle quality change
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);

    if (quality === 'auto') {
      // Auto quality - let HLS.js handle it
      if (hlsPlayerRef.current?.hls) {
        hlsPlayerRef.current.hls.currentLevel = -1; // -1 means auto
      }
    } else {
      // Manual quality selection
      if (hlsPlayerRef.current?.hls) {
        const hls = hlsPlayerRef.current.hls;
        const levels = hls.levels;
        if (levels && levels.length > 0) {
          const targetHeight = parseInt(quality);
          const targetLevel = levels.findIndex((level: any) => {
            return level.height === targetHeight;
          });
          if (targetLevel >= 0) {
            hls.currentLevel = targetLevel;
          }
        }
      }
    }
  };

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

  // Handle seek - DISABLED: Seeking is not allowed
  // const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const seekTime = parseFloat(e.target.value);
  //   setProgress(seekTime);
  //   playerRef.current?.seekTo(seekTime, 'seconds');
  // };

  // Handle play/pause - ReactPlayer handles this
  const handlePlayPause = () => {
    setPlaying(!playing);
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
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 z-50">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={() => {
                setError(null);
                // ReactPlayer will reload on URL change
                if (playerRef.current) {
                  playerRef.current.seekTo(0);
                }
              }}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      

      {/* Use ReactPlayer for all videos - it handles HLS better with proxy URLs */}
      {/* @ts-ignore - ReactPlayer ref type compatibility */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        volume={volume}
        width="100%"
        height="100%"
        controls={false}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={onComplete}
        onReady={() => {
          // Access HLS instance for quality control after player is ready
          setTimeout(() => {
            if (playerRef.current) {
              try {
                const internalPlayer = (playerRef.current as any).getInternalPlayer?.();
                if (internalPlayer?.hls) {
                  hlsPlayerRef.current = { hls: internalPlayer.hls };
                  
                  // Listen for level changes to update available qualities
                  internalPlayer.hls.on('hlsLevelLoaded', () => {
                    const levels = internalPlayer.hls.levels;
                    if (levels && levels.length > 0) {
                      const available = levels.map((level: any) => ({
                        label: `${level.height}p`,
                        value: level.height.toString(),
                        height: level.height,
                        bitrate: level.bitrate,
                      }));
                      setAvailableQualities([
                        QUALITY_LEVELS[0], // Auto
                        ...available.sort((a: any, b: any) => b.height - a.height),
                      ]);
                    }
                  });
                }
              } catch (err) {
                console.warn('Failed to access HLS instance:', err);
              }
            }
          }, 1000);
        }}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
            },
            // HLS configuration for .m3u8 URLs
            hlsOptions: {
              enableWorker: true,
              lowLatencyMode: false,
              // Adaptive bitrate - start with auto
              abrEwmaDefaultEstimate: networkSpeed ? networkSpeed * 1000 : 2000000, 
       
              xhrSetup: (xhr: XMLHttpRequest, url: string) => {
              xhr.withCredentials = false;

            }
            },
          },
        }}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
        {/* Left: Play/Pause and Time */}
        <div className="flex items-center gap-4">
          <button onClick={handlePlayPause} className="text-xl">
            {playing ? <FaPause /> : <FaPlay />}
          </button>
          <span className="text-xs">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        {/* Center: Progress Bar - Non-seekable (read-only) */}
        <div className="flex-1 sm:px-4">
          <input
            type="range"
            min={0}
            max={duration}
            value={progress}
            step={0.1}
            disabled={true}
            readOnly={true}
            className="w-full h-1 rounded-lg cursor-not-allowed bg-gray-300 accent-blue-500 opacity-75"
            style={{ pointerEvents: 'none' }}
            title="Seeking is disabled"
          />
        </div>

        {/* Right: Quality, Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
              title="Video Quality"
            >
              <FaCog className="text-sm" />
              <span className="text-xs hidden sm:inline">
                {selectedQuality === 'auto' 
                  ? `Auto${networkSpeed ? ` (${Math.round(networkSpeed)} kbps)` : ''}`
                  : `${selectedQuality}p`}
              </span>
              {isCached && (
                <span className="text-xs text-green-400" title="Cached">●</span>
              )}
            </button>
            
            {/* Quality Dropdown Menu */}
            {showQualityMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQualityMenu(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg shadow-xl py-2 min-w-[120px] z-50">
                  {availableQualities.map((quality) => (
                    <button
                      key={quality.value}
                      onClick={() => handleQualityChange(quality.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center justify-between ${
                        selectedQuality === quality.value ? 'text-blue-400' : 'text-white'
                      }`}
                    >
                      <span>{quality.label}</span>
                      {selectedQuality === quality.value && (
                        <FaCheck className="text-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
