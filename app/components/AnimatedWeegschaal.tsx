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
  animationType = 'balance', 
  size = 300, 
  className = "",
  showOnView = true,
  showRefreshButton = false
}: AnimatedWeegschaalProps) {
  
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (!showOnView || !videoRef.current) return;
    
    const video = videoRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasPlayed) {
          video.play();
          setHasPlayed(true);
        }
      },
      { threshold: 0.3 }
    );
    
    observer.observe(video);
    
    return () => observer.disconnect();
  }, [hasPlayed, showOnView]);
  
  const refreshAnimation = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setHasPlayed(true);
    }
  };
  
  return (
    <div className="text-center">
      <div className={`${className}`} style={{ overflow: 'hidden', height: size * 0.95 }}>
        <video
          ref={videoRef}
          width={size}
          height={size}
          className="object-contain"
          style={{ 
            objectPosition: 'center top',
            transform: 'translateY(-2%)'
          }}
          muted
          playsInline
          preload="metadata"
          onEnded={() => {
            // Video blijft op het laatste frame staan
            if (videoRef.current) {
              videoRef.current.pause();
            }
          }}
        >
          <source src="/animaties/Weegschaal 3.0.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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