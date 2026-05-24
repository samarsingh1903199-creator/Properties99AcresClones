import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Share2, Heart, Play, Camera } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "@/src/lib/utils";

interface PropertyGalleryProps {
  images: string[];
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80";

export const PropertyGallery = ({ images }: PropertyGalleryProps) => {
  const galleryImages = useMemo(() => (images.length ? images : [FALLBACK_IMAGE]), [images]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentImage = galleryImages[currentIndex] || galleryImages[0];
  const goPrev = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  const goNext = () => setCurrentIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));

  return (
    <div className="relative group">
      <div className="absolute top-6 right-6 z-20 flex gap-3">
        <Button variant="glass" size="icon" className="rounded-2xl backdrop-blur-xl border-white/10 hover:bg-white/20">
          <Share2 size={18} />
        </Button>
        <Button variant="glass" size="icon" className="rounded-2xl backdrop-blur-xl border-white/10 hover:bg-white/20 text-red-500">
          <Heart size={18} />
        </Button>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex gap-3">
        <Button variant="glass" className="rounded-2xl backdrop-blur-xl border-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest px-4">
          <Camera size={14} className="mr-2" /> {galleryImages.length} Photos
        </Button>
        <Button variant="glass" className="rounded-2xl backdrop-blur-xl border-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest px-4">
          <Play size={14} className="mr-2" /> Walkthrough
        </Button>
      </div>

      <div className="rounded-[2.5rem] overflow-hidden border border-[var(--glass-border)] bg-luxury-black/20 aspect-video relative">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute inset-0 z-10 cursor-zoom-in"
          aria-label="Open gallery fullscreen"
        />
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={currentImage}
            alt="Property"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20"
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>

        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-6 right-6 z-20 w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Open fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 px-2">
        {galleryImages.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-24 rounded-2xl overflow-hidden border-2 transition-all bg-luxury-black/10",
              currentIndex === i
                ? "border-luxury-purple shadow-[0_0_15px_rgba(91,33,182,0.3)]"
                : "border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
            )}
            aria-label={`Show photo ${i + 1}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-luxury-black flex flex-col"
          >
            <div className="p-6 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent">
              <p className="text-sm font-bold uppercase tracking-widest text-white/50">
                Property Gallery <span className="text-white ml-2">{currentIndex + 1} / {galleryImages.length}</span>
              </p>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close fullscreen gallery"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
              <img src={currentImage} alt="Property fullscreen" className="max-w-full max-h-full object-contain shadow-2xl" />
            </div>

            <div className="p-8 flex justify-center gap-6 bg-linear-to-t from-black/80 to-transparent">
              <Button variant="glass" onClick={goPrev} className="rounded-2xl">
                <ChevronLeft className="mr-2" /> Prev
              </Button>
              <Button variant="glass" onClick={goNext} className="rounded-2xl">
                Next <ChevronRight className="ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
