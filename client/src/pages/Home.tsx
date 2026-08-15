import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { selectTopFeaturedTours } from "@/lib/featuredTours";
import { getNextHeroSlideIndex, heroSlides } from "@/lib/heroSlideshow";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CalendarDays, CheckCircle2, Compass, MapPinned, MessageCircle, Mountain, Search, Star, UsersRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

const experiences = [
  { title: "Trekking", filter: "Trekking", image: "/manus-storage/triund-hikers_7653a06a.jpg", copy: "Guided walks with a pace that makes sense." },
  { title: "Local days", filter: "Experiences", image: "/manus-storage/dharamshala-prayer-flags_26329188.jpg", copy: "Dharamshala, food and culture with context." },
  { title: "Camping", filter: "Adventure", image: "/manus-storage/triund-camp_ded436f5.jpg", copy: "Simple mountain stays for active groups." },
  { title: "All journeys", filter: "All", image: "/manus-storage/dharamshala-valley_971eee0a.jpg", copy: "See every current Himachal trip." },
];

const trustPoints = [
  [MapPinned, "Dharamshala base", "Local help before you arrive."],
  [CalendarDays, "Clear trip plan", "Route, stay, timing and price."],
  [MessageCircle, "Direct support", "Talk to a real planning desk."],
  [Mountain, "Mountain-first journeys", "Treks, stays and day plans."],
] as const;

const planningPoints = [
  [MapPinned, "Start with the right route", "We help match the route to your dates, group and experience."],
  [Compass, "Know the practical details", "Get clear guidance before you decide to travel."],
  [UsersRound, "Speak to a local team", "Ask questions before booking and get a straight answer."],
];

