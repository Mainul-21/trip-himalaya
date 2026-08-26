import TourCard from "@/components/TourCard";
import PublicLayout, { PublicHeader } from "@/components/PublicLayout";
import Seo from "@/components/Seo";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { getImageVariant } from "@/lib/imageDelivery";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeIndianRupee, CalendarDays, Car, CheckCircle2, ChevronLeft, ChevronRight, Compass, ExternalLink, Headphones, House, Leaf, Map, Mountain, MountainSnow, Quote, Send, ShieldCheck, Tent, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

const fallbackTripStyles = [
  { title: "TREKKING", href: "/tours?style=trekking", image: "/manus-storage/cat-trekking_07d114b2.jpg", copy: "" },
  { title: "TOURS", href: "/tours?style=best-sellers", image: "/manus-storage/cat-tours_8d0fd3d0.jpg", copy: "" },
  { title: "ADVENTURE", href: "/tours?style=adventure", image: "/manus-storage/cat-camping_c447f997.jpg", copy: "" },
  { title: "LOCAL & CULTURE", href: "/tours?style=experiences", image: "/manus-storage/cat-village_f7870b29.jpg", copy: "" },
];

const categoryActivityNames: Record<string, string[]> = {
  TREKKING: ["Lamdal Trek", "Baleni Pass", "Minkiani Pass", "Seven Lake Trek"],
  TOURS: ["Dharamshala Tour", "Five Devi Darshan in Himachal", "Manali Tour", "Dalhousie–Chamba"],
  ADVENTURE: ["Paragliding", "Zipline", "ATV Ride", "Jeep Safari", "Sky Cycling", "Riverside Picnic"],
  "LOCAL & CULTURE": ["Kareri Village Tour", "Boh Village Tour"],
};

const heroBadgeIcons = [Compass, BadgeIndianRupee, ShieldCheck, Headphones] as const;
const fallbackHeroBadges = [{ title: "Local Experts", copy: "Born in the Himalayas" }, { title: "Best Price Guarantee", copy: "No hidden charges" }, { title: "Safe & Comfortable", copy: "Your safety, our priority" }, { title: "24x7 Support", copy: "We are always with you" }] as const;
const whyTripIcons = [Mountain, ShieldCheck, BadgeIndianRupee, Users, Leaf] as const;
const fallbackWhyTripItems = [{ title: "LOCAL EXPERTS", copy: "We are locals, we know the Himalayas best." }, { title: "SAFE & RELIABLE", copy: "Your safety and comfort is our top priority." }, { title: "BEST PRICE GUARANTEE", copy: "Transparent pricing with no hidden charges." }, { title: "PERSONALISED SUPPORT", copy: "From planning to journey, we are with you." }, { title: "RESPONSIBLE TOURISM", copy: "We respect nature & support local communities." }] as const;
const travelStyleIcons = [MountainSnow, House, Tent, House, Car, Map] as const;

function SectionTitle({ children, sub }: { children: string; sub?: string }) {
  return <div className="text-center"><h2 className="font-display text-2xl font-bold tracking-wide text-primary sm:text-3xl">{children}</h2>{sub ? <p className="mt-1 text-sm text-muted-foreground">{sub}</p> : null}<div className="mx-auto mt-2 h-[3px] w-14 rounded-full bg-accent" /></div>;
}

