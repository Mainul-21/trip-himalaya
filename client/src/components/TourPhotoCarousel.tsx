import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getImageVariant } from "@/lib/imageDelivery";

type TourPhotoCarouselProps = {
  title: string;
  location: string;
  heroImage: string;
  gallery?: string[];
  compact?: boolean;
  priority?: boolean;
  className?: string;
};

export default function TourPhotoCarousel({
  title,
  location,
  heroImage,
  gallery,
  compact = false,
  priority = false,
  className = "",
}: TourPhotoCarouselProps) {
  const photos = useMemo(() => {
    const ordered = [heroImage, ...(gallery ?? [])].filter(Boolean);
    return ordered.filter((photo, index) => ordered.indexOf(photo) === index);
  }, [gallery, heroImage]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(current => Math.min(current, Math.max(photos.length - 1, 0)));
  }, [photos.length]);

  useEffect(() => {
    if (photos.length < 2 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % photos.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isPaused, photos.length]);

  function move(direction: number) {
    setActiveIndex(current => (current + direction + photos.length) % photos.length);
  }

  const activePhoto = photos[activeIndex] ?? heroImage;
  const deliveredPhoto = getImageVariant(activePhoto, compact ? "card" : "hero");
  const height = compact ? "h-40" : "h-[22rem] sm:h-[28rem]";

  return (
    <div
      className={`group relative overflow-hidden bg-[#dbe7e4] ${height} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      aria-label={`${title} photo gallery`}
    >
      <img
        key={deliveredPhoto}
        src={deliveredPhoto}
        alt={`${title} in ${location}`}
        className="absolute inset-0 h-full w-full object-cover object-[center_42%] transition-opacity duration-300 motion-reduce:transition-none"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        sizes={compact ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" : "100vw"}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#092e49]/70 via-[#092e49]/5 to-transparent" />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            className="focus-ring absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md border border-white/45 bg-[#092e49]/82 text-white opacity-100 transition-colors hover:bg-[#092e49] sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Previous photo for ${title}`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="focus-ring absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md border border-white/45 bg-[#092e49]/82 text-white opacity-100 transition-colors hover:bg-[#092e49] sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Next photo for ${title}`}
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 border border-white/25 bg-[#092e49]/82 px-2.5 py-1.5 text-[.65rem] font-bold text-white">
            <Images className="size-3.5" aria-hidden="true" />
            <span>{activeIndex + 1}/{photos.length}</span>
          </div>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" aria-label="Choose photo">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={photo}
                onClick={() => setActiveIndex(index)}
                className={`focus-ring h-1.5 rounded-full transition-all motion-reduce:transition-none ${index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white"}`}
                aria-label={`Show photo ${index + 1} of ${photos.length}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
      <span className="absolute bottom-4 left-4 text-[.68rem] font-bold uppercase tracking-[.1em] text-white/90">{location}</span>
    </div>
  );
}
