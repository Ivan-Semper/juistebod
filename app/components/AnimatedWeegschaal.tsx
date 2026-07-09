"use client";

import { useState, useRef, useEffect } from "react";

interface AnimatedWeegschaalProps {
  animationType?: 'balance' | 'float' | 'pulse' | 'drop' | 'dropDramatic' | 'slideFromLeft' | 'none';
  size?: number;
  className?: string;
  showOnView?: boolean;
  showRefreshButton?: boolean;
}

export default function AnimatedWeegschaal({
  size = 300,
  className = "",
  showOnView = true,
  showRefreshButton = false
}: AnimatedWeegschaalProps) {
  const [needsManualPlay, setNeedsManualPlay] = useState(false);
  const hasPlayedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise) {
      playPromise
        .then(() => setNeedsManualPlay(false))
        .catch(() => {
          // Autoplay geblokkeerd (bijv. iOS low-power mode): toon een afspeelknop
          setNeedsManualPlay(true);
        });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!showOnView) {
      playVideo();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPlayedRef.current) {
          hasPlayedRef.current = true;
          playVideo();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [showOnView]);

  const refreshAnimation = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      hasPlayedRef.current = true;
      playVideo();
    }
  };

  const handleManualPlay = () => {
    hasPlayedRef.current = true;
    playVideo();
  };

  return (
    <div className="text-center w-full">
      <div
        className={`relative mx-auto overflow-hidden ${className}`}
        style={{ width: '100%', maxWidth: size }}
      >
        <video
          ref={videoRef}
          className="w-full h-auto object-contain"
          muted
          playsInline
          preload="auto"
          aria-label="Animatie van een weegschaal die in balans komt"
          onEnded={() => {
            // Video blijft op het laatste frame staan
            videoRef.current?.pause();
          }}
        >
          <source src="/animaties/Weegschaal 3.0.mp4" type="video/mp4" />
        </video>

        {needsManualPlay && (
          <button
            onClick={handleManualPlay}
            className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] transition-opacity hover:bg-white/30"
            aria-label="Speel animatie af"
          >
            <span className="w-16 h-16 rounded-full bg-[#1F3C88] text-white flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      {showRefreshButton && (
        <button
          onClick={refreshAnimation}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          🔄 Speel opnieuw af
        </button>
      )}
    </div>
  );
}