export default function Home() {
  const { data: tours = [] } = trpc.tours.list.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery(undefined, { retry: false });
  const { data: agency } = trpc.agency.get.useQuery(undefined, { staleTime: 60_000 });
  const topTours = selectTopFeaturedTours(tours);
  const categories = agency?.travelStyles?.length ? agency.travelStyles : fallbackTripStyles;
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [enquirySent, setEnquirySent] = useState(false);
  const [dateFieldFocused, setDateFieldFocused] = useState(false);
  const reviewCarouselRef = useRef<HTMLDivElement>(null);
  const enquiry = trpc.enquiries.create.useMutation();
  const activeHeroSlides = useMemo(() => agency?.heroImages?.length ? agency.heroImages.map(src => ({ src })) : heroSlides, [agency?.heroImages]);
  const activeHero = activeHeroSlides[activeHeroSlide] || activeHeroSlides[0];
  const homepageBadges = agency?.heroBadges?.length ? agency.heroBadges : fallbackHeroBadges;
  const whyTripItems = agency?.whyTripItems?.length ? agency.whyTripItems : fallbackWhyTripItems;
  const googleReviewsUrl = agency?.googleMapsUrl?.trim();
  const reviewSectionTitle = agency?.reviewSectionTitle || "REAL JOURNEYS. HONEST STORIES.";
  const reviewSectionIntro = agency?.reviewSectionIntro || "Guest stories, shared carefully by the Trip Himalaya team for travellers planning their own Himalayan journey.";
  const reviewCtaLabel = agency?.reviewCtaLabel || "VIEW INDEPENDENT FEEDBACK";
  const reviewCtaUrl = agency?.reviewCtaEnabled === false ? "" : googleReviewsUrl;
  const homepageFigures = [
    { label: "TRAVELLERS", value: agency?.touristCount?.trim() || "", Icon: Users },
    { label: "TOURS", value: agency?.tourCount?.trim() || "", Icon: Mountain },
    { label: agency?.thirdMetricLabel?.trim() || "", value: agency?.thirdMetricValue?.trim() || "", Icon: Compass },
  ].filter(figure => figure.label && figure.value);

  useEffect(() => { setActiveHeroSlide(current => current >= activeHeroSlides.length ? 0 : current); }, [activeHeroSlides.length]);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const timer = window.setInterval(() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length)), 4000); return () => window.clearInterval(timer); }, [activeHeroSlides.length]);
  useEffect(() => {
    const carousel = reviewCarouselRef.current;
    if (!carousel || reviews.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    const advance = () => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (maxScroll <= 4) return;
      const next = carousel.scrollLeft + Math.max(carousel.clientWidth * 0.86, 240);
      carousel.scrollTo({ left: next >= maxScroll - 4 ? 0 : next, behavior: "smooth" });
    };
    const start = () => { timer = window.setInterval(advance, 5200); };
    const stop = () => { if (timer !== undefined) window.clearInterval(timer); };
    const resume = () => { stop(); window.setTimeout(start, 1500); };
    start();
    carousel.addEventListener("pointerdown", stop);
    carousel.addEventListener("pointerup", resume);
    carousel.addEventListener("pointercancel", resume);
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", resume);
    return () => { stop(); carousel.removeEventListener("pointerdown", stop); carousel.removeEventListener("pointerup", resume); carousel.removeEventListener("pointercancel", resume); carousel.removeEventListener("mouseenter", stop); carousel.removeEventListener("mouseleave", resume); };
  }, [reviews.length]);

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

  const agencySchema = agency ? {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: agency.brandName,
    description: agency.heroSubtitle || "Dharamshala tour packages, Himachal Pradesh journeys, treks, and private travel planning.",
    telephone: agency.phone,
    email: agency.email,
    address: { "@type": "PostalAddress", streetAddress: agency.address, addressLocality: "Dharamshala", addressRegion: "Himachal Pradesh", addressCountry: "IN" },
    areaServed: [{ "@type": "City", name: "Dharamshala" }, { "@type": "State", name: "Himachal Pradesh" }],
    url: window.location.origin,
    ...(agency.googleMapsUrl ? { sameAs: [agency.googleMapsUrl] } : {}),
  } : undefined;

  return <PublicLayout showHeader={false}>
    <Seo title="Trip Himalaya | Best Tour Agency in Dharamshala, India" description="Plan Dharamshala tour packages, Himachal Pradesh treks and private Himalayan holidays with Trip Himalaya’s practical local guidance." structuredData={agencySchema} />
    <section className="homepage-hero relative">
      <img src={getImageVariant(activeHero.src, "hero")} alt="Himalayan valley with camping tents in Himachal Pradesh" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" loading="eager" decoding="async" sizes="100vw" />
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero-overlay)" }} />
      <PublicHeader profile={agency} />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-6 pt-14 sm:pt-20"><h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-primary-foreground sm:text-5xl">{agency?.heroTitle || "DISCOVER HIMACHAL."}<span className="mt-1 block text-accent">{agency?.heroAccentTitle || "EXPERIENCE THE HIMALAYAS."}</span></h1><p className="mt-4 text-sm text-primary-foreground/85">{agency?.heroSubtitle || "Curated journeys. Local expertise. Unforgettable memories."}</p><div className="mt-7 flex flex-wrap gap-4"><a href="#packages" onClick={event => { event.preventDefault(); scrollToSection("packages"); }} className="focus-ring inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-wide text-accent-foreground shadow-lg transition-transform hover:scale-[1.03]">EXPLORE TOURS <span className="grid h-6 w-6 place-items-center rounded-full border border-accent-foreground/60"><ArrowRight size={13} /></span></a><a href="/contact" onClick={event => { event.preventDefault(); scrollToSection("plan"); }} className="focus-ring inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 text-sm font-semibold tracking-wide text-primary shadow-lg transition-transform hover:scale-[1.03]">PLAN YOUR TRIP <CalendarDays size={16} className="text-accent" /></a></div></div>
      <button type="button" aria-label="Previous slide" onClick={() => setActiveHeroSlide(current => current === 0 ? activeHeroSlides.length - 1 : current - 1)} className="focus-ring absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronLeft size={18} /></button><button type="button" aria-label="Next slide" onClick={() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length))} className="focus-ring absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronRight size={18} /></button>
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8"><div className="grid gap-5 rounded-md bg-primary-deep/85 px-6 py-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">{homepageBadges.map((item, index) => { const Icon = heroBadgeIcons[index % heroBadgeIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-center gap-3"><Icon size={26} className="shrink-0 text-primary-foreground" /><div><p className="text-xs font-semibold text-primary-foreground">{item.title}</p><p className="text-[11px] text-primary-foreground/70">{item.copy}</p></div></div>; })}</div></div>
    </section>

    <section className="bg-background py-12"><div className="mx-auto max-w-7xl px-5"><SectionTitle sub={agency?.exploreIntro || "Choose your perfect experience"}>{agency?.exploreTitle || "EXPLORE HIMACHAL"}</SectionTitle><div className="mt-8 grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-4">{categories.map((item, index) => { const Icon = travelStyleIcons[index % travelStyleIcons.length]; const activityNames = categoryActivityNames[item.title.trim().toUpperCase()] || []; return <Link key={`${item.title}-${item.href}`} href={item.href} className="focus-ring group flex min-h-[17.5rem] flex-col overflow-hidden rounded-md border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"><div className="flex items-center gap-3 pb-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/8 text-primary"><Icon size={20} /></span><p className="text-[11px] font-semibold tracking-wide text-primary">{item.title}</p></div>{activityNames.length ? <ul className="mb-3 space-y-1.5 text-[11px] leading-snug text-muted-foreground">{activityNames.map(name => <li key={name} className="flex gap-2"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />{name}</li>)}</ul> : null}<img src={getImageVariant(item.image, "card")} alt={item.title.toLowerCase()} width={640} height={512} loading="lazy" decoding="async" className="mt-auto h-20 w-full rounded-sm object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></Link>; })}</div></div></section>

    <section id="packages" className="scroll-mt-20 bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>POPULAR TREKS &amp; TOURS</SectionTitle><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} whatsappNumber={agency?.whatsapp} />) : <div className="col-span-full border border-dashed border-border p-10 text-center text-sm text-muted-foreground">New journeys are being prepared. Please check back shortly.</div>}</div><div className="mt-8 flex justify-center"><Link href="/tours" className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]">VIEW ALL PACKAGES <span className="grid h-5 w-5 place-items-center rounded-full border border-primary-foreground/50"><ChevronRight size={12} /></span></Link></div></div></section>

    <section className="bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>{agency?.whyTripTitle || "WHY TRIP HIMALAYA?"}</SectionTitle><div className="mt-8 grid gap-6 rounded-md border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-5">{whyTripItems.map((item, index) => { const Icon = whyTripIcons[index % whyTripIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon size={20} /></span><div><p className="text-[11px] font-bold tracking-wide text-primary">{item.title}</p><p className="mt-1 text-[11px] leading-snug text-muted-foreground">{item.copy}</p></div></div>; })}</div></div></section>

    {homepageFigures.length ? <section className="bg-[#f8fbfa] py-12" aria-labelledby="trip-figures-title"><div className="mx-auto max-w-7xl px-5"><div className="rounded-2xl border border-[#dbe8e4] bg-card px-5 py-7 shadow-[var(--shadow-card)] sm:px-8"><div className="flex flex-col gap-3 border-b border-[#e6efeb] pb-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Trip Himalaya</p><h2 id="trip-figures-title" className="mt-1 font-display text-2xl font-bold tracking-wide text-primary">AT A GLANCE</h2></div><p className="max-w-md text-sm leading-6 text-muted-foreground">Figures are updated by the Trip Himalaya administration team.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-3">{homepageFigures.map(({ label, value, Icon }) => <div key={label} className="flex items-center justify-center gap-4 rounded-xl border border-[#e2ece8] bg-white px-5 py-5 text-center sm:justify-start sm:text-left"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon size={20} /></span><div><p className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p></div></div>)}</div></div></div></section> : null}

    {reviews.length || reviewCtaUrl ? <section className="bg-[linear-gradient(180deg,#f8fbfa_0%,#ffffff_100%)] py-14 sm:py-16" aria-labelledby="traveller-stories-title"><div className="mx-auto max-w-7xl px-5"><div className="overflow-hidden rounded-2xl border border-[#dbe8e4] bg-card shadow-[0_22px_60px_rgba(18,61,91,.10)]"><div className="px-6 pb-3 pt-8 text-center sm:px-8 sm:pt-10"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Guest notes</p><h3 id="traveller-stories-title" className="mt-1 font-display text-2xl font-bold tracking-wide text-primary sm:text-3xl">WHAT OUR TRAVELLERS SAY</h3>{reviewCtaUrl ? <a href={reviewCtaUrl} target="_blank" rel="noreferrer" className="focus-ring mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary underline decoration-accent underline-offset-4">{reviewCtaLabel} <ExternalLink size={13} /></a> : null}</div>{reviews.length ? <div ref={reviewCarouselRef} aria-label="Scrollable traveller stories" className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-7 pt-5 sm:gap-5 sm:px-8 [scrollbar-width:thin]">{reviews.map(item => <article key={item.id} className="group w-[min(21rem,calc(100vw-4rem))] shrink-0 snap-start rounded-xl border border-[#e2ece8] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_30px_rgba(18,61,91,.08)] sm:p-6"><div className="flex items-start justify-between gap-4"><span className="text-[10px] font-bold uppercase tracking-[.13em] text-primary/60">Guest story</span><Quote size={22} className="shrink-0 text-accent/65" aria-hidden="true" /></div><p className="mt-5 line-clamp-5 min-h-[7.5rem] text-sm leading-6 text-slate-600">“{item.quote}”</p><div className="mt-5 flex items-center gap-3 border-t border-[#edf2f0] pt-4"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#edf4f1] text-xs font-extrabold text-primary">{item.reviewerImage ? <img src={item.reviewerImage} alt="" className="h-full w-full object-cover" /> : item.reviewerName.charAt(0)}</span><div className="min-w-0"><p className="truncate text-xs font-bold text-primary">{item.reviewerName}</p><p className="truncate text-[10px] text-muted-foreground">{item.location || item.sourceLabel || "Guest feedback"}</p></div></div></article>)}</div> : <div className="mx-5 mb-7 rounded-xl border border-dashed border-[#c7d8d2] bg-[#f8fbfa] p-7 text-center sm:mx-8"><p className="text-sm font-semibold text-primary">Guest stories will appear here.</p><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">Trip Himalaya publishes feedback only after the administration team has received and approved it.</p></div>}</div></div></section> : null}

    <section id="plan" className="scroll-mt-20 bg-primary py-12"><div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_1.4fr] lg:items-center"><div><h2 className="font-display text-3xl font-extrabold leading-tight tracking-[.04em] text-primary-foreground sm:text-4xl">PLAN YOUR HIMACHAL TRIP</h2><p className="mt-3 text-sm text-primary-foreground/80">Tell us your requirements and we will plan the perfect trip for you.</p></div>{enquirySent ? <div className="rounded-md bg-primary-foreground/10 p-6 text-center"><CheckCircle2 className="mx-auto size-10 text-primary-foreground" /><h3 className="mt-3 font-display text-2xl font-bold text-primary-foreground">ENQUIRY RECEIVED</h3><p className="mt-2 text-sm text-primary-foreground/80">Thank you. Trip Himalaya will review your details.</p></div> : <form className="grid gap-3 sm:grid-cols-3" onSubmit={sendEnquiry}><input name="name" required placeholder="Your Name" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="phone" required placeholder="WhatsApp Number" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><div className="relative"><input name="travelDate" type={dateFieldFocused ? "date" : "text"} aria-label="Travel Date" placeholder="Date" onFocus={() => setDateFieldFocused(true)} onBlur={event => { if (!event.currentTarget.value) setDateFieldFocused(false); }} className="focus-ring w-full rounded-md bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none" />{!dateFieldFocused ? <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /> : null}</div><input name="partySize" placeholder="No. of Travellers" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="destination" placeholder="Destination / Places" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><button type="submit" disabled={enquiry.isPending} className="focus-ring flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold tracking-wide text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">{enquiry.isPending ? "SENDING…" : "SEND ENQUIRY"} <Send size={14} /></button>{enquiry.error ? <p className="text-sm text-red-200 sm:col-span-3">{enquiry.error.message}</p> : null}</form>}</div></section>

    <section className="bg-background py-14" aria-labelledby="find-us-title"><div className="mx-auto max-w-7xl px-5"><div className="text-center"><h2 id="find-us-title" className="font-display text-3xl font-extrabold tracking-[.04em] text-primary sm:text-4xl">FIND US HERE</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Visit Trip Himalaya in Dharamshala, Himachal Pradesh, or use the map to plan your route.</p><div className="mx-auto mt-3 h-[3px] w-14 rounded-full bg-accent" /></div><div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"><iframe title="Trip Himalaya location map" src="https://maps.google.com/maps?q=Trip%20Himalaya%2C%20Dharamshala%2C%20Himachal%20Pradesh&output=embed" className="h-[320px] w-full border-0 sm:h-[430px]" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><div className="flex items-center justify-center border-t border-border bg-card px-5 py-4 text-center"><a href="https://www.google.com/maps/search/?api=1&query=Trip%20Himalaya%2C%20Dharamshala" target="_blank" rel="noreferrer" className="focus-ring text-xs font-semibold text-primary underline decoration-accent underline-offset-4">Open Trip Himalaya in Google Maps <ExternalLink size={13} className="ml-1 inline-block" /></a></div></div></div></section>
  </PublicLayout>;
}
