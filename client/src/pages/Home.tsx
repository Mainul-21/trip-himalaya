import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { getImageVariant, resolveImageUrl } from "@/lib/imageDelivery";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, BadgeIndianRupee, CalendarDays, CheckCircle2, Compass, Headphones, Landmark, Leaf, MapPinned, Mountain, ShieldCheck, Star, TentTree } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";

const fallbackTripStyles = [
  { title: "Trekking", href: "/tours?style=trekking", image: "/manus-storage/cat-trekking_0c532a80.jpg", copy: "Guided walks with a pace that makes sense." },
  { title: "Culture & Local", href: "/tours?style=experiences", image: "/manus-storage/cat-spiritual_e35128a7.jpg", copy: "Dharamshala, food and local context." },
  { title: "Adventure", href: "/tours?style=adventure", image: "/manus-storage/cat-camping_f8918883.jpg", copy: "Active Himachal escapes with practical planning." },
  { title: "Short Breaks", href: "/tours?style=short-breaks", image: "/manus-storage/cat-village_2bd304a0.jpg", copy: "One- and two-day plans for a quick reset." },
  { title: "Best Sellers", href: "/tours?style=best-sellers", image: "/manus-storage/cat-tours_d33aa080.jpg", copy: "Journeys the Trip Himalaya team has marked." },
  { title: "Custom Plan", href: "/contact", image: "/manus-storage/cat-custom_207315af.jpg", copy: "Share your dates and build your own route." },
];

const trustPoints = [
  [MapPinned, "Local expertise", "Dharamshala-based planning"],
  [BadgeIndianRupee, "Clear pricing", "No hidden surprises"],
  [ShieldCheck, "Safe & practical", "Comfort and preparation first"],
  [Headphones, "Direct support", "Help before you travel"],
] as const;

const whyChoosePoints = [
  [MapPinned, "Local expertise", "Useful route context and practical guidance."],
  [ShieldCheck, "Safe & reliable", "Comfort and preparation come first."],
  [BadgeIndianRupee, "Clear pricing", "Straightforward costs before you commit."],
  [Compass, "Personal support", "A real conversation when you need it."],
  [Leaf, "Respectful travel", "Thoughtful mountain time and local care."],
] as const;

const travelStyleIcons = [Mountain, Landmark, TentTree, Compass, Star, CalendarDays] as const;

const suppliedStyleImages = [
  "/manus-storage/cat-trekking_0c532a80.jpg",
  "/manus-storage/cat-spiritual_e35128a7.jpg",
  "/manus-storage/cat-camping_f8918883.jpg",
  "/manus-storage/cat-village_2bd304a0.jpg",
  "/manus-storage/cat-tours_d33aa080.jpg",
  "/manus-storage/cat-custom_207315af.jpg",
] as const;

const legacyStyleImagePaths = new Set([
  "/manus-storage/triund-hikers_7653a06a.jpg",
  "/manus-storage/dharamshala-prayer-flags_26329188.jpg",
  "/manus-storage/triund-camp_ded436f5.jpg",
  "/manus-storage/dharamshala-valley_971eee0a.jpg",
  "/manus-storage/triund-trek-unsplash_2dd49872.jpg",
  "/manus-storage/dhauladhar-hut-panorama_c5effca1.jpg",
  "/manus-storage/triund-lake-unsplash_d755f9cf.jpg",
  "/manus-storage/dhauladhar-dharamshala_8ddd37f7.jpg",
  "/manus-storage/cat-trekking_9566f5de.jpg",
  "/manus-storage/cat-spiritual_d10e207e.jpg",
  "/manus-storage/cat-camping_e33b2e8c.jpg",
  "/manus-storage/cat-village_a2ed0b7f.jpg",
  "/manus-storage/cat-tours_2d6d5a59.jpg",
  "/manus-storage/cat-custom_d064e047.jpg",
]);

function getTravelStyleImage(image: string, index: number) {
  return legacyStyleImagePaths.has(image) ? suppliedStyleImages[index % suppliedStyleImages.length] : image;
}

