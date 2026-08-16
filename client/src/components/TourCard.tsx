import { ArrowRight, Clock3, Mountain, Star } from "lucide-react";
import { Link } from "wouter";
import { buildTourWhatsAppMessage } from "@/lib/tourWhatsApp";
import { WhatsAppIcon } from "./PublicLayout";
import TourPhotoCarousel from "./TourPhotoCarousel";

export type TourCardData = { id: number; title: string; slug: string; category: string; location: string; duration: string; difficulty: string; priceFrom: number; heroImage: string; gallery?: string[]; shortDescription: string; isBestSeller?: boolean };

export default function TourCard({ tour, compact = false }: { tour: TourCardData; compact?: boolean }) {
  const whatsappMessage = buildTourWhatsAppMessage(tour);
  return <article className="tour-card group overflow-hidden rounded-[1.25rem] border border-[#dfe8e8] bg-white shadow-[0_8px_22px_rgba(18,61,91,.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,61,91,.11)]">
    <div className="relative">
      <TourPhotoCarousel title={tour.title} location={tour.location} heroImage={tour.heroImage} gallery={tour.gallery} compact={compact} />
      {tour.isBestSeller && <span className="absolute left-0 top-4 inline-flex items-center gap-1 rounded-r-full bg-[#e9781c] px-3 py-1.5 text-[.6rem] font-extrabold uppercase tracking-[.1em] text-white shadow-[0_5px_12px_rgba(159,67,7,.24)]"><Star aria-hidden="true" className="size-3 fill-current" />Best Seller</span>}
      <span className="absolute right-4 top-4 rounded-full border border-white/65 bg-[#fbfaf6]/95 px-2.5 py-1 text-[.59rem] font-extrabold uppercase tracking-[.1em] text-[#123d5b]">{tour.category}</span>
    </div>
    <div className="p-4 sm:p-5"><h3 className="font-display text-[1.35rem] font-bold leading-[1.04] text-[#123d5b] sm:text-[1.5rem]">{tour.title}</h3><p className="mt-2 line-clamp-2 text-[.83rem] leading-5 text-slate-600">{tour.shortDescription}</p><div className="mt-4 flex items-center justify-between border-t border-[#edf0ed] pt-3"><div className="flex min-w-0 gap-2.5 text-[.62rem] font-bold uppercase tracking-[.045em] text-slate-500"><span className="inline-flex items-center gap-1 whitespace-nowrap"><Clock3 className="size-3.5 text-[#e17818]" />{tour.duration}</span><span className="hidden items-center gap-1 whitespace-nowrap sm:inline-flex"><Mountain className="size-3.5 text-[#e17818]" />{tour.difficulty}</span></div><span className="text-right"><span className="block text-[.55rem] font-extrabold uppercase tracking-[.1em] text-slate-400">From</span><span className="text-[.95rem] font-extrabold text-[#123d5b]">₹{tour.priceFrom.toLocaleString("en-IN")}</span></span></div><div className="mt-4 grid grid-cols-2 gap-2"><Link href={`/tours/${tour.slug}`} className="focus-ring inline-flex h-10 items-center justify-center gap-1 border border-[#bdd0d0] px-2 text-[.65rem] font-bold text-[#123d5b] transition hover:border-[#123d5b] hover:bg-[#eef4f2] active:scale-[.98]">View details <ArrowRight className="size-3.5" /></Link><a href={`https://wa.me/918609752814?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-10 items-center justify-center gap-1 bg-[#25d366] px-2 text-[.65rem] font-extrabold text-white transition hover:bg-[#1fae54] active:scale-[.98]"><WhatsAppIcon className="size-4" /> WhatsApp</a></div></div>
  </article>;
}
