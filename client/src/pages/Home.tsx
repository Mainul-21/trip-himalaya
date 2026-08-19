import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { getImageVariant, resolveImageUrl } from "@/lib/imageDelivery";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, BadgeIndianRupee, CalendarDays, CheckCircle2, Compass, Headphones, Landmark, Leaf, MapPinned, MessageCircle, Mountain, ShieldCheck, Star, TentTree } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";

const fallbackTripStyles = [
  { title: "Trekking", href: "/tours?style=trekking", image: "/manus-storage/triund-hikers_7653a06a.jpg", copy: "Guided walks with a pace that makes sense." },
  { title: "Culture & Local", href: "/tours?style=experiences", image: "/manus-storage/dharamshala-prayer-flags_26329188.jpg", copy: "Dharamshala, food and local context." },
  { title: "Adventure", href: "/tours?style=adventure", image: "/manus-storage/triund-camp_ded436f5.jpg", copy: "Active Himachal escapes with practical planning." },
  { title: "Short Breaks", href: "/tours?style=short-breaks", image: "/manus-storage/dharamshala-valley_971eee0a.jpg", copy: "One- and two-day plans for a quick reset." },
  { title: "Best Sellers", href: "/tours?style=best-sellers", image: "/manus-storage/triund-hikers_7653a06a.jpg", copy: "Journeys the Trip Himalaya team has marked." },
  { title: "Custom Plan", href: "/contact", image: "/manus-storage/dharamshala-prayer-flags_26329188.jpg", copy: "Share your dates and build your own route." },
];

const trustPoints = [
  [MapPinned, "Local expertise", "Dharamshala-based planning"],
  [BadgeIndianRupee, "Clear pricing", "No hidden surprises"],
  [ShieldCheck, "Safe & practical", "Comfort and preparation first"],
  [Headphones, "Direct support", "Help before you travel"],
] as const;

const whyChoosePoints = [
  [MapPinned, "Local expertise", "Dharamshala context, routes and practical answers."],
  [ShieldCheck, "Careful planning", "Comfort, timing and safety considered together."],
  [BadgeIndianRupee, "Clear pricing", "Straightforward costs before you commit."],
  [Compass, "Personal support", "A real conversation when you need guidance."],
  [Leaf, "Respectful travel", "Thoughtful mountain time and local consideration."],
] as const;

const travelStyleIcons = [Mountain, Landmark, TentTree, Compass, Star, CalendarDays] as const;

