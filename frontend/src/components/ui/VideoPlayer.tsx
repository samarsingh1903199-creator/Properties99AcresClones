import { useEffect, useRef, useState } from "react";
import { cn } from "@/src/lib/utils";
import { Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  onHoverMute?: boolean;
}

export const VideoPlayer = ({
  src,
  poster,
  className,
  autoplay = true,
  loop = true,
  muted = true,
  showControls = false,
  onHoverMute = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(muted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Timeout to prevent endless loading state
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // If it's still loading after 15s, it's likely too slow or blocked
        console.warn("Video load timeout:", src);
      }
    }, 15000); // Increased to 15s

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (videoRef.current && !hasError) {
          if (entry.isIntersecting && autoplay) {
            videoRef.current.play().catch(() => {
              // Silently handle autoplay restrictions
              setHasError(true);
              setIsLoading(false);
            });
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [autoplay, isLoading, src, hasError]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoError = () => {
    console.error("Video failed to load:", src);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div 
      className={cn("relative group/video overflow-hidden bg-luxury-gray", className)}
      onMouseEnter={() => {
        if (onHoverMute && videoRef.current && !hasError) {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }}
      onMouseLeave={() => {
        if (onHoverMute && videoRef.current && !hasError) {
          videoRef.current.muted = true;
          setIsMuted(true);
        }
      }}
    >
      {/* Subtle Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-luxury-black/5 animate-pulse z-20" />
      )}

      {/* Always show poster as persistent background while loading or as fallback */}
      {poster && (
        <img 
          src={poster} 
          alt="Property Preview" 
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-all duration-1000 group-hover/video:scale-105",
            !isLoading && !hasError ? "opacity-0" : "opacity-100"
          )}
        />
      )}

      {/* Subtle Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-luxury-black/5 animate-pulse z-20" />
      )}
      
      {!hasError && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={isMuted}
          loop={loop}
          playsInline
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out z-10 group-hover/video:scale-105",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoadedData={() => setIsLoading(false)}
          onError={handleVideoError}
        />
      )}

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-40 group-hover/video:opacity-60 transition-opacity" />

      {/* Mute Toggle UI */}
      {!showControls && !hasError && !isLoading && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover/video:opacity-100 transition-all duration-300 hover:bg-luxury-purple flex items-center justify-center transform translate-y-2 group-hover/video:translate-y-0"
        >
          {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      )}
    </div>
  );
};
