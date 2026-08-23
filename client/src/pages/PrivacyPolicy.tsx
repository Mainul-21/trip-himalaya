import PublicLayout from "@/components/PublicLayout";
import Seo from "@/components/Seo";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

const policySections = [
  {
    number: "01",
    title: "Information We Collect",
    intro: "When you contact us, book a tour or trek, or fill out an enquiry form on our website, we may collect personal details including:",
    items: [
      ["Personal Details", "Name, email address, phone / WhatsApp number, and location."],
      ["Travel Details", "Preferred travel dates, group size, trek or tour preferences, and special requirements or travel messages."],
      ["Communication Data", "Details shared during direct phone calls, WhatsApp chats, or email inquiries."],
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    intro: "We use the collected information to:",
    items: [
      ["Bookings and planning", "Process your travel bookings, itinerary planning, and trek bookings."],
      ["Travel arrangements", "Communicate with you directly regarding tour schedules, routes, and travel arrangements."],
      ["Your inquiries", "Respond to inquiries submitted through our contact forms, email, or WhatsApp."],
      ["Safety", "Help ensure safety during treks and adventure tours by maintaining emergency contact information."],
      ["Service improvements", "Improve our website features, tour offerings, and customer service."],
    ],
  },
  {
    number: "03",
    title: "Data Sharing & Disclosure",
    intro: "We share information only where it is necessary to provide safe, well-managed travel arrangements.",
    items: [
      ["Local Partners & Guides", "We share necessary trip information with local trek guides, driver partners, and accommodation providers strictly for managing travel logistics."],
      ["Legal Requirements", "We do not sell, trade, or rent your personal information to third parties. Information may be disclosed only if required by law or to protect safety in emergency situations."],
    ],
  },
  {
    number: "04",
    title: "Data Security",
    intro: "We implement suitable security measures to prevent unauthorized access, alteration, or disclosure of personal data. However, no method of transmission over the internet is 100% secure.",
    items: [],
  },
  {
    number: "05",
    title: "Cookies & Tracking",
    intro: "Our website may use standard cookies to optimize user experience, remember basic browsing preferences, and analyze site traffic to improve overall service quality.",
    items: [],
  },
];

export default function PrivacyPolicy() {
  const pageUrl = `${window.location.origin}/privacy`;
  return <PublicLayout>
    <Seo title="Privacy Policy | Trip Himalaya" description="Read how Trip Himalaya collects, uses, safeguards, and shares travel enquiry and booking information." structuredData={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${window.location.origin}/` }, { "@type": "ListItem", position: 2, name: "Privacy Policy", item: pageUrl }] }} />
    <section className="border-b border-[#254f68] bg-[#123d5b] py-14 text-white sm:py-18">
      <div className="container max-w-4xl text-center">
        <ShieldCheck className="mx-auto size-8 text-[#f39a48]" aria-hidden="true" />
        <p className="mt-4 text-[.7rem] font-extrabold uppercase tracking-[.16em] text-[#f39a48]">Trip Himalaya</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-none">Privacy Policy</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/76">This policy explains how Trip Himalaya handles the information shared with us when you enquire about or plan travel in Himachal Pradesh.</p>
      </div>
    </section>

    <main className="container max-w-5xl py-12 sm:py-16">
      <div className="mx-auto max-w-3xl border-l-2 border-[#e9781c] bg-[#f7f9f7] px-5 py-4 text-sm leading-6 text-slate-600 sm:px-6">
        We respect your privacy and use only the information needed to plan, coordinate, and support your Trip Himalaya journey.
      </div>
      <div className="mt-10 space-y-8">
        {policySections.map(section => <section key={section.number} className="border border-[#dfe8e8] bg-white p-6 shadow-[0_12px_30px_rgba(18,61,91,.05)] sm:p-8">
          <div className="flex items-start gap-4"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#123d5b] text-[10px] font-extrabold tracking-wide text-white">{section.number}</span><div><h2 className="font-display text-2xl font-bold text-[#123d5b]">{section.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{section.intro}</p></div></div>
          {section.items.length ? <dl className="mt-6 divide-y divide-[#dfe8e8] border-y border-[#dfe8e8]">{section.items.map(([term, description]) => <div key={term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-5"><dt className="text-sm font-bold text-[#123d5b]">{term}</dt><dd className="text-sm leading-6 text-slate-600">{description}</dd></div>)}</dl> : null}
        </section>)}
      </div>

      <section className="mt-8 border border-[#dfe8e8] bg-[#f4f6f3] p-6 sm:p-8">
        <p className="eyebrow">06 · Contact Us</p>
        <h2 className="section-title mt-3">Questions about this policy?</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">If you have questions or require more information about this Privacy Policy, please contact Trip Himalaya.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="border border-[#dfe8e8] bg-white p-5"><MapPin className="size-5 text-[#e17818]" /><h3 className="mt-4 text-sm font-bold text-[#123d5b]">Location</h3><p className="mt-1 text-sm leading-6 text-slate-600">Dharamshala, Himachal Pradesh, India</p></div>
          <a href="tel:+918219628359" className="focus-ring border border-[#dfe8e8] bg-white p-5 transition hover:border-[#e17818]"><Phone className="size-5 text-[#e17818]" /><h3 className="mt-4 text-sm font-bold text-[#123d5b]">Phone / WhatsApp</h3><p className="mt-1 text-sm leading-6 text-slate-600">+91 82196 28359</p></a>
          <a href="mailto:triphimalayainfo@gmail.com" className="focus-ring border border-[#dfe8e8] bg-white p-5 transition hover:border-[#e17818]"><Mail className="size-5 text-[#e17818]" /><h3 className="mt-4 text-sm font-bold text-[#123d5b]">Email</h3><p className="mt-1 break-all text-sm leading-6 text-slate-600">triphimalayainfo@gmail.com</p></a>
        </div>
        <p className="mt-5 text-xs text-slate-500">Website: <a href="https://triphimalya.com/" className="focus-ring font-semibold text-[#123d5b] hover:text-[#e17818]">https://triphimalya.com/</a></p>
      </section>
    </main>
  </PublicLayout>;
}
