import { ArrowRight, Clock3, Mountain, Star } from "lucide-react";
import { Link } from "wouter";
import { buildTourWhatsAppMessage } from "@/lib/tourWhatsApp";
import { WhatsAppIcon } from "./PublicLayout";
import TourPhotoCarousel from "./TourPhotoCarousel";

export type TourCardData = {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  duration: string;
  difficulty: string;
  priceFrom: number;
  heroImage: string;
  gallery?: string[];
  shortDescription: string;
  isBestSeller?: boolean;
};

export default function TourCard({ tour, compact = true }: { tour: TourCardData; compact?: boolean }) {
  const whatsappMessage = buildTourWhatsAppMessage(tour);

  return (
    <article className="tour-card group overflow-hidden rounded-md border border-[#d9e3e1] bg-white shadow-[0_4px_15px_rgba(18,61,91,.07)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#e9a45a] hover:shadow-[0_8px_22px_rgba(18,61,91,.11)]">
      <div className="relative">
        <TourPhotoCarousel title={tour.title} location={tour.location} heroImage={tour.heroImage} gallery={tour.gallery} compact={compact} />
        {tour.isBestSeller && (
          <span className="absolute left-0 top-3 z-10 rounded-r-sm bg-[#e9781c] px-2.5 py-1 text-[.55rem] font-extrabold uppercase tracking-[.09em] text-white shadow-sm">
            Best Seller
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 rounded-sm border border-white/80 bg-white/92 px-2 py-1 text-[.52rem] font-extrabold uppercase tracking-[.07em] text-[#123d5b]">
          {tour.category}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="min-h-[2.25rem] font-display text-[1.15rem] font-bold leading-[.96] tracking-[-.025em] text-[#123d5b] sm:text-[1.28rem]">
          {tour.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-[.7rem] leading-5 text-slate-500">{tour.shortDescription}</p>

        <div className="mt-3 flex flex-col gap-3 border-t border-[#edf1ef] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 flex-wrap space-y-1 text-[.57rem] font-bold uppercase tracking-[.035em] text-slate-500">
            <span className="flex items-center gap-1"><Clock3 className="size-3 text-[#e17818]" />{tour.duration}</span>
            <span className="flex items-center gap-1"><Mountain className="size-3 text-[#e17818]" />{tour.difficulty}</span>
          </div>
          <span className="shrink-0 self-start text-left sm:self-auto sm:text-right"><span className="block text-[.5rem] font-extrabold uppercase tracking-[.08em] text-slate-400">From</span><span className="block text-[.88rem] font-extrabold leading-none text-[#123d5b]">₹{tour.priceFrom.toLocaleString("en-IN")}</span><span className="mt-0.5 block text-[.5rem] font-semibold text-slate-400">per person</span></span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`/tours/${tour.slug}`} className="focus-ring inline-flex h-8.5 items-center justify-center gap-1 rounded-sm border border-[#b9cece] px-1.5 text-[.57rem] font-extrabold uppercase tracking-[.04em] text-[#123d5b] transition hover:border-[#123d5b] hover:bg-[#eef4f2] active:scale-[.98]">
            View details <ArrowRight className="size-3" />
          </Link>
          <a href={`https://wa.me/918609752814?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-8.5 items-center justify-center gap-1 rounded-sm bg-[#e9781c] px-1.5 text-[.57rem] font-extrabold uppercase tracking-[.04em] text-white transition hover:bg-[#ce6514] active:scale-[.98]">
            <WhatsAppIcon className="size-3.5" /> Enquire now
          </a>
        </div>
      </div>
    </article>
  );
}
