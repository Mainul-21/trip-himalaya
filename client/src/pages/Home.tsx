import TourCard from "@/components/TourCard";
import PublicLayout, { PublicHeader } from "@/components/PublicLayout";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { getImageVariant } from "@/lib/imageDelivery";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeIndianRupee, CalendarDays, Car, CheckCircle2, ChevronLeft, ChevronRight, Compass, Headphones, House, Leaf, Map, Mountain, MountainSnow, Send, ShieldCheck, Star, Tent, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const fallbackTripStyles = [
  { title: "TREKKING", href: "/tours?style=trekking", image: "/manus-storage/cat-trekking_07d114b2.jpg", copy: "" },
  { title: "SPIRITUAL TOURS", href: "/tours?style=experiences", image: "/manus-storage/cat-spiritual_743c5681.jpg", copy: "" },
  { title: "CAMPING", href: "/tours?style=adventure", image: "/manus-storage/cat-camping_c447f997.jpg", copy: "" },
  { title: "VILLAGE EXPERIENCES", href: "/tours?style=short-breaks", image: "/manus-storage/cat-village_f7870b29.jpg", copy: "" },
  { title: "HIMACHAL TOURS", href: "/tours?style=best-sellers", image: "/manus-storage/cat-tours_8d0fd3d0.jpg", copy: "" },
  { title: "CUSTOM TOURS", href: "/contact", image: "/manus-storage/cat-custom_9ca90b70.jpg", copy: "" },
];

const heroBadgeIcons = [Compass, BadgeIndianRupee, ShieldCheck, Headphones] as const;
const fallbackHeroBadges = [{ title: "Local Experts", copy: "Born in the Himalayas" }, { title: "Best Price Guarantee", copy: "No hidden charges" }, { title: "Safe & Comfortable", copy: "Your safety, our priority" }, { title: "24x7 Support", copy: "We are always with you" }] as const;
const whyTripIcons = [Mountain, ShieldCheck, BadgeIndianRupee, Users, Leaf] as const;
const fallbackWhyTripItems = [{ title: "LOCAL EXPERTS", copy: "We are locals, we know the Himalayas best." }, { title: "SAFE & RELIABLE", copy: "Your safety and comfort is our top priority." }, { title: "BEST PRICE GUARANTEE", copy: "Transparent pricing with no hidden charges." }, { title: "PERSONALISED SUPPORT", copy: "From planning to journey, we are with you." }, { title: "RESPONSIBLE TOURISM", copy: "We respect nature & support local communities." }] as const;
const travelStyleIcons = [MountainSnow, House, Tent, House, Car, Map] as const;

function SectionTitle({ children, sub }: { children: string; sub?: string }) {
  return <div className="text-center"><h2 className="font-display text-2xl font-bold tracking-wide text-primary sm:text-3xl">{children}</h2>{sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}<div className="mx-auto mt-2 h-[3px] w-14 rounded-full bg-accent" /></div>;
}

function Stars({ rating = 5 }: { rating?: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className={index < Math.round(rating) ? "fill-star text-star" : "text-slate-200"} />)}</div>;
}