export default function Home() {
  const { data: tours = [] } = trpc.tours.featured.useQuery();
  const { data: reviews = [] } = trpc.reviews.list.useQuery(undefined, { retry: false });
  const topTours = selectTopFeaturedTours(tours);
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const newsletter = trpc.newsletter.subscribe.useMutation();
  const enquiry = trpc.enquiries.create.useMutation();
  const [email, setEmail] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveHeroSlide(current => getNextHeroSlideIndex(current));
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function subscribe(event: FormEvent) {
    event.preventDefault();
    newsletter.mutate({ email }, { onSuccess: () => setEmail("") });
  }

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
    <section className="relative isolate min-h-[610px] overflow-hidden bg-[#0e3d5c] text-white sm:min-h-[650px]">
      {heroSlides.map((slide, index) => <img key={slide.src} src={slide.src} alt="" aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${activeHeroSlide === index ? "opacity-100" : "opacity-0"}`} fetchPriority={index === 0 ? "high" : "auto"} />)}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,61,.92)_0%,rgba(7,39,61,.69)_48%,rgba(7,39,61,.18)_100%)]" />
      <div className="container relative flex min-h-[610px] flex-col justify-center py-28 sm:min-h-[650px]">
        <div className="max-w-2xl">
          <p className="rise text-xs font-extrabold uppercase tracking-[.15em] text-[#f6a85c]">Trip Himalaya · Dharamshala</p>
          <h1 className="rise-2 mt-4 font-display text-[clamp(3rem,6.1vw,5.2rem)] font-bold leading-[.95] tracking-[-.035em]">DISCOVER HIMACHAL.</h1>
          <h1 className="rise-2 mt-4 font-display text-[clamp(3rem,6.1vw,5.2rem)] font-bold leading-[.95] tracking-[-.035em]">EXPERIENCE THE HIMALAYAS.</h1>

          <p className="rise-3 mt-5 max-w-xl text-base leading-7 text-white/84 sm:text-lg">Treks, local stays and private Himachal journeys planned around your time, group and comfort.</p>
        </div>
        <div className="rise-3 mt-7 flex flex-wrap gap-3">
          <Link href="/tours" className="focus-ring inline-flex h-12 items-center gap-2 rounded-md bg-[#e9781c] px-5 text-sm font-bold text-white transition hover:bg-[#d86b12] active:scale-[.98]">Explore journeys <ArrowRight className="size-4" /></Link>
          <Link href="/contact" className="focus-ring inline-flex h-12 items-center gap-2 rounded-md border border-white/45 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/18 active:scale-[.98]"><CalendarDays className="size-4" /> Plan your trip</Link>
        </div>
        <form onSubmit={search} className="rise-3 mt-9 grid max-w-2xl gap-2 border border-white/20 bg-[#123d5b]/68 p-2 backdrop-blur-sm sm:grid-cols-[1fr_auto]" role="search">
          <label className="sr-only" htmlFor="hero-search">Search trips</label>
          <div className="flex items-center gap-3 px-3"><Search className="size-5 shrink-0 text-[#f5a653]" /><input id="hero-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Triund, Bir or a trip type" className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/58" /></div>
          <button className="focus-ring h-11 bg-white px-5 text-sm font-bold text-[#123d5b] transition hover:bg-[#f7f1e8] active:scale-[.98]">Search</button>
        </form>
      </div>
      <div className="relative border-t border-white/14 bg-[#0b3553]/95"><div className="container grid divide-y divide-white/12 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">{trustPoints.map(([Icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full border border-[#f6a85c]/30 bg-white/8 text-[#f6a85c]"><Icon className="size-[18px]" /></span><span><strong className="block text-xs font-extrabold uppercase tracking-[.08em] text-white">{title}</strong><span className="mt-0.5 block text-xs leading-5 text-white/66">{copy}</span></span></div>)}</div></div>
    </section>

    <section className="py-16 sm:py-20"><div className="container"><div className="grid gap-5 lg:grid-cols-[1fr_.68fr] lg:items-end"><div><p className="eyebrow">Find your way into Himachal</p><h2 className="section-title mt-3">Choose a trip style.</h2></div></div><div className="mt-8 grid gap-px overflow-hidden border border-[#dfe8e8] bg-[#dfe8e8] sm:grid-cols-2 lg:grid-cols-4">{experiences.map(item => <Link key={item.title} href={`/tours?category=${encodeURIComponent(item.filter)}`} className="group relative isolate h-56 overflow-hidden bg-[#123d5b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e9781c] focus-visible:ring-offset-4"><img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-[#082f4b]/94 via-[#082f4b]/18 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><h3 className="font-display text-2xl font-bold leading-none">{item.title}</h3><p className="mt-2 text-sm leading-5 text-white/75">{item.copy}</p></div></Link>)}</div></div></section>

    <section className="border-y border-[#e5ece7] bg-[#fbfaf6] py-16 sm:py-20"><div className="container"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Featured journeys</p><h2 className="section-title mt-3">Top 4 journeys.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Four current Himachal journeys selected and ordered by the Trip Himalaya team.</p></div><Link href="/tours" className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-[#123d5b] hover:text-[#e17818]">See all journeys <ArrowRight className="size-4" /></Link></div><div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{topTours.length ? topTours.map(tour => <TourCard key={tour.id} tour={tour} />) : <div className="col-span-full border border-dashed border-[#ccd9d7] p-10 text-center text-sm text-slate-500">New journeys are being prepared. Please check back shortly.</div>}</div></div></section>

    <section className="py-16 sm:py-20"><div className="container grid gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center"><img src="/manus-storage/dharamshala-prayer-flags_26329188.jpg" alt="Prayer flags in Dharamshala" className="h-[335px] w-full object-cover sm:h-[390px]" loading="lazy" /><div><p className="eyebrow">Planning from Dharamshala</p><h2 className="section-title mt-3 max-w-xl">Useful advice before you book.</h2><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">A mountain trip works better when the route, season and pace are considered early. Tell us what you have in mind and we will help you start simply.</p><div className="mt-8 divide-y divide-[#dfe8e8] border-y border-[#dfe8e8]">{planningPoints.map(([Icon, title, copy]) => <div key={String(title)} className="flex gap-4 py-4"><Icon className="mt-0.5 size-5 shrink-0 text-[#e17818]" /><span><strong className="text-sm text-[#123d5b]">{String(title)}</strong><p className="mt-1 text-sm leading-6 text-slate-500">{String(copy)}</p></span></div>)}</div></div></div></section>

    <section className="bg-[#123d5b] py-16 text-white"><div className="container grid gap-9 lg:grid-cols-[.82fr_1.18fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#f39a48]">Start with a simple enquiry</p><h2 className="font-display mt-3 max-w-lg text-4xl font-bold leading-[.98] sm:text-5xl">Tell us the basics. We will help with the next step.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/72">Dates, group size and the kind of trip you are considering are enough to start.</p></div>{enquirySent ? <div className="border border-white/15 bg-white/10 p-8 text-center"><CheckCircle2 className="mx-auto size-11 text-[#7ae4a5]" /><h3 className="font-display mt-4 text-3xl font-bold">Enquiry received</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/72">Thank you. Our team will review your details.</p></div> : <form onSubmit={sendEnquiry} className="grid gap-3 border border-white/15 bg-white/8 p-4 sm:grid-cols-2 sm:p-5"><label className="sr-only" htmlFor="home-enquiry-name">Your name</label><input id="home-enquiry-name" name="name" required placeholder="Your name" className="focus-ring h-12 bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-email">Email address</label><input id="home-enquiry-email" name="email" required type="email" placeholder="Email address" className="focus-ring h-12 bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-phone">Phone or WhatsApp</label><input id="home-enquiry-phone" name="phone" placeholder="Phone / WhatsApp" className="focus-ring h-12 bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><label className="sr-only" htmlFor="home-enquiry-message">Trip details</label><input id="home-enquiry-message" name="message" required placeholder="Dates, group size or your trip idea" className="focus-ring h-12 bg-white px-4 text-sm text-[#123d5b] outline-none placeholder:text-slate-400" /><button disabled={enquiry.isPending} className="focus-ring h-12 bg-[#f39a48] px-5 text-sm font-bold text-[#173d57] transition hover:bg-[#ffc17e] active:scale-[.98] disabled:opacity-60 sm:col-span-2">{enquiry.isPending ? "Sending enquiry…" : "Send enquiry"}</button>{enquiry.error && <p className="text-sm text-red-200 sm:col-span-2">{enquiry.error.message}</p>}</form>}</div></section>

    {reviews.length > 0 && <section className="bg-[#f8f5ef] py-16 sm:py-20"><div className="container"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Traveller feedback</p><h2 className="section-title mt-3">Shared by travellers.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Only feedback verified and published by Trip Himalaya appears here.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reviews.slice(0, 3).map(review => <article key={review.id} className="border border-[#eadfce] bg-white p-6"><div className="flex items-center gap-3"><div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e6efeb] text-sm font-extrabold text-[#123d5b]">{review.reviewerImage ? <img src={review.reviewerImage} alt="" className="h-full w-full object-cover" /> : review.reviewerName.slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-bold text-[#123d5b]">{review.reviewerName}</p><div className="mt-1 flex gap-0.5 text-[#e17818]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3 ${index < review.rating ? "fill-current" : "text-slate-200"}`} />)}</div></div></div><p className="mt-5 text-sm leading-7 text-slate-600">“{review.quote}”</p><p className="mt-5 border-t border-[#eee7dc] pt-4 text-xs text-slate-500">{[review.location, review.sourceLabel].filter(Boolean).join(" · ")}</p></article>)}</div></div></section>}

    <section className="border-t border-[#254f68] bg-[#0d3653] py-12 text-white"><div className="container grid gap-5 lg:grid-cols-[1.25fr_.75fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#f39a48]">Dharamshala travel notes</p><h2 className="font-display mt-2 text-3xl font-bold leading-none sm:text-4xl">Useful notes, sent occasionally.</h2></div><form onSubmit={subscribe} className="border border-white/15 bg-white/8 p-3"><label className="sr-only" htmlFor="newsletter-email">Email address</label><div className="flex gap-2"><input id="newsletter-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Your email address" className="focus-ring h-12 min-w-0 flex-1 bg-white px-4 text-sm text-[#123d5b] outline-none" /><button disabled={newsletter.isPending} className="focus-ring bg-[#f39a48] px-4 text-sm font-bold text-[#173d57] disabled:opacity-60">{newsletter.isPending ? "Saving" : "Subscribe"}</button></div>{newsletter.isSuccess && <p className="px-2 pt-2 text-xs text-white/75">You are on the list. Thank you.</p>}</form></div></section>
  </PublicLayout>;
}
