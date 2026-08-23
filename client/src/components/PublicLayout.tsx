import { ArrowUp, CalendarDays, ChevronDown, Facebook, Instagram, Mail, MapPin, Menu, MessageCircle, Phone, Send, X, Youtube } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { OFFICIAL_TRIP_HIMALAYA_LOGO } from "@/lib/brand";
import { resolveImageUrl } from "@/lib/imageDelivery";

const navigation = [
  { label: "HOME", href: "/", dropdown: false },
  { label: "TOURS", href: "/tours", dropdown: true },
  { label: "TREKS", href: "/treks", dropdown: true },
  { label: "OUR STAY", href: "/experiences", dropdown: true },
  { label: "ABOUT US", href: "/about", dropdown: false },
  { label: "REVIEWS", href: "/reviews", dropdown: false },
  { label: "CONTACT", href: "/contact", dropdown: false },
];

const fallbackAgencyProfile = {
  brandName: "Trip Himalaya", tagline: "Discover Himachal. Experience Himalayas.", logoUrl: OFFICIAL_TRIP_HIMALAYA_LOGO, phone: "+918219628359", whatsapp: "918219628359", email: "hello@triphimalaya.in", address: "Dharamshala, Himachal Pradesh, India", instagramUrl: "", facebookUrl: "", youtubeUrl: "", googleMapsUrl: "",
};

type AgencyProfile = typeof fallbackAgencyProfile;

export function Brand({ light = false, profile = fallbackAgencyProfile, reference = true }: { light?: boolean; profile?: AgencyProfile; reference?: boolean }) {
  const words = profile.brandName.trim().split(/\s+/);
  const textClass = light ? "text-primary-foreground" : "text-primary";
  return <Link href="/" className={`flex items-center gap-3 ${textClass}`} aria-label={`${profile.brandName} home`}>
    <img src={resolveImageUrl(profile.logoUrl)} alt={`${profile.brandName} logo`} width={48} height={48} className="h-11 w-11 object-contain" />
    <span className="leading-none"><span className="block font-display text-xl font-bold tracking-wide">{words[0] || "TRIP"}</span><span className="block font-display text-xl font-bold tracking-wide">{words.slice(1).join(" ") || "HIMALAYA"}</span>{profile.tagline && <span className={`mt-1 block text-[10px] ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{profile.tagline}</span>}</span>
  </Link>;
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.768.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.478-.883-.788-1.479-1.761-1.652-2.058-.173-.297-.018-.458.13-.606.133-.132.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.009-.372-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.491.71.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.414.247-.694.247-1.289.173-1.413-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.003a8.21 8.21 0 0 1-4.154-1.13l-.298-.177-3.087.81.824-3.008-.195-.31a8.21 8.21 0 1 1 6.913 3.815m0-14.991a6.78 6.78 0 0 0-5.759 10.37l.213.338-.486 1.775 1.82-.477.326.194a6.78 6.78 0 1 0 3.886-12.2" /></svg>;
}

export function PublicHeader({ profile = fallbackAgencyProfile }: { profile?: AgencyProfile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();
  const isHomepage = location.split("?")[0] === "/";
  const phoneHref = `tel:${profile.phone.replace(/[^+0-9]/g, "")}`;
  const whatsappNumber = profile.whatsapp.replace(/\D/g, "");
  return <header className={`relative z-50 isolate ${isHomepage ? "" : "bg-primary"}`}>
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
      <Brand light profile={profile} />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
        {navigation.map(link => <Link key={link.href} href={link.href} className={`focus-ring flex items-center gap-1 text-xs font-semibold tracking-wide text-primary-foreground/90 transition-colors hover:text-accent ${location.split("?")[0] === link.href ? "border-b-2 border-accent pb-1 text-primary-foreground" : ""}`}>{link.label}{link.dropdown ? <ChevronDown size={13} /> : null}</Link>)}
        {user ? <Link href="/admin" className="focus-ring border-b-2 border-transparent pb-1 text-xs font-semibold tracking-wide text-primary-foreground/90 transition-colors hover:text-accent">ADMIN DASHBOARD</Link> : null}
      </nav>
      <div className="flex items-center gap-2 sm:gap-3 lg:contents">
        <a href={phoneHref} className="focus-ring hidden items-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2.5 text-xs font-semibold tracking-wide text-primary-foreground transition-colors hover:border-accent hover:text-accent xl:inline-flex"><Phone size={14} /> CALL NOW</a>
        <Link href={isHomepage ? "/contact" : "/contact"} className="focus-ring hidden items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-xs font-semibold tracking-wide text-accent-foreground shadow-md transition-transform hover:scale-[1.03] md:inline-flex">GET A QUOTE <span className="grid h-5 w-5 place-items-center rounded-full border border-accent-foreground/60"><Send size={11} /></span></Link>
        <button type="button" className="focus-ring grid h-11 w-11 place-items-center rounded-md border border-primary-foreground/40 text-primary-foreground transition-colors hover:bg-primary-foreground/10 lg:hidden" onClick={() => setMobileOpen(open => !open)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}>{mobileOpen ? <X size={20} /> : <Menu size={21} strokeWidth={2.3} />}</button>
      </div>
    </div>
    {mobileOpen ? <div id="mobile-menu" className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-t border-primary-foreground/15 bg-primary-deep px-5 py-4 shadow-2xl lg:hidden"><nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">{navigation.map(link => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="focus-ring flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-semibold leading-5 tracking-wide text-primary-foreground hover:bg-primary-foreground/10">{link.label}</Link>)}{user ? <Link href="/admin" onClick={() => setMobileOpen(false)} className="focus-ring flex min-h-11 items-center rounded-md px-3 py-3 text-sm font-semibold leading-5 tracking-wide text-primary-foreground hover:bg-primary-foreground/10">ADMIN DASHBOARD</Link> : null}<div className="mt-3 grid gap-2 sm:grid-cols-3"><a href={phoneHref} className="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-3 py-3 text-center text-xs font-semibold leading-5 tracking-wide text-primary-foreground"><Phone size={14} /> CALL NOW</a><a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I would like to know more about your Dharamshala tour packages.")}`} target="_blank" rel="noreferrer" className="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary-foreground/30 px-3 py-3 text-center text-xs font-semibold leading-5 tracking-wide text-primary-foreground"><WhatsAppIcon className="size-4" /> WHATSAPP</a><Link href={isHomepage ? "#plan" : "/contact"} onClick={() => setMobileOpen(false)} className="focus-ring flex min-h-11 items-center justify-center rounded-md bg-accent px-3 py-3 text-center text-xs font-semibold leading-5 tracking-wide text-accent-foreground">GET A QUOTE</Link></div></nav></div> : null}
  </header>;
}

