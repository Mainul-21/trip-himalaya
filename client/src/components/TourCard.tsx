import { Clock3, Mountain } from "lucide-react";
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
    <article className="tour-card overflow-hidden rounded-md border border-[#dce5e2] bg-white shadow-[0_3px_12px_rgba(18,61,91,.08)]">
      <div className="relative">
        <TourPhotoCarousel title={tour.title} location={tour.location} heroImage={tour.heroImage} gallery={tour.gallery} compact={compact} />
        {tour.isBestSeller && (
          <span className="absolute left-0 top-3 z-10 flex items-center gap-1 rounded-r-sm bg-[#e9781c] px-2 py-1 text-[.55rem] font-extrabold uppercase tracking-[.075em] text-white">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-[.8rem] font-extrabold tracking-[.015em] text-[#123d5b]">{tour.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-[.65rem] text-slate-500"><Clock3 className="size-3" /> {tour.duration}</p>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-[.55rem] font-bold uppercase tracking-[.08em] text-slate-400">From</span>
          <span className="text-right"><span className="block text-[.95rem] font-extrabold leading-none text-[#e9781c]">₹{tour.priceFrom.toLocaleString("en-IN")}</span><span className="mt-1 block text-[.55rem] text-slate-400">per person</span></span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[.6rem] text-slate-500"><span className="flex items-center gap-1"><Mountain className="size-3 text-[#e9781c]" />{tour.difficulty}</span><span className="flex items-center gap-1"><Mountain className="size-3 text-[#e9781c]" />{tour.category}</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`/tours/${tour.slug}`} className="focus-ring inline-flex h-8.5 items-center justify-center rounded-sm border border-[#c9d8d7] px-1.5 text-[.57rem] font-extrabold uppercase tracking-[.04em] text-[#123d5b] transition hover:bg-[#eef4f2] active:scale-[.98]">View details</Link>
          <a href={`https://wa.me/918609752814?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-8.5 items-center justify-center gap-1 rounded-sm bg-[#e9781c] px-1.5 text-[.57rem] font-extrabold uppercase tracking-[.04em] text-white transition hover:bg-[#ce6514] active:scale-[.98]">
            <WhatsAppIcon className="size-3.5" /> Enquire now
          </a>
        </div>
      </div>
    </article>
  );
}