export default function Home() {
  const { data: tours = [] } = trpc.tours.list.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery(undefined, { retry: false });
  const { data: agency } = trpc.agency.get.useQuery(undefined, { staleTime: 60_000 });
  const topTours = selectTopFeaturedTours(tours);
  const categories = fallbackTripStyles;
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [review, setReview] = useState(0);
  const [enquirySent, setEnquirySent] = useState(false);
  const [dateFieldFocused, setDateFieldFocused] = useState(false);
  const enquiry = trpc.enquiries.create.useMutation();
  const activeHeroSlides = useMemo(() => agency?.heroImages?.length ? agency.heroImages.map(src => ({ src })) : heroSlides, [agency?.heroImages]);
  const activeHero = activeHeroSlides[activeHeroSlide] || activeHeroSlides[0];
  const homepageBadges = agency?.heroBadges?.length ? agency.heroBadges : fallbackHeroBadges;
  const whyTripItems = agency?.whyTripItems?.length ? agency.whyTripItems : fallbackWhyTripItems;
  const verifiedAverage = reviews.length ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length : 0;

  useEffect(() => { setActiveHeroSlide(current => current >= activeHeroSlides.length ? 0 : current); }, [activeHeroSlides.length]);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length)), 4000); return () => window.clearInterval(timer); }, [activeHeroSlides.length]);

  function scrollToSection(sectionId: "packages" | "plan") {
    const section = document.getElementById(sectionId);
    if (!section) return;
    window.history.replaceState(null, "", `#${sectionId}`);
    section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "").trim();
    const travelDate = String(form.get("travelDate") || "").trim();
    const partySize = String(form.get("partySize") || "").trim();
    const destination = String(form.get("destination") || "").trim();
    const message = ["Homepage trip enquiry.", phone && `WhatsApp: ${phone}`, travelDate && `Travel date: ${travelDate}`, partySize && `Travellers: ${partySize}`, destination && `Destination / places: ${destination}`].filter(Boolean).join("\n");
    enquiry.mutate({ name: String(form.get("name") || ""), email: "not-provided@triphimalaya.invalid", phone: phone || undefined, subject: "Homepage trip enquiry", message }, { onSuccess: () => setEnquirySent(true) });
  }

  return <PublicLayout showHeader={false}>
    <section className="relative">
      <img src={getImageVariant(activeHero.src, "hero")} alt="Himalayan valley with camping tents in Himachal Pradesh" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" loading="eager" decoding="async" sizes="100vw" />
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero-overlay)" }} />
      <PublicHeader profile={agency} />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-6 pt-14 sm:pt-20"><h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-primary-foreground sm:text-5xl">{agency?.heroTitle || "DISCOVER HIMACHAL."}<span className="mt-1 block text-accent">{agency?.heroAccentTitle || "EXPERIENCE THE HIMALAYAS."}</span></h1><p className="mt-4 text-sm text-primary-foreground/85">{agency?.heroSubtitle || "Curated journeys. Local expertise. Unforgettable memories."}</p><div className="mt-7 flex flex-wrap gap-4"><a href="#packages" onClick={event => { event.preventDefault(); scrollToSection("packages"); }} className="focus-ring inline-flex items-center gap-3 rounded-md bg-accent px-6 py-3 text-sm font-semibold tracking-wide text-accent-foreground shadow-lg transition-transform hover:scale-[1.03]">EXPLORE TOURS <span className="grid h-6 w-6 place-items-center rounded-full border border-accent-foreground/60"><ArrowRight size={13} /></span></a><a href="/contact" onClick={event => { event.preventDefault(); scrollToSection("plan"); }} className="focus-ring inline-flex items-center gap-3 rounded-md bg-background px-6 py-3 text-sm font-semibold tracking-wide text-primary shadow-lg transition-transform hover:scale-[1.03]">PLAN YOUR TRIP <CalendarDays size={16} className="text-accent" /></a></div></div>
      <button type="button" aria-label="Previous slide" onClick={() => setActiveHeroSlide(current => current === 0 ? activeHeroSlides.length - 1 : current - 1)} className="focus-ring absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronLeft size={18} /></button><button type="button" aria-label="Next slide" onClick={() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length))} className="focus-ring absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronRight size={18} /></button>
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8"><div className="grid gap-5 rounded-md bg-primary-deep/85 px-6 py-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">{homepageBadges.map((item, index) => { const Icon = heroBadgeIcons[index % heroBadgeIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-center gap-3"><Icon size={26} className="shrink-0 text-primary-foreground" /><div><p className="text-xs font-semibold text-primary-foreground">{item.title}</p><p className="text-[11px] text-primary-foreground/70">{item.copy}</p></div></div>; })}</div></div>
    </section>

    <section className="bg-background py-12"><div className="mx-auto max-w-7xl px-5"><SectionTitle sub="Choose your perfect experience">EXPLORE HIMACHAL</SectionTitle><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{categories.map((item, index) => { const Icon = travelStyleIcons[index % travelStyleIcons.length]; return <Link key={`${item.title}-${item.href}`} href={item.href} className="focus-ring group overflow-hidden rounded-md border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"><div className="flex flex-col items-center gap-2 pb-3"><Icon size={26} className="text-primary" /><p className="text-center text-[11px] font-semibold tracking-wide text-primary">{item.title}</p></div><img src={getImageVariant(item.image, "card")} alt={item.title.toLowerCase()} width={640} height={512} loading="eager" fetchPriority="high" decoding="async" className="h-28 w-full rounded-sm object-cover" /></Link>; })}</div></div></section>

    <section id="packages" className="scroll-mt-20 bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>POPULAR TREKS &amp; TOURS</SectionTitle><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} whatsappNumber={agency?.whatsapp} />) : <div className="col-span-full border border-dashed border-border p-10 text-center text-sm text-muted-foreground">New journeys are being prepared. Please check back shortly.</div>}</div><div className="mt-8 flex justify-center"><Link href="/tours" className="focus-ring inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-xs font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]">VIEW ALL PACKAGES <span className="grid h-5 w-5 place-items-center rounded-full border border-primary-foreground/50"><ChevronRight size={12} /></span></Link></div></div></section>

    <section className="bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>{agency?.whyTripTitle || "WHY TRIP HIMALAYA?"}</SectionTitle><div className="mt-8 grid gap-6 rounded-md border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-5">{whyTripItems.map((item, index) => { const Icon = whyTripIcons[index % whyTripIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon size={20} /></span><div><p className="text-[11px] font-bold tracking-wide text-primary">{item.title}</p><p className="mt-1 text-[11px] leading-snug text-muted-foreground">{item.copy}</p></div></div>; })}</div></div></section>

    {reviews.length ? <section className="bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><div className="grid gap-5 lg:grid-cols-4"><div className="rounded-md bg-primary p-6 text-primary-foreground"><h2 className="font-display text-lg font-bold tracking-wide">TRAVELLER STORIES</h2><div className="mt-4 flex items-center gap-2 text-2xl font-bold text-accent"><span>{verifiedAverage.toFixed(1)}</span><Stars rating={verifiedAverage} /></div><p className="mt-2 text-xs text-primary-foreground/75">Based on published Trip Himalaya reviews</p><Link href="/contact" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-md bg-background px-4 py-2 text-[11px] font-semibold text-primary">CONTACT TRIP HIMALAYA</Link></div>{reviews.slice(0, 3).map((item, index) => <div key={item.id} className={`rounded-md border border-border bg-card p-5 shadow-[var(--shadow-card)] ${index === review ? "ring-1 ring-accent/30" : ""}`}><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-bold text-primary">{item.reviewerImage ? <img src={item.reviewerImage} alt="" className="h-full w-full object-cover" /> : item.reviewerName.charAt(0)}</span><div><p className="text-xs font-semibold text-primary">{item.reviewerName}</p><p className="text-[10px] text-muted-foreground">{item.location || item.sourceLabel || "Verified traveller"}</p></div></div><div className="mt-2"><Stars rating={item.rating} /></div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{item.quote}</p></div>)}</div><div className="mt-4 flex justify-end"><button type="button" aria-label="Next review" onClick={() => setReview(current => (current + 1) % Math.min(reviews.length, 3))} className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-border text-primary transition-colors hover:bg-secondary"><ChevronRight size={16} /></button></div></div></section> : null}

    <section id="plan" className="scroll-mt-20 bg-primary py-12"><div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_1.4fr] lg:items-center"><div><h2 className="font-display text-2xl font-bold tracking-wide text-primary-foreground">PLAN YOUR HIMACHAL TRIP</h2><p className="mt-3 text-sm text-primary-foreground/80">Tell us your requirements and we will plan the perfect trip for you.</p></div>{enquirySent ? <div className="rounded-md bg-primary-foreground/10 p-6 text-center"><CheckCircle2 className="mx-auto size-10 text-primary-foreground" /><h3 className="mt-3 font-display text-2xl font-bold text-primary-foreground">ENQUIRY RECEIVED</h3><p className="mt-2 text-sm text-primary-foreground/80">Thank you. Trip Himalaya will review your details.</p></div> : <form className="grid gap-3 sm:grid-cols-3" onSubmit={sendEnquiry}><input name="name" required placeholder="Your Name" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="phone" required placeholder="WhatsApp Number" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><div className="relative"><input name="travelDate" type={dateFieldFocused ? "date" : "text"} aria-label="Travel Date" placeholder="Date" onFocus={() => setDateFieldFocused(true)} onBlur={event => { if (!event.currentTarget.value) setDateFieldFocused(false); }} className="focus-ring w-full rounded-md bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none" />{!dateFieldFocused ? <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /> : null}</div><input name="partySize" placeholder="No. of Travellers" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="destination" placeholder="Destination / Places" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><button type="submit" disabled={enquiry.isPending} className="focus-ring flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-xs font-semibold tracking-wide text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">{enquiry.isPending ? "SENDING…" : "SEND ENQUIRY"} <Send size={14} /></button>{enquiry.error ? <p className="text-sm text-red-200 sm:col-span-3">{enquiry.error.message}</p> : null}</form>}</div></section>
  </PublicLayout>;
}