export default function PublicLayout({ children, showHeader = true }: { children: React.ReactNode; showHeader?: boolean }) {
  const { data: savedProfile } = trpc.agency.get.useQuery(undefined, { staleTime: 60_000 });
  const { data: allTours = [] } = trpc.tours.list.useQuery(undefined, { staleTime: 60_000 });
  const profile = savedProfile ?? fallbackAgencyProfile;
  const whatsappNumber = profile.whatsapp.replace(/\D/g, "");
  const phoneHref = `tel:${profile.phone.replace(/[^+0-9]/g, "")}`;
  const topTreks = allTours.filter(tour => tour.category.toLowerCase().includes("trek")).slice(0, 5);
  const topTours = allTours.filter(tour => !tour.category.toLowerCase().includes("trek")).slice(0, 5);

  return <div className="min-h-screen bg-background font-sans">
    {showHeader ? <PublicHeader profile={profile} /> : null}
    <main>{children}</main>
    <footer className="bg-primary-deep pt-12 text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 sm:grid-cols-2 lg:grid-cols-5">
        <div><Brand light profile={profile} /><p className="mt-3 text-[11px] text-primary-foreground/70">Discover Himachal.<br />Experience Himalayas.</p><div className="mt-4 flex gap-3">{profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent hover:text-accent"><Instagram size={15} /></a> : null}{profile.facebookUrl ? <a href={profile.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent hover:text-accent"><Facebook size={15} /></a> : null}{profile.youtubeUrl ? <a href={profile.youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube" className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent hover:text-accent"><Youtube size={15} /></a> : null}<a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent hover:text-accent"><MessageCircle size={15} /></a></div></div>
        <FooterColumn title="QUICK LINKS" links={[{ label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Treks", href: "/treks" }, { label: "Our Stay", href: "/experiences" }, { label: "Reviews", href: "/reviews" }, { label: "Contact", href: "/contact" }]} />
        <FooterColumn title="TOP TREKS" links={topTreks.map(tour => ({ label: tour.title, href: `/tours/${tour.slug}` }))} />
        <FooterColumn title="TOP TOURS" links={topTours.map(tour => ({ label: tour.title, href: `/tours/${tour.slug}` }))} />
        <div><p className="text-[11px] font-bold tracking-wide text-accent">CONTACT US</p><ul className="mt-3 space-y-3 text-[11px] text-primary-foreground/75"><li><a className="flex items-center gap-2 hover:text-accent" href={phoneHref}><Phone size={13} /> {profile.phone}</a></li><li><a className="flex items-center gap-2 hover:text-accent" href={`mailto:${profile.email}`}><Mail size={13} /> {profile.email}</a></li><li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5" /> {profile.address}</li></ul></div>
      </div>
      <div className="border-t border-primary-foreground/10"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-[10px] text-primary-foreground/60"><p>© {new Date().getFullYear()} {profile.brandName}. All Rights Reserved. Develop by Mainul Islam.</p><div className="flex gap-5"><Link href="/contact" className="hover:text-accent">Privacy Policy</Link><Link href="/contact" className="hover:text-accent">Terms &amp; Conditions</Link></div></div></div>
    </footer>
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 hidden flex-col items-end gap-2 lg:flex"><a href={phoneHref} aria-label={`Call ${profile.phone}`} className="focus-ring flex h-11 items-center gap-2 rounded-full border border-[#dce8e3] bg-white px-3 text-primary shadow-[0_12px_28px_rgba(18,61,91,.16)] transition-transform hover:scale-[1.03]"><Phone className="size-4 text-accent" /><span className="text-[10px] font-bold tracking-wide">CALL NOW</span></a><a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I would like to know more about your Dharamshala tour packages.")}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="focus-ring whatsapp-float flex h-14 items-center gap-2 rounded-full bg-whatsapp pl-4 pr-4 text-primary-foreground shadow-[0_14px_30px_rgba(37,211,102,.28)] transition-transform hover:scale-[1.04]"><WhatsAppIcon className="size-6" /><span className="text-[10px] font-bold tracking-wide">CHAT ON WHATSAPP</span></a><button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[#dce8e3] bg-white text-primary shadow-md transition-transform hover:scale-[1.04]"><ArrowUp size={15} /></button></div>
  </div>;
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><p className="text-[11px] font-bold tracking-wide text-accent">{title}</p><ul className="mt-3 space-y-2">{links.map(link => <li key={`${title}-${link.href}`}><Link href={link.href} className="text-[11px] text-primary-foreground/75 transition-colors hover:text-accent">{link.label}</Link></li>)}</ul></div>;
}
