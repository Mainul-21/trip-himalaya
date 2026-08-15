import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Filter, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";

export default function Tours() {
  const { data: tours = [], isLoading, isError, refetch } = trpc.tours.list.useQuery(undefined, { retry: false });
  const search = useSearch();
  const requestedCategory = useMemo(() => new URLSearchParams(search).get("category"), [search]);
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...Array.from(new Set(tours.map(t => t.category)))], [tours]);

  useEffect(() => {
    if (!requestedCategory) return;
    const matchingCategory = categories.find(item => item.toLowerCase() === requestedCategory.toLowerCase());
    setCategory(matchingCategory ?? "All");
  }, [categories, requestedCategory]);

  const visible = category === "All" ? tours : tours.filter(t => t.category === category);
  return <PublicLayout><section className="border-b border-[#dfe8e8] bg-[#eef3ef] py-16 sm:py-20"><div className="container grid gap-6 lg:grid-cols-[1fr_.58fr] lg:items-end"><div><p className="eyebrow">Himachal journeys</p><h1 className="section-title mt-3">Trips with a clear starting point.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Browse treks, local days and active escapes. If you are unsure, send us your dates and we will help narrow it down.</p></div><Link href="/contact" className="focus-ring inline-flex h-11 items-center justify-center gap-2 bg-[#123d5b] px-4 text-sm font-bold text-white hover:bg-[#0d314b] lg:justify-self-end">Plan your trip <ArrowRight className="size-4" /></Link></div></section><section className="container py-12 sm:py-16"><div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-[#dfe8e8] py-4"><span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#123d5b]"><Filter className="size-4 text-[#e17818]" /> Show</span>{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`focus-ring border-b-2 px-1 py-1 text-sm font-bold transition ${category === item ? "border-[#e17818] text-[#123d5b]" : "border-transparent text-[#647a87] hover:border-[#b8cbc5] hover:text-[#123d5b]"}`}>{item}</button>)}</div>{isLoading ? <div className="grid min-h-64 place-items-center" aria-live="polite"><Loader2 className="animate-spin text-[#e17818]" /><span className="sr-only">Loading tours</span></div> : isError ? <div className="border border-[#dfe8e8] bg-[#eef4f2] p-8 text-center"><p className="font-semibold text-[#123d5b]">We could not load the journeys just now.</p><button className="focus-ring mt-4 bg-[#123d5b] px-5 py-2 text-xs font-bold text-white" onClick={() => void refetch()}>Try again</button></div> : visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(tour => <TourCard key={tour.id} tour={tour} />)}</div> : <div className="border border-dashed border-[#ccd9d7] bg-[#fbfcfa] p-10 text-center"><p className="font-semibold text-[#123d5b]">No journeys match this category yet.</p><button onClick={() => setCategory("All")} className="focus-ring mt-4 bg-[#123d5b] px-5 py-2 text-xs font-bold text-white">Show all journeys</button></div>}</section></PublicLayout>;
}
