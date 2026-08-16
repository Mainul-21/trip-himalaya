import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const height = compact ? "h-44" : "h-[22rem] sm:h-[28rem]";

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
      {photos.map((photo, index) => (
        <img
          key={photo}
          src={photo}
          alt={index === activeIndex ? `${title} in ${location}` : ""}
          aria-hidden={index !== activeIndex}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
          loading={priority && index === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#092e49]/80 via-transparent to-transparent" />
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            className="focus-ring absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-[#092e49]/60 text-white opacity-100 backdrop-blur-sm transition hover:bg-[#092e49]/85 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Previous photo for ${title}`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="focus-ring absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-[#092e49]/60 text-white opacity-100 backdrop-blur-sm transition hover:bg-[#092e49]/85 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Next photo for ${title}`}
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/25 bg-[#092e49]/55 px-2.5 py-1.5 text-[.65rem] font-bold text-white backdrop-blur-sm">
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
