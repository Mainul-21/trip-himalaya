import { ArrowRight, Clock3, MessageCircle, Mountain, Star } from "lucide-react";
import { Link } from "wouter";
import TourPhotoCarousel from "./TourPhotoCarousel";

export type TourCardData = { id: number; title: string; slug: string; category: string; location: string; duration: string; difficulty: string; priceFrom: number; heroImage: string; gallery?: string[]; shortDescription: string; isBestSeller?: boolean };

export default function TourCard({ tour, compact = false }: { tour: TourCardData; compact?: boolean }) {
  return <article className="tour-card group overflow-hidden border border-[#dfe8e8] bg-white">
    <div className="relative">
      <TourPhotoCarousel title={tour.title} location={tour.location} heroImage={tour.heroImage} gallery={tour.gallery} compact={compact} />
      {tour.isBestSeller && <span className="absolute left-0 top-4 inline-flex items-center gap-1 bg-[#e9781c] px-3 py-1.5 text-[.61rem] font-extrabold uppercase tracking-[.12em] text-white shadow-[0_5px_12px_rgba(159,67,7,.24)]"><Star aria-hidden="true" className="size-3 fill-current" />Best Seller</span>}
      <span className="absolute right-4 top-4 border border-[#dfe8e8] bg-[#fbfaf6]/95 px-2.5 py-1 text-[.61rem] font-extrabold uppercase tracking-[.12em] text-[#123d5b]">{tour.category}</span>
    </div>
    <div className="p-5"><h3 className="font-display text-[1.75rem] font-bold leading-[.94] text-[#123d5b]">{tour.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{tour.shortDescription}</p><div className="mt-5 flex items-center justify-between border-t border-[#edf0ed] pt-4"><div className="flex gap-3 text-[.68rem] font-bold uppercase tracking-[.06em] text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5 text-[#e17818]" />{tour.duration}</span><span className="inline-flex items-center gap-1"><Mountain className="size-3.5 text-[#e17818]" />{tour.difficulty}</span></div><span className="text-right"><span className="block text-[.58rem] font-extrabold uppercase tracking-[.12em] text-slate-400">From</span><span className="text-base font-extrabold text-[#123d5b]">₹{tour.priceFrom.toLocaleString("en-IN")}</span></span></div><div className="mt-5 grid grid-cols-2 gap-2"><Link href={`/tours/${tour.slug}`} className="focus-ring inline-flex h-10 items-center justify-center gap-1.5 border border-[#bdd0d0] px-3 text-[.7rem] font-bold text-[#123d5b] transition hover:border-[#123d5b] hover:bg-[#eef4f2] active:scale-[.98]">View details <ArrowRight className="size-3.5" /></Link><Link href={`/book/${tour.slug}`} className="focus-ring inline-flex h-10 items-center justify-center gap-1.5 bg-[#e9781c] px-3 text-[.7rem] font-bold text-white transition hover:bg-[#d86b12] active:scale-[.98]">Enquire now <MessageCircle className="size-3.5" /></Link></div></div>
  </article>;
}
