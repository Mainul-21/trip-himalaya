import { Link, useLocation } from "wouter";
import { Menu, MessageCircle, Mountain, Phone, Search, X } from "lucide-react";
import { FormEvent, useState } from "react";

const navigation = [
  ["Home", "/"], ["Tours", "/tours"], ["Treks", "/treks"], ["Experiences", "/experiences"], ["About us", "/about"], ["Field notes", "/blog"], ["Contact", "/contact"],
];

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`group inline-flex items-center gap-2.5 ${light ? "text-white" : "text-[#123d5b]"}`} aria-label="Trip Himalaya home">
    <span className={`grid size-10 place-items-center rounded-xl ${light ? "bg-white/14 ring-1 ring-white/25" : "bg-[#123d5b] text-white"}`}><Mountain className="size-5" aria-hidden="true" /></span>
    <span className="leading-none"><span className="display block text-[1.36rem] font-bold tracking-[-.055em]">Trip Himalaya</span><span className={`mt-1 block text-[.58rem] font-extrabold uppercase tracking-[.14em] ${light ? "text-white/70" : "text-[#e17818]"}`}>Dharamshala · Himachal</span></span>
  </Link>;
}

function SearchField({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (query.trim()) setLocation(`/search?q=${encodeURIComponent(query.trim())}`); }
  return <form onSubmit={submit} className={`flex items-center ${compact ? "w-full" : "hidden xl:flex"}`}>
    <label className="sr-only" htmlFor={compact ? "footer-search" : "header-search"}>Search Himalayan trips</label>
    <input id={compact ? "footer-search" : "header-search"} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a trek" className="focus-ring h-10 min-w-0 rounded-l-xl border border-[#dbe5e9] bg-white px-3 text-sm outline-none placeholder:text-slate-400" />
    <button className="focus-ring grid h-10 w-10 place-items-center rounded-r-xl bg-[#123d5b] text-white" aria-label="Search"><Search className="size-4" /></button>
  </form>;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen overflow-hidden bg-[#fbfaf6]">
    <header className="sticky top-0 z-50 border-b border-[#dbe5e9]/75 bg-[#fbfaf6]/93 backdrop-blur-lg">
      <div className="container flex h-[74px] items-center justify-between gap-4">
        <Brand />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {navigation.map(([label, href]) => <Link key={href} href={href} className="focus-ring rounded-md text-[.76rem] font-extrabold uppercase tracking-[.09em] text-[#264960] transition-colors hover:text-[#e17818]">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 md:flex"><SearchField /><Link href="/contact" className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[#e9781c] px-4 text-[.72rem] font-extrabold uppercase tracking-[.09em] text-white shadow-[0_8px_18px_rgba(232,120,28,.22)] transition-transform active:scale-[.97] hover:bg-[#d86b12]"><MessageCircle className="size-4" /> Plan your trip</Link></div>
        <button type="button" className="focus-ring grid size-10 place-items-center rounded-xl border border-[#dbe5e9] text-[#123d5b] md:hidden" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <div id="mobile-menu" className="border-t border-[#dbe5e9] bg-[#fbfaf6] px-4 py-5 shadow-xl md:hidden"><nav className="container grid gap-1" aria-label="Mobile navigation">{navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="focus-ring rounded-lg px-3 py-3 text-sm font-bold text-[#123d5b] hover:bg-[#eef4f2]">{label}</Link>)}<Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-2 rounded-xl bg-[#e9781c] px-4 py-3 text-center text-xs font-extrabold uppercase tracking-[.1em] text-white">Plan your trip</Link></nav></div>}
    </header>
    {children}
    <FloatingContact />
    <footer className="bg-[#0d3653] text-white">
      <div className="container grid gap-10 py-14 lg:grid-cols-[1.25fr_.8fr_.8fr_1.1fr]">
        <div><Brand light /><p className="mt-5 max-w-xs text-sm leading-6 text-white/67">Thoughtful, locally coordinated journeys across Dharamshala and the Himalayas.</p><p className="mt-6 text-xs font-semibold text-white/45">© {new Date().getFullYear()} Trip Himalaya. Develop by Mainul Islam.</p></div>
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f39a48]">Explore</p><div className="mt-4 grid gap-2.5">{navigation.slice(1).map(([label, href]) => <Link key={href} href={href} className="text-sm text-white/72 transition hover:text-white">{label}</Link>)}</div></div>
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f39a48]">Made for your pace</p><div className="mt-4 grid gap-2.5 text-sm text-white/72"><span>Private planning</span><span>Local guides</span><span>Small groups</span><span>Mountain support</span></div></div>
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#f39a48]">Himalayan notes</p><p className="mt-4 text-sm leading-6 text-white/67">Seasonal trip ideas and useful Dharamshala planning notes—sent occasionally.</p><div className="mt-4"><SearchField compact /></div></div>
      </div>
    </footer>
  </div>;
}

function FloatingContact() {
  return <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2"><a className="focus-ring grid size-12 place-items-center rounded-full bg-[#28b56b] text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[.97]" href="https://wa.me/919999999999?text=Hello%20Trip%20Himalaya%2C%20I%20want%20to%20plan%20a%20trip." target="_blank" rel="noreferrer" aria-label="Chat with Trip Himalaya on WhatsApp"><MessageCircle className="size-5" /></a><a className="focus-ring grid size-12 place-items-center rounded-full bg-[#e9781c] text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[.97]" href="tel:+919999999999" aria-label="Call Trip Himalaya"><Phone className="size-5" /></a></div>;
}
