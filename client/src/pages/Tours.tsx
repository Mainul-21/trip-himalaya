import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Filter, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";

const coreFilters = [
  { id: "all", label: "All journeys" },
  { id: "trekking", label: "Trekking" },
  { id: "experiences", label: "Culture & local" },
  { id: "adventure", label: "Adventure" },
  { id: "short-breaks", label: "Short breaks" },
  { id: "best-sellers", label: "Best sellers" },
];

function filterMatches(tour: { category: string; duration: string; isBestSeller?: boolean }, filterId: string) {
  if (filterId === "all") return true;
  if (filterId === "best-sellers") return Boolean(tour.isBestSeller);
  if (filterId === "short-breaks") return /^\s*[12]\s*Days?\b/i.test(tour.duration);
  if (filterId.startsWith("category:")) return tour.category === filterId.slice("category:".length);
  if (filterId === "experiences") return tour.category.toLowerCase() === "experiences";
  return tour.category.toLowerCase() === filterId;
}

export default function Tours() {
  const { data: tours = [], isLoading, isError, refetch } = trpc.tours.list.useQuery(undefined, { retry: false });
  const search = useSearch();
  const requestedFilter = useMemo(() => {
    const params = new URLSearchParams(search);
    return (params.get("style") || params.get("category") || "").trim().toLowerCase();
  }, [search]);
  const [activeFilter, setActiveFilter] = useState("all");
  const filters = useMemo(() => {
    const representedCategories = new Set(["trekking", "experiences", "adventure"]);
    const extraCategories = Array.from(new Set(tours.map(tour => tour.category)))
      .filter(category => !representedCategories.has(category.toLowerCase()))
      .map(category => ({ id: `category:${category}`, label: category }));
    return [...coreFilters, ...extraCategories];
  }, [tours]);

  useEffect(() => {
    if (!requestedFilter) return;
    const requestedCategory = filters.find(filter => filter.id === `category:${requestedFilter}` || filter.id === requestedFilter || filter.label.toLowerCase() === requestedFilter);
    setActiveFilter(requestedCategory?.id ?? "all");
  }, [filters, requestedFilter]);

  const visible = useMemo(() => tours.filter(tour => filterMatches(tour, activeFilter)), [activeFilter, tours]);

  return <PublicLayout><section className="border-b border-[#dfe8e8] bg-[#eef3ef] py-16 sm:py-20"><div className="container grid gap-6 lg:grid-cols-[1fr_.58fr] lg:items-end"><div><p className="eyebrow">Himachal journeys</p><h1 className="section-title mt-3">Trips with a clear starting point.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Filter by trip style, a shorter break, or journeys marked Best Seller by the Trip Himalaya team.</p></div><Link href="/contact" className="focus-ring inline-flex h-11 items-center justify-center gap-2 bg-[#123d5b] px-4 text-sm font-bold text-white hover:bg-[#0d314b] lg:justify-self-end">Plan your trip <ArrowRight className="size-4" /></Link></div></section><section className="container py-12 sm:py-16"><div className="mb-8 border-y border-[#dfe8e8] py-4"><div className="flex flex-wrap items-center gap-x-5 gap-y-3"><span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#123d5b]"><Filter className="size-4 text-[#e17818]" /> Filter trips</span>{filters.map(filter => <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className={`focus-ring border-b-2 px-1 py-1 text-sm font-bold transition ${activeFilter === filter.id ? "border-[#e17818] text-[#123d5b]" : "border-transparent text-[#647a87] hover:border-[#b8cbc5] hover:text-[#123d5b]"}`}>{filter.label}</button>)}</div></div>{isLoading ? <div className="grid min-h-64 place-items-center" aria-live="polite"><Loader2 className="animate-spin text-[#e17818]" /><span className="sr-only">Loading tours</span></div> : isError ? <div className="border border-[#dfe8e8] bg-[#eef4f2] p-8 text-center"><p className="font-semibold text-[#123d5b]">The journey catalogue is temporarily unavailable.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">This is usually a local database or network connection issue, not an empty tour list. Check your DATABASE_URL and TiDB connection, then try again.</p><button className="focus-ring mt-4 bg-[#123d5b] px-5 py-2 text-xs font-bold text-white" onClick={() => void refetch()}>Try again</button></div> : visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(tour => <TourCard key={tour.id} tour={tour} />)}</div> : <div className="border border-dashed border-[#ccd9d7] bg-[#fbfcfa] p-10 text-center"><p className="font-semibold text-[#123d5b]">No journeys match this filter yet.</p><p className="mt-2 text-sm text-slate-500">Best Seller journeys appear after an administrator marks them in the tour editor.</p><button onClick={() => setActiveFilter("all")} className="focus-ring mt-4 bg-[#123d5b] px-5 py-2 text-xs font-bold text-white">Show all journeys</button></div>}</section></PublicLayout>;
}
