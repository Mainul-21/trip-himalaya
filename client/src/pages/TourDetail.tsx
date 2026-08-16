import PublicLayout, { WhatsAppIcon } from "@/components/PublicLayout";
import TourPhotoCarousel from "@/components/TourPhotoCarousel";
import { trpc } from "@/lib/trpc";
import { buildTourWhatsAppMessage } from "@/lib/tourWhatsApp";
import {
  ArrowLeft,
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
      <section className="relative isolate min-h-[34rem] overflow-hidden bg-[#123d5b] text-white">
        <TourPhotoCarousel
          title={tour.title}
          location={tour.location}
          heroImage={tour.heroImage}
          gallery={tour.gallery}
          priority
          className="absolute inset-0 h-full w-full rounded-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,35,55,.9),rgba(5,35,55,.48),rgba(5,35,55,.2))]" />
        <div className="container relative py-20 sm:py-28">
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
          </div>
        </div>
      </section>
      <section className="container grid gap-12 py-16 lg:grid-cols-[1fr_340px] lg:py-20">
        <div>
          <p className="text-lg leading-8 text-slate-600">{tour.overview}</p>
          <div className="mt-12">
            <p className="eyebrow">Good to know</p>
            <h2 className="section-title mt-3">Trip highlights</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {tour.highlights.map(highlight => (
                <div
                  key={highlight}
                  className="flex gap-3 border-b border-[#dfe8e8] py-3 text-sm font-semibold text-[#214861]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#e17818]" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14">
            <p className="eyebrow">A clear rhythm</p>
            <h2 className="section-title mt-3">Day by day</h2>
            <ol className="mt-8 grid gap-4">
              {tour.itinerary.map(item => (
                <li
                  key={item.day}
                  className="grid gap-3 border-b border-[#dfe8e8] py-5 sm:grid-cols-[90px_1fr]"
                >
                  <span className="display text-2xl font-bold text-[#e17818]">
                    {item.day}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#123d5b]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            <DetailList
              title="Included"
              icon={Check}
              entries={tour.inclusions}
            />
            <DetailList
              title="Not included"
              icon={CircleAlert}
              entries={tour.exclusions}
            />
          </div>
        </div>
        <aside className="h-fit border border-[#dfe8e8] bg-[#fbfcfb] p-6 shadow-[0_12px_26px_rgba(18,61,91,.07)] lg:sticky lg:top-24">
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-slate-400">
            From
          </p>
          <p className="mt-1 text-3xl font-extrabold text-[#123d5b]">
            ₹{tour.priceFrom.toLocaleString("en-IN")}{" "}
            <span className="text-sm font-medium text-slate-400">
              per person
            </span>
          </p>
          <p className="mt-5 border-t border-[#edf0ed] pt-5 text-sm leading-6 text-slate-600">
            Tell us your preferred dates and group size. We will confirm
            availability before anything is final.
          </p>
          <Link
            href={`/book/${tour.slug}`}
            className="focus-ring mt-6 flex h-12 items-center justify-center gap-2 bg-[#e9781c] px-4 text-xs font-extrabold uppercase tracking-[.09em] text-white transition hover:bg-[#d86b12] active:scale-[.97]"
          >
            <CalendarDays className="size-4" /> Send tour request
          </Link>
          <a
            href={`https://wa.me/918609752814?text=${whatsAppMessage}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-3 flex h-11 items-center justify-center gap-2 border border-[#1fac55] bg-[#25d366] px-4 text-xs font-extrabold uppercase tracking-[.08em] text-white"
          >
            <WhatsAppIcon className="size-4" /> Ask about this tour
          </a>
        </aside>
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
    <div>
      <h3 className="font-bold text-[#123d5b]">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {entries.map(entry => (
          <li key={entry} className="flex gap-3 text-sm text-slate-600">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#e17818]" />
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}