function SectionRule() { return <span aria-hidden="true" className="mx-auto mt-3 block h-0.5 w-9 bg-[#e9781c]" />; }

export default function Home() {
  const { data: tours = [] } = trpc.tours.featured.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery(undefined, { retry: false });
  const { data: agency } = trpc.agency.get.useQuery(undefined, { staleTime: 60_000 });
  const topTours = selectTopFeaturedTours(tours);
  const visibleTripStyles = agency?.travelStyles?.length ? agency.travelStyles : fallbackTripStyles;
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const activeHero = heroSlides[activeHeroSlide];
  const enquiry = trpc.enquiries.create.useMutation();
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveHeroSlide(current => getNextHeroSlideIndex(current)), 4000);
    return () => window.clearInterval(timer);
  }, []);

  function sendEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const details = String(form.get("message")).trim();
    const travelDate = String(form.get("travelDate")).trim();
    const partySize = String(form.get("partySize")).trim();
    const destination = String(form.get("destination")).trim();
    const message = [details, travelDate && `Travel date: ${travelDate}`, partySize && `Travellers: ${partySize}`, destination && `Destination / place: ${destination}`].filter(Boolean).join("\n");
    enquiry.mutate({ name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")) || undefined, subject: "Homepage trip enquiry", message }, { onSuccess: () => setEnquirySent(true) });
  }

  return <PublicLayout>
    <section className="relative isolate overflow-hidden bg-[#0a3450] text-white">
      <div className="relative min-h-[540px] overflow-hidden sm:min-h-[585px]">
        <img key={activeHero.src} src={getImageVariant(activeHero.src, "hero")} alt="Dhauladhar landscape near Dharamshala" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-out motion-reduce:transition-none" fetchPriority="high" loading="eager" decoding="async" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,32,51,.88)_0%,rgba(4,32,51,.68)_42%,rgba(4,32,51,.18)_78%,rgba(4,32,51,.3)_100%)]" />
        <div className="container relative flex min-h-[540px] flex-col justify-center pb-24 pt-32 sm:min-h-[585px] sm:pb-28 sm:pt-36">
          <div className="max-w-3xl"><h1 className="rise-2 font-display text-3xl font-bold leading-tight tracking-wide text-white sm:text-5xl">Discover Himachal.<span className="mt-1 block text-[#ff951e]">Experience the Himalayas.</span></h1><p className="rise-3 mt-4 max-w-xl text-sm text-white/85">Thoughtful journeys, local knowledge and a clear plan for the mountains.</p></div>
          <div className="rise-3 mt-7 flex flex-wrap gap-4"><Link href="/tours" className="focus-ring inline-flex items-center gap-3 rounded-md bg-[#ef7916] px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition hover:bg-[#d9690b] active:scale-[.98]">Explore tours <span className="grid size-6 place-items-center rounded-full border border-white/60"><ArrowRight className="size-3.5" /></span></Link><Link href="/contact" className="focus-ring inline-flex items-center gap-3 rounded-md bg-white px-6 py-3 text-sm font-semibold tracking-wide text-[#123d5b] shadow-lg transition hover:bg-[#f7f1e8] active:scale-[.98]">Plan your trip <CalendarDays className="size-4 text-[#e9781c]" /></Link></div>
          <button type="button" onClick={() => setActiveHeroSlide(current => current === 0 ? heroSlides.length - 1 : current - 1)} className="focus-ring absolute left-4 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-white/50 text-white transition hover:bg-white/15 sm:grid" aria-label="Show previous hero image"><ArrowLeft className="size-[1.125rem]" /></button><button type="button" onClick={() => setActiveHeroSlide(current => getNextHeroSlideIndex(current))} className="focus-ring absolute right-4 top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-white/50 text-white transition hover:bg-white/15 sm:grid" aria-label="Show next hero image"><ArrowRight className="size-[1.125rem]" /></button>
        </div>
      </div>
      <div className="relative border-y border-white/20 bg-[#082f4b]/94"><div className="container grid divide-y divide-white/15 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">{trustPoints.map(([Icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-[#ffd09b]/35 bg-white/8 text-[#ffd09b]"><Icon className="size-[1.05rem]" /></span><span><strong className="block text-[.64rem] font-extrabold uppercase tracking-[.08em] text-white">{title}</strong><span className="mt-0.5 block text-[.7rem] leading-4 text-white/70">{copy}</span></span></div>)}</div></div>
    </section>

    <section className="border-b border-[#e3e8e3] bg-[#fbfcfa] py-11 sm:py-14"><div className="container"><div className="text-center"><h2 className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-bold uppercase tracking-[-.04em] text-[#123d5b]">Explore Himachal</h2><p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">{agency?.exploreTitle ?? "Pick a style to find a journey that fits."}</p><SectionRule /></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{visibleTripStyles.map((item, index) => { const Icon = travelStyleIcons[index % travelStyleIcons.length]; const image = getTravelStyleImage(item.image, index); return <Link key={item.title} href={item.href} className="group overflow-hidden rounded-md border border-[#dbe4e1] bg-white p-2.5 shadow-[0_4px_12px_rgba(18,61,91,.055)] transition hover:-translate-y-0.5 hover:border-[#e9a45a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e9781c] focus-visible:ring-offset-4"><div className="flex min-h-9 items-center justify-center"><Icon className="size-5 text-[#123d5b]" aria-hidden="true" /></div><h3 className="mt-1.5 text-center text-[.6rem] font-extrabold uppercase tracking-[.055em] text-[#123d5b] sm:text-[.66rem]">{item.title}</h3><div className="mt-2.5 h-24 overflow-hidden rounded-sm bg-[#e8efec] sm:h-28"><img src={getImageVariant(image, "card")} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" loading="lazy" fetchPriority="low" decoding="async" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" /></div><span className="sr-only">: {item.copy}</span></Link>; })}</div></div></section>

    <section className="bg-white py-12 sm:py-16"><div className="container"><div className="text-center"><h2 className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-bold uppercase tracking-[-.04em] text-[#123d5b]">Popular treks & tours</h2><SectionRule /></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} />) : <div className="col-span-full border border-dashed border-[#ccd9d7] bg-[#fbfcfa] p-10 text-center text-sm text-slate-500">New journeys are being prepared. Please check back shortly.</div>}</div><div className="mt-7 text-center"><Link href="/tours" className="focus-ring inline-flex h-10 items-center gap-2 rounded-sm bg-[#123d5b] px-5 text-[.66rem] font-extrabold uppercase tracking-[.09em] text-white transition hover:bg-[#0c2e47]">View all packages <ArrowRight className="size-4" /></Link></div></div></section>

    <section className="border-y border-[#e1eae6] bg-[#fafcfb] py-11 sm:py-14"><div className="container"><div className="text-center"><h2 className="font-display text-[clamp(2rem,3.6vw,2.9rem)] font-bold uppercase tracking-[-.04em] text-[#123d5b]">Why choose Trip Himalaya?</h2><SectionRule /></div><div className="mt-7 overflow-hidden rounded-md border border-[#dde6e2] bg-white sm:grid sm:grid-cols-2 lg:grid-cols-5">{whyChoosePoints.map(([Icon, title, copy], index) => <article key={String(title)} className={`flex gap-3 px-4 py-5 text-left ${index > 0 ? "border-t border-[#e9efec] sm:even:border-l lg:border-l lg:border-t-0" : ""}`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#123d5b] text-[#ffd09b]"><Icon className="size-5" /></span><span><h3 className="text-[.65rem] font-extrabold uppercase tracking-[.075em] text-[#123d5b]">{String(title)}</h3><p className="mt-1.5 text-[.76rem] leading-5 text-slate-500">{String(copy)}</p></span></article>)}</div></div></section>

    {reviews.length > 0 && <section className="bg-white py-11 sm:py-14"><div className="container"><div className="rounded-md border border-[#dce7e3] bg-[#fafcfb] p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-stretch"><div className="border-b border-[#dce7e3] pb-5 lg:w-[25%] lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6"><p className="text-[.65rem] font-extrabold uppercase tracking-[.15em] text-[#e9781c]">Traveller stories</p><h2 className="mt-2 font-display text-3xl font-bold leading-none tracking-[-.04em] text-[#123d5b]">Shared by travellers.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Only feedback verified and published by Trip Himalaya appears here.</p></div><div className="grid flex-1 gap-4 md:grid-cols-3">{reviews.slice(0, 3).map(review => <article key={review.id} className="min-w-0 border-b border-[#e5ece8] pb-4 last:border-b-0 md:border-b-0 md:border-r md:pr-4 md:last:border-r-0"><div className="flex items-center gap-2.5"><div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e6efeb] text-xs font-extrabold text-[#123d5b]">{review.reviewerImage ? <img src={resolveImageUrl(review.reviewerImage)} alt="" className="h-full w-full object-cover" /> : review.reviewerName.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#123d5b]">{review.reviewerName}</p><p className="mt-0.5 text-[.68rem] text-slate-500">{[review.location, review.sourceLabel].filter(Boolean).join(" · ")}</p></div></div><div className="mt-3 flex gap-0.5 text-[#e17818]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />)}</div><p className="mt-2.5 text-[.78rem] leading-5 text-slate-600">“{review.quote}”</p></article>)}</div></div></div></div></section>}

    <section className="relative overflow-hidden bg-[#123d5b] py-11 text-white sm:py-14"><img src={getImageVariant(heroSlides[0].src, "card")} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-25" loading="lazy" decoding="async" /><div className="absolute inset-0 bg-[#123d5b]/86" /><div className="container relative grid gap-7 lg:grid-cols-[.78fr_1.22fr] lg:items-center"><div><p className="text-[.65rem] font-extrabold uppercase tracking-[.16em] text-[#ffd09b]">Plan your Himachal trip</p><h2 className="mt-2 font-display text-4xl font-bold leading-[.93] tracking-[-.04em] sm:text-5xl">Tell us where you want to go.</h2><p className="mt-3 max-w-md text-sm leading-6 text-white/80">Share the essentials and Trip Himalaya will help you find a practical next step.</p></div>{enquirySent ? <div className="border border-white/20 bg-white/10 p-7 text-center"><CheckCircle2 className="mx-auto size-11 text-[#9af0ba]" /><h3 className="mt-4 font-display text-3xl font-bold">Enquiry received</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/78">Thank you. Our team will review your details.</p></div> : <form onSubmit={sendEnquiry} className="grid gap-2.5 border border-white/18 bg-[#0b3451]/72 p-3.5 backdrop-blur-sm sm:grid-cols-2 sm:p-4 lg:grid-cols-3"><label className="sr-only" htmlFor="home-enquiry-name">Your name</label><input id="home-enquiry-name" name="name" required placeholder="Your name" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-email">Email address</label><input id="home-enquiry-email" name="email" required type="email" placeholder="Email address" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-phone">Phone or WhatsApp</label><input id="home-enquiry-phone" name="phone" placeholder="Phone / WhatsApp" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-travel-date">Travel date</label><input id="home-enquiry-travel-date" name="travelDate" type="date" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none" /><label className="sr-only" htmlFor="home-enquiry-party-size">Number of travellers</label><input id="home-enquiry-party-size" name="partySize" placeholder="No. of travellers" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-destination">Destination or place</label><input id="home-enquiry-destination" name="destination" placeholder="Destination / place" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-message">Trip details</label><input id="home-enquiry-message" name="message" required placeholder="Tell us about your trip" className="focus-ring h-11 rounded-sm bg-white px-3 text-sm text-[#123d5b] outline-none placeholder:text-slate-400 sm:col-span-2" /><button disabled={enquiry.isPending} className="focus-ring h-11 rounded-sm bg-[#ef7916] px-5 text-[.68rem] font-extrabold uppercase tracking-[.06em] text-white transition hover:bg-[#d9690b] active:scale-[.98] disabled:opacity-60">{enquiry.isPending ? "Sending…" : "Send enquiry"}</button>{enquiry.error && <p className="text-sm text-red-200 sm:col-span-2 lg:col-span-3">{enquiry.error.message}</p>}</form>}</div></section>
  </PublicLayout>;
}
