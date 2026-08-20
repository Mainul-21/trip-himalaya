import { Clock, Flame, MessageCircle, MountainSnow, Tent } from "lucide-react";
import { Link } from "wouter";
import { buildTourWhatsAppMessage } from "@/lib/tourWhatsApp";
import { resolveImageUrl } from "@/lib/imageDelivery";
import { WhatsAppIcon } from "./PublicLayout";

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

export default function TourCard({ tour, whatsappNumber = "918609752814" }: { tour: TourCardData; compact?: boolean; whatsappNumber?: string }) {
  const whatsappMessage = buildTourWhatsAppMessage(tour);
  const image = resolveImageUrl(tour.heroImage);

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="relative">
        <img src={image} alt={tour.title} width={800} height={560} loading="lazy" className="h-40 w-full object-cover" />
        {tour.isBestSeller ? <span className="absolute left-0 top-3 flex items-center gap-1 rounded-r bg-accent px-2 py-1 text-[10px] font-bold text-accent-foreground"><Flame size={11} /> BESTSELLER</span> : null}
      </div>
      <div className="p-3">
        <h3 className="text-[13px] font-bold tracking-wide text-primary">{tour.title.toUpperCase()}</h3>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={12} /> {tour.duration}</p>
        <div className="mt-2 flex items-end justify-between">
          <span className="text-[10px] uppercase text-muted-foreground">From</span>
          <span className="text-right"><span className="block text-base font-bold text-accent">₹{tour.priceFrom.toLocaleString("en-IN")}</span><span className="block text-[10px] text-muted-foreground">/person</span></span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MountainSnow size={12} className="text-accent" />{tour.difficulty}</span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Tent size={12} className="text-accent" />{tour.category}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`/tours/${tour.slug}`} className="focus-ring rounded-md border border-border px-2 py-2 text-center text-[11px] font-semibold text-primary transition-colors hover:bg-secondary">VIEW DETAILS</Link>
          <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="focus-ring flex items-center justify-center gap-1 rounded-md bg-accent px-2 py-2 text-[11px] font-semibold text-accent-foreground transition-transform hover:scale-[1.03]"><WhatsAppIcon className="size-3" /> ENQUIRE NOW</a>
        </div>
      </div>
    </article>
  );
}
