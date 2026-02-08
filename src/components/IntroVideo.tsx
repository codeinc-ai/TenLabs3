"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const INTRO_VIDEO_PATH = "/intro.mp4";

export function IntroVideo() {
  const pathname = usePathname();
  const [showIntro, setShowIntro] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isHomePage = pathname === "/";

  useEffect(() => {
    if (isHomePage) {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, [isHomePage]);

  const closeIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  useEffect(() => {
    if (!showIntro || !videoRef.current) return;

    const video = videoRef.current;

    const handleCanPlay = () => setVideoLoaded(true);
    const handleEnded = () => closeIntro();
    const handleError = () => closeIntro();

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    video.play().catch(() => closeIntro());

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [showIntro, closeIntro]);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      <video
        ref={videoRef}
        src={INTRO_VIDEO_PATH}
        className="absolute inset-0 w-full h-full object-cover"
        muted={false}
        playsInline
        preload="auto"
      />

      {/* Skip button */}
      <button
        onClick={closeIntro}
        className="absolute top-6 right-6 z-10 px-4 py-2 text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
      >
        Skip
      </button>

      {/* Loading state */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