export default function Home() {
  const { data: tours = [] } = trpc.tours.featured.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery(undefined, { retry: false });
  const { data: agency } = trpc.agency.get.useQuery(undefined, { staleTime: 60_000 });
  const topTours = selectTopFeaturedTours(tours);
  const visibleTripStyles = agency?.travelStyles?.length ? agency.travelStyles : fallbackTripStyles;
  const verifiedStats = [
    { label: "Total tourists", value: agency?.touristCount ?? "" },
    { label: "Total tours", value: agency?.tourCount ?? "" },
    { label: agency?.thirdMetricLabel ?? "", value: agency?.thirdMetricValue ?? "" },
  ].filter(stat => stat.label && stat.value);
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
    enquiry.mutate({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")) || undefined,
      subject: "Homepage trip enquiry",
      message: String(form.get("message")),
    }, { onSuccess: () => setEnquirySent(true) });
  }

  return <PublicLayout>
    <section className="relative isolate min-h-[650px] overflow-hidden bg-[#0b3451] text-white sm:min-h-[720px]">
      <img key={activeHero.src} src={getImageVariant(activeHero.src, "hero")} alt="Dhauladhar landscape near Dharamshala" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none" fetchPriority="high" loading="eager" decoding="async" sizes="100vw" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,35,57,.88)_0%,rgba(5,35,57,.63)_47%,rgba(5,35,57,.2)_100%)]" />
      <div className="container relative flex min-h-[650px] flex-col justify-center pb-28 pt-32 sm:min-h-[720px] sm:pt-36">
        <div className="max-w-3xl">
          <p className="rise-1 text-xs font-extrabold uppercase tracking-[.18em] text-[#ffc27e]">Dharamshala · Himachal Pradesh</p>
          <h1 className="rise-2 mt-4 font-display text-[clamp(3rem,6.1vw,5.8rem)] font-bold leading-[.89] tracking-[-.05em]">Discover Himachal.<span className="mt-2 block text-[#ff971f]">Experience the Himalayas.</span></h1>
          <p className="rise-3 mt-6 max-w-xl text-base leading-7 text-white/86 sm:text-lg">Thoughtful journeys, local knowledge and a clear plan for the mountains.</p>
        </div>
        <div className="rise-3 mt-8 flex flex-wrap gap-3">
          <Link href="/tours" className="focus-ring inline-flex h-12 items-center gap-2 rounded-md bg-[#f17d14] px-5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(0,0,0,.16)] transition hover:bg-[#d9690b] active:scale-[.98]">Explore tours <ArrowRight className="size-4" /></Link>
          <Link href="/contact" className="focus-ring inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-extrabold text-[#123d5b] transition hover:bg-[#f7f1e8] active:scale-[.98]">Plan your trip <CalendarDays className="size-4" /></Link>
        </div>
        <div className="absolute bottom-8 left-4 right-4 flex items-center justify-between sm:left-6 sm:right-6 lg:left-10 lg:right-10">
          <button type="button" onClick={() => setActiveHeroSlide(current => current === 0 ? heroSlides.length - 1 : current - 1)} className="focus-ring grid size-11 place-items-center rounded-full border border-white/50 bg-[#0d3653]/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#123d5b]" aria-label="Show previous hero image"><ArrowLeft className="size-5" /></button>
          <div className="flex gap-2" aria-label="Hero image selection">{heroSlides.map((slide, index) => <button key={slide.src} type="button" onClick={() => setActiveHeroSlide(index)} className={`focus-ring h-1.5 rounded-full transition ${index === activeHeroSlide ? "w-8 bg-[#ff971f]" : "w-4 bg-white/50 hover:bg-white"}`} aria-label={`Show hero image ${index + 1}`} aria-current={index === activeHeroSlide ? "true" : undefined} />)}</div>
          <button type="button" onClick={() => setActiveHeroSlide(current => getNextHeroSlideIndex(current))} className="focus-ring grid size-11 place-items-center rounded-full border border-white/50 bg-[#0d3653]/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-[#123d5b]" aria-label="Show next hero image"><ArrowRight className="size-5" /></button>
        </div>
      </div>
      <div className="relative border-t border-white/15 bg-[#082f4b]/94 backdrop-blur-sm"><div className="container grid divide-y divide-white/15 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">{trustPoints.map(([Icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border border-[#ffc27e]/35 bg-white/8 text-[#ffc27e]"><Icon className="size-5" /></span><span><strong className="block text-[.68rem] font-extrabold uppercase tracking-[.08em] text-white">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-white/68">{copy}</span></span></div>)}</div></div>
    </section>

    <section className="border-b border-[#e5ece7] bg-white py-12 sm:py-14"><div className="container"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e9781c]">Explore Himachal</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.035em] text-[#123d5b] sm:text-4xl">{agency?.exploreTitle ?? "Choose your travel style."}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{agency?.exploreIntro ?? "Pick a style to find a journey that fits."}</p></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{visibleTripStyles.map((item, index) => { const Icon = travelStyleIcons[index % travelStyleIcons.length]; return <Link key={item.title} href={item.href} className="group overflow-hidden rounded-lg border border-[#dce6e3] bg-white shadow-[0_7px_18px_rgba(18,61,91,.07)] transition hover:-translate-y-0.5 hover:border-[#f0a45b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e9781c] focus-visible:ring-offset-4"><div className="relative h-24 overflow-hidden bg-[#e8efec]"><img src={getImageVariant(item.image, "card")} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" loading="lazy" fetchPriority="low" decoding="async" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" /></div><div className="p-3 text-center"><Icon className="mx-auto size-5 text-[#123d5b]" aria-hidden="true" /><h3 className="mt-2 text-[.68rem] font-extrabold uppercase tracking-[.065em] text-[#123d5b]">{item.title}</h3><span className="sr-only">: {item.copy}</span></div></Link>; })}</div></div></section>

    {verifiedStats.length > 0 && <section aria-label="Trip Himalaya figures" className="border-b border-[#e5ece7] bg-[#f8faf8] py-7"><div className="container grid gap-3 sm:grid-cols-3">{verifiedStats.map(stat => <article key={stat.label} className="border-l-2 border-[#f17d14] bg-white px-5 py-4"><p className="font-display text-3xl font-bold text-[#123d5b]">{stat.value}</p><p className="mt-1 text-xs font-extrabold uppercase tracking-[.1em] text-slate-500">{stat.label}</p></article>)}</div></section>}

    <section className="bg-[#f7faf8] py-14 sm:py-18"><div className="container"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e9781c]">Ready to go</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.035em] text-[#123d5b] sm:text-4xl">Popular treks & tours</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Current journeys selected and ordered by the Trip Himalaya team.</p></div><div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} />) : <div className="col-span-full border border-dashed border-[#ccd9d7] bg-white p-10 text-center text-sm text-slate-500">New journeys are being prepared. Please check back shortly.</div>}</div><div className="mt-8 text-center"><Link href="/tours" className="focus-ring inline-flex h-11 items-center gap-2 rounded-md bg-[#123d5b] px-5 text-xs font-extrabold uppercase tracking-[.09em] text-white transition hover:bg-[#0c2e47]">View all packages <ArrowRight className="size-4" /></Link></div></div></section>

    <section className="border-y border-[#e1eae6] bg-white py-14 sm:py-[4.5rem]"><div className="container"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e9781c]">Why choose Trip Himalaya</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.035em] text-[#123d5b] sm:text-4xl">Clear plans for mountain time.</h2></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{whyChoosePoints.map(([Icon, title, copy]) => <article key={String(title)} className="border border-[#dce7e3] bg-[#fbfdfc] p-5 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#123d5b] text-[#ffc27e]"><Icon className="size-5" /></span><h3 className="mt-4 text-xs font-extrabold uppercase tracking-[.075em] text-[#123d5b]">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{String(copy)}</p></article>)}</div></div></section>

    {reviews.length > 0 && <section className="bg-[#f7faf8] py-14 sm:py-18"><div className="container"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#e9781c]">Traveller stories</p><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.035em] text-[#123d5b] sm:text-4xl">Shared by travellers.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Only feedback verified and published by Trip Himalaya appears here.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reviews.slice(0, 3).map(review => <article key={review.id} className="border border-[#dce7e3] bg-white p-6"><div className="flex items-center gap-3"><div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e6efeb] text-sm font-extrabold text-[#123d5b]">{review.reviewerImage ? <img src={resolveImageUrl(review.reviewerImage)} alt="" className="h-full w-full object-cover" /> : review.reviewerName.slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-bold text-[#123d5b]">{review.reviewerName}</p><div className="mt-1 flex gap-0.5 text-[#e17818]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />)}</div></div></div><p className="mt-5 text-sm leading-7 text-slate-600">“{review.quote}”</p><p className="mt-5 border-t border-[#eee7dc] pt-4 text-xs text-slate-500">{[review.location, review.sourceLabel].filter(Boolean).join(" · ")}</p></article>)}</div></div></section>}

    <section className="relative overflow-hidden bg-[#123d5b] py-14 text-white sm:py-16"><img src={getImageVariant(heroSlides[0].src, "card")} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20" loading="lazy" decoding="async" /><div className="absolute inset-0 bg-[#123d5b]/88" /><div className="container relative grid gap-8 lg:grid-cols-[.88fr_1.12fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#ffc27e]">Plan your Himachal trip</p><h2 className="mt-3 font-display text-4xl font-bold leading-[.95] tracking-[-.04em] sm:text-5xl">Tell us where you want to go.</h2><p className="mt-4 max-w-md text-sm leading-7 text-white/78">Share the basics and Trip Himalaya will help you find a practical next step.</p></div>{enquirySent ? <div className="border border-white/20 bg-white/10 p-8 text-center"><CheckCircle2 className="mx-auto size-11 text-[#9af0ba]" /><h3 className="mt-4 font-display text-3xl font-bold">Enquiry received</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/78">Thank you. Our team will review your details.</p></div> : <form onSubmit={sendEnquiry} className="grid gap-3 rounded-lg border border-white/18 bg-[#0b3451]/72 p-4 backdrop-blur-sm sm:grid-cols-2 sm:p-5"><label className="sr-only" htmlFor="home-enquiry-name">Your name</label><input id="home-enquiry-name" name="name" required placeholder="Your name" className="focus-ring h-12 rounded-sm bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-email">Email address</label><input id="home-enquiry-email" name="email" required type="email" placeholder="Email address" className="focus-ring h-12 rounded-sm bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-phone">Phone or WhatsApp</label><input id="home-enquiry-phone" name="phone" placeholder="Phone / WhatsApp" className="focus-ring h-12 rounded-sm bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-message">Trip details</label><input id="home-enquiry-message" name="message" required placeholder="Dates, group size or trip idea" className="focus-ring h-12 rounded-sm bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><button disabled={enquiry.isPending} className="focus-ring h-12 rounded-sm bg-[#f17d14] px-5 text-sm font-extrabold text-white transition hover:bg-[#d9690b] active:scale-[.98] disabled:opacity-60 sm:col-span-2">{enquiry.isPending ? "Sending enquiry…" : "Send enquiry"}</button>{enquiry.error && <p className="text-sm text-red-200 sm:col-span-2">{enquiry.error.message}</p>}</form>}</div></section>
  </PublicLayout>;
}
