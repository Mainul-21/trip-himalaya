import { Link, useLocation } from "wouter";
import { LayoutDashboard, Menu, MessageCircle, Mountain, Phone, Search, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

const navigation = [
  ["Home", "/"], ["Tours", "/tours"], ["Treks", "/treks"], ["Experiences", "/experiences"], ["About us", "/about"], ["Blogs", "/blog"], ["Contact", "/contact"],
];

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`group inline-flex shrink-0 items-center gap-2 ${light ? "text-white" : "text-[#123d5b]"}`} aria-label="Trip Himalaya home">
    <span className={`grid size-10 place-items-center rounded-xl ${light ? "bg-white/14 ring-1 ring-white/25" : "bg-[#123d5b] text-white"}`}><Mountain className="size-5" aria-hidden="true" /></span>
    <span className="min-w-0 leading-none"><span className="display block whitespace-nowrap text-[1.16rem] font-bold tracking-[-.055em] sm:text-[1.36rem]">Trip Himalaya</span><span className={`mt-1 hidden whitespace-nowrap text-[.58rem] font-extrabold uppercase tracking-[.14em] sm:block ${light ? "text-white/70" : "text-[#e17818]"}`}>Dharamshala · Himachal</span></span>
  </Link>;
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true"><path d="M19.34 4.66A10 10 0 0 0 3.52 16.71L2.5 21.5l4.91-1A10 10 0 1 0 19.34 4.66Z" fill="currentColor" /><path d="M17.67 14.24c-.23-.12-1.38-.68-1.59-.76-.21-.08-.36-.12-.51.12-.15.23-.58.76-.71.91-.13.15-.26.17-.49.06a6.5 6.5 0 0 1-1.91-1.18 7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.02-.36.1-.47.1-.1.23-.26.34-.38.11-.13.15-.22.23-.37.07-.15.04-.28-.02-.39-.06-.12-.51-1.22-.7-1.67-.18-.44-.37-.38-.51-.39h-.44c-.15 0-.39.06-.59.28-.2.23-.77.75-.77 1.83s.79 2.12.9 2.27c.11.15 1.56 2.37 3.78 3.32.53.23.94.36 1.26.46.53.17 1.02.14 1.4.08.43-.06 1.38-.57 1.58-1.12.19-.55.19-1.02.14-1.12-.06-.09-.2-.15-.43-.27Z" fill="#28b56b" /><path d="M17.67 14.24c-.23-.12-1.38-.68-1.59-.76-.21-.08-.36-.12-.51.12-.15.23-.58.76-.71.91-.13.15-.26.17-.49.06a6.5 6.5 0 0 1-1.91-1.18 7.2 7.2 0 0 1-1.33-1.66c-.14-.24-.02-.36.1-.47.1-.1.23-.26.34-.38.11-.13.15-.22.23-.37.07-.15.04-.28-.02-.39-.06-.12-.51-1.22-.7-1.67-.18-.44-.37-.38-.51-.39h-.44c-.15 0-.39.06-.59.28-.2.23-.77.75-.77 1.83s.79 2.12.9 2.27c.11.15 1.56 2.37 3.78 3.32.53.23.94.36 1.26.46.53.17 1.02.14 1.4.08.43-.06 1.38-.57 1.58-1.12.19-.55.19-1.02.14-1.12-.06-.09-.2-.15-.43-.27Z" fill="white" transform="scale(.72) translate(4.7 4.7)" /></svg>;
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
  const { user } = useAuth();
  return <div className="min-h-screen overflow-hidden bg-[#fbfaf6]">
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/55 bg-[#f7faf7]/74 shadow-[0_8px_26px_rgba(18,61,91,.08)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Brand />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {navigation.map(([label, href]) => <Link key={href} href={href} className="focus-ring rounded-md text-[.76rem] font-extrabold uppercase tracking-[.09em] text-[#264960] transition-colors hover:text-[#e17818]">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex"><SearchField />{user && <Link href="/admin" className="focus-ring hidden h-12 items-center gap-2 rounded-lg border border-[#cbd9d6] bg-white/66 px-4 text-[.7rem] font-extrabold uppercase tracking-[.075em] text-[#123d5b] transition-colors hover:bg-[#eaf2ef] xl:inline-flex"><LayoutDashboard className="size-4 text-[#e17818]" /> Admin dashboard</Link>}<Link href="/contact" className="focus-ring inline-flex h-12 min-w-[178px] items-center justify-center gap-2 rounded-lg border border-[#d76d17] bg-[#e9781c] px-5 text-[.74rem] font-extrabold uppercase tracking-[.08em] text-white shadow-[0_9px_20px_rgba(191,88,12,.22)] transition-[background-color,box-shadow,transform] hover:bg-[#cf6513] hover:shadow-[0_11px_24px_rgba(191,88,12,.28)] active:scale-[.98]"><MessageCircle className="size-[1.1rem]" /> Plan your trip</Link></div>
        <div className="flex items-center gap-2 lg:hidden"><Link href="/contact" className="focus-ring inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#d76d17] bg-[#e9781c] px-4 text-[.67rem] font-extrabold uppercase tracking-[.07em] text-white shadow-[0_8px_18px_rgba(191,88,12,.22)] transition-colors hover:bg-[#cf6513]"><MessageCircle className="size-4" /> Plan trip</Link><button type="button" className="focus-ring grid size-11 shrink-0 place-items-center rounded-lg border border-[#cfdbd5] bg-white/55 text-[#123d5b]" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}>{mobileOpen ? <X /> : <Menu />}</button></div>
      </div>
      {mobileOpen && <div id="mobile-menu" className="fixed inset-x-0 top-20 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/60 bg-[#f7faf7]/96 px-4 py-5 shadow-2xl backdrop-blur-xl lg:hidden"><nav className="container grid gap-1" aria-label="Mobile navigation">{navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="focus-ring rounded-lg px-3 py-3 text-sm font-bold text-[#123d5b] hover:bg-[#eef4f2]">{label}</Link>)}{user && <Link href="/admin" onClick={() => setMobileOpen(false)} className="focus-ring mt-2 inline-flex items-center gap-2 rounded-xl border border-[#c9dcd7] bg-[#eef4f2] px-3 py-3 text-sm font-extrabold text-[#123d5b]"><Mountain className="size-4 text-[#e17818]" /> Admin dashboard</Link>}<div className="mt-3 grid grid-cols-2 gap-2"><a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c8d9d6] text-xs font-extrabold uppercase tracking-[.08em] text-[#123d5b]" href="tel:+918609752814"><Phone className="size-4" /> Call us</a><a className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25d366] text-xs font-extrabold uppercase tracking-[.08em] text-white shadow-[0_8px_18px_rgba(37,211,102,.22)]" href="https://wa.me/918609752814" target="_blank" rel="noreferrer"><WhatsAppIcon className="size-4" /> WhatsApp</a></div><Link href="/contact" onClick={() => setMobileOpen(false)} className="focus-ring mt-2 rounded-xl bg-[#e9781c] px-4 py-3 text-center text-xs font-extrabold uppercase tracking-[.1em] text-white">Plan your trip</Link></nav></div>}
    </header>
    <main className="pt-20">{children}</main>
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
  return <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2"><a className="focus-ring grid size-12 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_25px_rgba(37,211,102,.36)] transition-transform hover:-translate-y-0.5 active:scale-[.97]" href="https://wa.me/918609752814?text=Hello%20Trip%20Himalaya%2C%20I%20want%20to%20plan%20a%20trip." target="_blank" rel="noreferrer" aria-label="Chat with Trip Himalaya on WhatsApp"><WhatsAppIcon className="size-6" /></a><a className="focus-ring grid size-12 place-items-center rounded-full bg-[#e9781c] text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[.97]" href="tel:+918609752814" aria-label="Call Trip Himalaya"><Phone className="size-5" /></a></div>;
}
