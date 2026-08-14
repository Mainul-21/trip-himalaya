import PublicLayout from "@/components/PublicLayout";
import TourCard from "@/components/TourCard";
import { trpc } from "@/lib/trpc";
import { Filter, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";

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
  return <PublicLayout><section className="bg-[#eaf1ed] py-16 sm:py-20"><div className="container"><p className="eyebrow">Himalachal journeys</p><h1 className="section-title mt-3">Find your<br />right kind of wild.</h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Trek a high ridge, ease into culture, or build a private plan around the days you have.</p></div></section><section className="container py-12 sm:py-16"><div className="mb-8 flex flex-wrap items-center gap-2"><span className="mr-2 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.1em] text-[#123d5b]"><Filter className="size-4 text-[#e17818]" /> Filter</span>{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`focus-ring rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? "bg-[#123d5b] text-white" : "bg-[#eef4f2] text-[#416176] hover:bg-[#e1ece6]"}`}>{item}</button>)}</div>{isLoading ? <div className="grid min-h-64 place-items-center" aria-live="polite"><Loader2 className="animate-spin text-[#e17818]" /><span className="sr-only">Loading tours</span></div> : isError ? <div className="rounded-2xl bg-[#eef4f2] p-8 text-center"><p className="font-semibold text-[#123d5b]">We could not load the journeys just now.</p><button className="focus-ring mt-4 rounded-full bg-[#123d5b] px-5 py-2 text-xs font-bold text-white" onClick={() => void refetch()}>Try again</button></div> : visible.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map(tour => <TourCard key={tour.id} tour={tour} />)}</div> : <div className="rounded-2xl border border-dashed border-[#ccd9d7] bg-[#fbfcfa] p-10 text-center"><p className="font-semibold text-[#123d5b]">No journeys match this category yet.</p><button onClick={() => setCategory("All")} className="focus-ring mt-4 rounded-full bg-[#123d5b] px-5 py-2 text-xs font-bold text-white">Show all journeys</button></div>}</section></PublicLayout>;
}
