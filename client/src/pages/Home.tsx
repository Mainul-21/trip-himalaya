import TourCard from "@/components/TourCard";
import PublicLayout, { PublicHeader } from "@/components/PublicLayout";
import Seo from "@/components/Seo";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { getImageVariant } from "@/lib/imageDelivery";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeIndianRupee, CalendarDays, Car, CheckCircle2, ChevronLeft, ChevronRight, Compass, ExternalLink, Headphones, House, Leaf, Map, Mountain, MountainSnow, Quote, Send, ShieldCheck, Star, Tent, Users } from "lucide-react";
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
  const [enquirySent, setEnquirySent] = useState(false);
  const [dateFieldFocused, setDateFieldFocused] = useState(false);
  const enquiry = trpc.enquiries.create.useMutation();
  const activeHeroSlides = useMemo(() => agency?.heroImages?.length ? agency.heroImages.map(src => ({ src })) : heroSlides, [agency?.heroImages]);
  const activeHero = activeHeroSlides[activeHeroSlide] || activeHeroSlides[0];
  const homepageBadges = agency?.heroBadges?.length ? agency.heroBadges : fallbackHeroBadges;
  const whyTripItems = agency?.whyTripItems?.length ? agency.whyTripItems : fallbackWhyTripItems;
  const verifiedAverage = reviews.length ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length : 0;
  const googleReviewsUrl = agency?.googleMapsUrl?.trim();
  const reviewSectionTitle = agency?.reviewSectionTitle || "REAL JOURNEYS. HONEST STORIES.";
  const reviewSectionIntro = agency?.reviewSectionIntro || "Guest feedback, published carefully by the Trip Himalaya team. Every displayed rating comes from these approved stories.";
  const reviewCtaLabel = agency?.reviewCtaLabel || "VIEW INDEPENDENT FEEDBACK";
  const reviewCtaUrl = agency?.reviewCtaEnabled === false ? "" : googleReviewsUrl;

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
    <Seo title="Best Tour Agency in Dharamshala, India | Trip Himalaya" description="Plan Dharamshala tour packages, McLeod Ganj visits, Himachal Pradesh treks and private Himalayan holidays with Trip Himalaya’s practical local guidance." structuredData={agencySchema} />
    <section className="relative">
      <img src={getImageVariant(activeHero.src, "hero")} alt="Himalayan valley with camping tents in Himachal Pradesh" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" loading="eager" decoding="async" sizes="100vw" />
      <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero-overlay)" }} />
      <PublicHeader profile={agency} />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-6 pt-14 sm:pt-20"><h1 className="font-display text-3xl font-bold leading-tight tracking-wide text-primary-foreground sm:text-5xl">{agency?.heroTitle || "DISCOVER HIMACHAL."}<span className="mt-1 block text-accent">{agency?.heroAccentTitle || "EXPERIENCE THE HIMALAYAS."}</span></h1><p className="mt-4 text-sm text-primary-foreground/85">{agency?.heroSubtitle || "Curated journeys. Local expertise. Unforgettable memories."}</p><div className="mt-7 flex flex-wrap gap-4"><a href="#packages" onClick={event => { event.preventDefault(); scrollToSection("packages"); }} className="focus-ring inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-wide text-accent-foreground shadow-lg transition-transform hover:scale-[1.03]">EXPLORE TOURS <span className="grid h-6 w-6 place-items-center rounded-full border border-accent-foreground/60"><ArrowRight size={13} /></span></a><a href="/contact" onClick={event => { event.preventDefault(); scrollToSection("plan"); }} className="focus-ring inline-flex items-center gap-3 rounded-full bg-background px-6 py-3 text-sm font-semibold tracking-wide text-primary shadow-lg transition-transform hover:scale-[1.03]">PLAN YOUR TRIP <CalendarDays size={16} className="text-accent" /></a></div></div>
      <button type="button" aria-label="Previous slide" onClick={() => setActiveHeroSlide(current => current === 0 ? activeHeroSlides.length - 1 : current - 1)} className="focus-ring absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronLeft size={18} /></button><button type="button" aria-label="Next slide" onClick={() => setActiveHeroSlide(current => getNextHeroSlideIndex(current, activeHeroSlides.length))} className="focus-ring absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary-foreground/50 text-primary-foreground transition-colors hover:bg-primary-foreground/15 sm:grid"><ChevronRight size={18} /></button>
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8"><div className="grid gap-5 rounded-md bg-primary-deep/85 px-6 py-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">{homepageBadges.map((item, index) => { const Icon = heroBadgeIcons[index % heroBadgeIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-center gap-3"><Icon size={26} className="shrink-0 text-primary-foreground" /><div><p className="text-xs font-semibold text-primary-foreground">{item.title}</p><p className="text-[11px] text-primary-foreground/70">{item.copy}</p></div></div>; })}</div></div>
    </section>

    <section className="bg-background py-12"><div className="mx-auto max-w-7xl px-5"><SectionTitle sub="Choose your perfect experience">EXPLORE HIMACHAL</SectionTitle><div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{categories.map((item, index) => { const Icon = travelStyleIcons[index % travelStyleIcons.length]; return <Link key={`${item.title}-${item.href}`} href={item.href} className="focus-ring group overflow-hidden rounded-md border border-border bg-card p-3 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"><div className="flex flex-col items-center gap-2 pb-3"><Icon size={26} className="text-primary" /><p className="text-center text-[11px] font-semibold tracking-wide text-primary">{item.title}</p></div><img src={getImageVariant(item.image, "card")} alt={item.title.toLowerCase()} width={640} height={512} loading="lazy" decoding="async" className="h-28 w-full rounded-sm object-cover" /></Link>; })}</div></div></section>

    <section id="packages" className="scroll-mt-20 bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>POPULAR TREKS &amp; TOURS</SectionTitle><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} whatsappNumber={agency?.whatsapp} />) : <div className="col-span-full border border-dashed border-border p-10 text-center text-sm text-muted-foreground">New journeys are being prepared. Please check back shortly.</div>}</div><div className="mt-8 flex justify-center"><Link href="/tours" className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold tracking-wide text-primary-foreground transition-transform hover:scale-[1.03]">VIEW ALL PACKAGES <span className="grid h-5 w-5 place-items-center rounded-full border border-primary-foreground/50"><ChevronRight size={12} /></span></Link></div></div></section>

    <section className="bg-background pb-14"><div className="mx-auto max-w-7xl px-5"><SectionTitle>{agency?.whyTripTitle || "WHY TRIP HIMALAYA?"}</SectionTitle><div className="mt-8 grid gap-6 rounded-md border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-5">{whyTripItems.map((item, index) => { const Icon = whyTripIcons[index % whyTripIcons.length]; return <div key={`${item.title}-${index}`} className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon size={20} /></span><div><p className="text-[11px] font-bold tracking-wide text-primary">{item.title}</p><p className="mt-1 text-[11px] leading-snug text-muted-foreground">{item.copy}</p></div></div>; })}</div></div></section>

    {reviews.length || reviewCtaUrl ? <section className="bg-[linear-gradient(180deg,#f8fbfa_0%,#ffffff_100%)] pb-16 pt-2" aria-labelledby="traveller-stories-title"><div className="mx-auto max-w-7xl px-5"><div className="overflow-hidden rounded-2xl border border-[#dbe8e4] bg-card shadow-[0_22px_60px_rgba(18,61,91,.10)]"><div className="grid lg:grid-cols-[.9fr_2.1fr]"><aside className="relative overflow-hidden bg-primary p-7 text-primary-foreground sm:p-9"><div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border border-primary-foreground/10" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-primary-foreground"><CheckCircle2 size={13} className="text-accent" /> Traveller feedback</span><h2 id="traveller-stories-title" className="mt-5 font-display text-2xl font-bold tracking-wide">{reviewSectionTitle}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/78">{reviewSectionIntro}</p>{reviews.length ? <div className="mt-6 rounded-xl border border-primary-foreground/15 bg-primary-deep/30 p-4"><div className="flex items-center gap-3"><span className="text-3xl font-bold text-accent">{verifiedAverage.toFixed(1)}</span><div><Stars rating={verifiedAverage} /><p className="mt-1 text-[11px] text-primary-foreground/70">Average from {reviews.length} published guest {reviews.length === 1 ? "review" : "reviews"}</p></div></div></div> : <div className="mt-6 rounded-xl border border-primary-foreground/15 bg-primary-deep/30 p-4 text-sm leading-6 text-primary-foreground/78">Use the review source below to read independent guest feedback.</div>}{reviewCtaUrl ? <a href={reviewCtaUrl} target="_blank" rel="noreferrer" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-xs font-bold tracking-wide text-accent-foreground transition-transform hover:scale-[1.02]">{reviewCtaLabel} <ExternalLink size={15} /></a> : <Link href="/contact" className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-background px-4 py-3 text-xs font-bold tracking-wide text-primary transition-transform hover:scale-[1.02]">CONTACT TRIP HIMALAYA <ChevronRight size={15} /></Link>}<p className="mt-4 text-[10px] leading-5 text-primary-foreground/55">Review link and all displayed guest feedback are controlled by Trip Himalaya administration.</p></div></aside><div className="p-5 sm:p-7"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent">Guest notes</p><h3 className="mt-1 font-display text-xl font-bold tracking-wide text-primary">WHAT OUR TRAVELLERS SAY</h3></div>{reviewCtaUrl ? <a href={reviewCtaUrl} target="_blank" rel="noreferrer" className="focus-ring hidden items-center gap-1.5 text-xs font-semibold text-primary underline decoration-accent underline-offset-4 sm:inline-flex">{reviewCtaLabel} <ExternalLink size={13} /></a> : null}</div>{reviews.length ? <div className="grid gap-4 md:grid-cols-3">{reviews.slice(0, 3).map(item => <article key={item.id} className="group rounded-xl border border-[#e2ece8] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_30px_rgba(18,61,91,.08)]"><div className="flex items-start justify-between gap-3"><Stars rating={item.rating} /><Quote size={22} className="text-accent/65" aria-hidden="true" /></div><p className="mt-4 line-clamp-5 text-sm leading-6 text-slate-600">“{item.quote}”</p><div className="mt-5 flex items-center gap-3 border-t border-[#edf2f0] pt-4"><span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#edf4f1] text-xs font-extrabold text-primary">{item.reviewerImage ? <img src={item.reviewerImage} alt="" className="h-full w-full object-cover" /> : item.reviewerName.charAt(0)}</span><div className="min-w-0"><p className="truncate text-xs font-bold text-primary">{item.reviewerName}</p><p className="truncate text-[10px] text-muted-foreground">{item.location || item.sourceLabel || "Published guest feedback"}</p></div></div></article>)}</div> : <div className="rounded-xl border border-dashed border-[#c7d8d2] bg-[#f8fbfa] p-7 text-center"><p className="text-sm font-semibold text-primary">Guest stories will appear here.</p><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-foreground">Trip Himalaya publishes feedback only after the administration team has received and approved it.</p></div>}</div></div></div></div></section> : null}

    <section id="plan" className="scroll-mt-20 bg-primary py-12"><div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_1.4fr] lg:items-center"><div><h2 className="font-display text-2xl font-bold tracking-wide text-primary-foreground">PLAN YOUR HIMACHAL TRIP</h2><p className="mt-3 text-sm text-primary-foreground/80">Tell us your requirements and we will plan the perfect trip for you.</p></div>{enquirySent ? <div className="rounded-md bg-primary-foreground/10 p-6 text-center"><CheckCircle2 className="mx-auto size-10 text-primary-foreground" /><h3 className="mt-3 font-display text-2xl font-bold text-primary-foreground">ENQUIRY RECEIVED</h3><p className="mt-2 text-sm text-primary-foreground/80">Thank you. Trip Himalaya will review your details.</p></div> : <form className="grid gap-3 sm:grid-cols-3" onSubmit={sendEnquiry}><input name="name" required placeholder="Your Name" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="phone" required placeholder="WhatsApp Number" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><div className="relative"><input name="travelDate" type={dateFieldFocused ? "date" : "text"} aria-label="Travel Date" placeholder="Date" onFocus={() => setDateFieldFocused(true)} onBlur={event => { if (!event.currentTarget.value) setDateFieldFocused(false); }} className="focus-ring w-full rounded-md bg-background px-3 py-2.5 pr-9 text-sm text-foreground outline-none" />{!dateFieldFocused ? <CalendarDays size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" /> : null}</div><input name="partySize" placeholder="No. of Travellers" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><input name="destination" placeholder="Destination / Places" className="focus-ring rounded-md bg-background px-3 py-2.5 text-sm text-foreground outline-none" /><button type="submit" disabled={enquiry.isPending} className="focus-ring flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold tracking-wide text-accent-foreground transition-transform hover:scale-[1.02] disabled:opacity-60">{enquiry.isPending ? "SENDING…" : "SEND ENQUIRY"} <Send size={14} /></button>{enquiry.error ? <p className="text-sm text-red-200 sm:col-span-3">{enquiry.error.message}</p> : null}</form>}</div></section>
  </PublicLayout>;
}
