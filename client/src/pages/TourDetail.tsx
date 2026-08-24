import PublicLayout, { WhatsAppIcon } from "@/components/PublicLayout";
import TourPhotoCarousel from "@/components/TourPhotoCarousel";
import { trpc } from "@/lib/trpc";
import { buildTourWhatsAppMessage } from "@/lib/tourWhatsApp";
import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  Mountain,
} from "lucide-react";
import { Link, useRoute } from "wouter";

export default function TourDetail() {
  const [, params] = useRoute("/tours/:slug");
  const { data: tour, isLoading } = trpc.tours.bySlug.useQuery(
    { slug: params?.slug ?? "" },
    { enabled: Boolean(params?.slug) }
  );
  if (isLoading)
    return (
      <PublicLayout>
        <div className="container py-32 text-center text-slate-500">
          Loading your Himalayan journey…
        </div>
      </PublicLayout>
    );
  if (!tour)
    return (
      <PublicLayout>
        <div className="container py-32">
          <h1 className="section-title">Journey not found.</h1>
          <Link
            href="/tours"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#123d5b]"
          >
            <ArrowLeft className="size-4" /> Back to all journeys
          </Link>
        </div>
      </PublicLayout>
  );
  const whatsAppMessage = buildTourWhatsAppMessage(tour);
  const isBestSeller = "isBestSeller" in tour && Boolean(tour.isBestSeller);
  return (
    <PublicLayout>
      <section className="relative isolate min-h-[30rem] overflow-hidden bg-[#123d5b] text-white sm:min-h-[34rem] lg:min-h-[38rem]">
        <div className="absolute inset-0 z-0">
          <TourPhotoCarousel
            title={tour.title}
            location={tour.location}
            heroImage={tour.heroImage}
            gallery={tour.gallery}
            priority
            className="h-full w-full rounded-none"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(5,35,55,.9),rgba(5,35,55,.48),rgba(5,35,55,.2))]" />
        <div className="container relative z-20 flex min-h-[30rem] flex-col justify-end py-14 sm:min-h-[34rem] sm:py-20 lg:min-h-[38rem] lg:py-24">
          <Link
            href="/tours"
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs font-bold uppercase tracking-[.1em] text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> All journeys
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-extrabold uppercase tracking-[.16em]">
            <p className="text-[#f39a48]">{tour.category}</p>
            {isBestSeller && <span className="border border-[#f39a48]/55 bg-[#e9781c] px-2.5 py-1 text-[.6rem] tracking-[.12em] text-white">Best Seller</span>}
          </div>
          <h1 className="display mt-3 max-w-3xl text-[clamp(2.8rem,6.4vw,5rem)] font-bold leading-[.92] tracking-[-.035em]">
            {tour.title}
          </h1>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/82">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-[#f39a48]" />
              {tour.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-[#f39a48]" />
              {tour.duration}
            </span>
            <span className="inline-flex items-center gap-2">
              <Mountain className="size-4 text-[#f39a48]" />
              {tour.difficulty}
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeIndianRupee className="size-4 text-[#f39a48]" />
              From ₹{tour.priceFrom.toLocaleString("en-IN")} per person
            </span>
          </div>
        </div>
      </section>
      <section className="container grid gap-12 py-16 lg:grid-cols-[1fr_360px] lg:py-20">
        <div>
          <section>
            <p className="eyebrow">Overview</p>
            <h2 className="section-title mt-3 text-[clamp(2.15rem,4vw,3.25rem)] leading-[.96]">The journey.</h2>
            <p className="mt-5 max-w-3xl text-[1.05rem] leading-8 text-slate-600 sm:text-[1.125rem]">{tour.overview}</p>
          </section>
          <div className="mt-12">
            <p className="eyebrow">Good to know</p>
            <h2 className="section-title mt-3 text-[clamp(2.15rem,4vw,3.25rem)] leading-[.96]">Trip highlights</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map(highlight => (
                <div
                  key={highlight}
                  className="flex gap-3 rounded-2xl border border-[#dbe7e5] bg-[#f8fbfa] px-4 py-4 text-[.98rem] font-semibold leading-6 text-[#214861] shadow-[0_8px_22px_rgba(18,61,91,.04)]"
                >
                  <Check className="mt-0.5 size-[1.15rem] shrink-0 text-[#e17818]" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14">
            <p className="eyebrow">A clear rhythm</p>
            <h2 className="section-title mt-3 text-[clamp(2.15rem,4vw,3.25rem)] leading-[.96]">Day by day</h2>
            <ol className="mt-8 grid gap-4">
              {tour.itinerary.map(item => (
                <li
                  key={item.day}
                  className="grid gap-4 rounded-2xl border border-[#dbe7e5] bg-white px-5 py-6 shadow-[0_10px_26px_rgba(18,61,91,.055)] sm:grid-cols-[112px_1fr] sm:px-6"
                >
                  <span className="display text-[1.85rem] font-bold leading-none text-[#e17818] sm:text-[2.1rem]">
                    {item.day}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.1rem] font-bold leading-6 text-[#123d5b] sm:text-[1.2rem]">{item.title}</h3>
                    <p className="mt-2.5 text-[.98rem] leading-7 text-slate-600 sm:text-[1.04rem]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            <DetailList
              title="What’s included"
              icon={Check}
              entries={tour.inclusions}
            />
            <DetailList
              title="What’s not included"
              icon={CircleAlert}
              entries={tour.exclusions}
            />
          </div>
          <section className="mt-14 rounded-[1.5rem] border border-[#d8e8e8] bg-[#f2f8f8] px-6 py-8 sm:px-8 sm:py-10">
            <p className="eyebrow">Important information</p>
            <h2 className="section-title mt-3 max-w-3xl text-[clamp(2.05rem,4vw,3.1rem)] leading-[.96]">Prepare with the conditions in mind.</h2>
            <p className="mt-5 max-w-2xl text-[1rem] leading-7 text-slate-600 sm:text-[1.08rem]">Before confirming, discuss your dates, fitness level, expected mountain weather, and any stay or dietary needs with Trip Himalaya. The team can help you understand the practical preparations for this journey.</p>
          </section>
          <section className="mt-14">
            <p className="eyebrow">Questions before you go</p>
            <h2 className="section-title mt-3 text-[clamp(2.15rem,4vw,3.25rem)] leading-[.96]">Frequently asked questions.</h2>
            <div className="mt-8 grid gap-3">
              <details className="group rounded-2xl border border-[#dbe7e5] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(18,61,91,.045)] sm:px-6">
                <summary className="cursor-pointer list-none pr-8 text-[1rem] font-bold leading-6 text-[#123d5b] marker:hidden sm:text-[1.08rem]">How do I check availability for my preferred dates?</summary>
                <p className="mt-3 max-w-2xl text-[.98rem] leading-7 text-slate-600 sm:text-[1.02rem]">Send a tour request with your dates and group size. Trip Himalaya will confirm the current availability before anything is final.</p>
              </details>
              <details className="group rounded-2xl border border-[#dbe7e5] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(18,61,91,.045)] sm:px-6">
                <summary className="cursor-pointer list-none pr-8 text-[1rem] font-bold leading-6 text-[#123d5b] marker:hidden sm:text-[1.08rem]">Can I ask questions before I book?</summary>
                <p className="mt-3 max-w-2xl text-[.98rem] leading-7 text-slate-600 sm:text-[1.02rem]">Yes. Use WhatsApp or the enquiry form to discuss the journey, timing, and any practical questions before you decide.</p>
              </details>
              <details className="group rounded-2xl border border-[#dbe7e5] bg-white px-5 py-5 shadow-[0_8px_22px_rgba(18,61,91,.045)] sm:px-6">
                <summary className="cursor-pointer list-none pr-8 text-[1rem] font-bold leading-6 text-[#123d5b] marker:hidden sm:text-[1.08rem]">What should I bring?</summary>
                <p className="mt-3 max-w-2xl text-[.98rem] leading-7 text-slate-600 sm:text-[1.02rem]">Packing needs can change with dates and weather. Ask Trip Himalaya for current preparation guidance for your planned journey.</p>
              </details>
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-[1.5rem] border border-[#dbe7e5] bg-[#fbfcfb] p-6 shadow-[0_16px_34px_rgba(18,61,91,.1)] sm:p-7 lg:sticky lg:top-24">
          <p className="text-[.72rem] font-extrabold uppercase tracking-[.14em] text-slate-400">
            From
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-[-.03em] text-[#123d5b]">
            ₹{tour.priceFrom.toLocaleString("en-IN")} {" "}
            <span className="text-[.98rem] font-medium tracking-normal text-slate-400">
              per person
            </span>
          </p>
          <p className="mt-6 border-t border-[#edf0ed] pt-5 text-[.98rem] leading-7 text-slate-600">
            Tell us your preferred dates and group size. We will confirm
            availability before anything is final.
          </p>
          <Link
            href={`/book/${tour.slug}`}
            className="focus-ring mt-6 flex h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-[#e9781c] px-4 text-[.78rem] font-extrabold uppercase tracking-[.1em] text-white transition hover:bg-[#d86b12] active:scale-[.97]"
          >
            <CalendarDays className="size-4" /> Plan your trip
          </Link>
          <a
            href={`https://wa.me/918219628359?text=${whatsAppMessage}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-3 flex h-[3.25rem] items-center justify-center gap-2 rounded-xl border border-[#1fac55] bg-[#25d366] px-4 text-[.78rem] font-extrabold uppercase tracking-[.09em] text-white shadow-[0_8px_18px_rgba(37,211,102,.22)] transition hover:bg-[#1fae54] active:scale-[.98]"
          >
            <WhatsAppIcon className="size-4" /> WhatsApp us
          </a>
        </aside>
      </section>
      <section className="border-t border-[#254f68] bg-[#0d3653] py-14 text-white sm:py-16">
        <div className="container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#f39a48]">Ready to experience Himachal?</p>
            <h2 className="font-display mt-2 text-3xl font-bold leading-none sm:text-4xl">Start planning this journey.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="focus-ring inline-flex h-12 items-center gap-2 bg-[#e9781c] px-5 text-sm font-bold text-white transition hover:bg-[#d86b12] active:scale-[.98]">Plan your trip <CalendarDays className="size-4" /></Link>
            <a href={`https://wa.me/918219628359?text=${whatsAppMessage}`} target="_blank" rel="noreferrer" className="focus-ring inline-flex h-12 items-center gap-2 border border-white/35 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/18 active:scale-[.98]"><WhatsAppIcon className="size-4" /> WhatsApp us</a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
function DetailList({
  title,
  icon: Icon,
  entries,
}: {
  title: string;
  icon: typeof Check;
  entries: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#dbe7e5] bg-[#f8fbfa] p-5 shadow-[0_8px_22px_rgba(18,61,91,.04)] sm:p-6">
      <h3 className="font-display text-[1.22rem] font-bold text-[#123d5b]">{title}</h3>
      <ul className="mt-5 grid gap-3.5">
        {entries.map(entry => (
          <li key={entry} className="flex gap-3 text-[.98rem] leading-6 text-slate-600">
            <Icon className="mt-0.5 size-[1.1rem] shrink-0 text-[#e17818]" />
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}
