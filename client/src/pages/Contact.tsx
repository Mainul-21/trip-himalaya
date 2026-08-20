import PublicLayout, { WhatsAppIcon } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Contact() {
  const enquiry = trpc.enquiries.create.useMutation();
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    enquiry.mutate({
      name: String(data.get("name")),
      email: String(data.get("email")),
      phone: String(data.get("phone")) || undefined,
      subject: String(data.get("subject")),
      message: String(data.get("message")),
    }, { onSuccess: () => setDone(true) });
  }

  return <PublicLayout>
    <section className="border-b border-[#254f68] bg-[#123d5b] py-14 text-white sm:py-18">
      <div className="container text-center">
        <p className="text-[.7rem] font-extrabold uppercase tracking-[.16em] text-[#f39a48]">Plan your Himachal trip</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-none">Tell us what you need.</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/76">Share rough dates, your group, or a simple question. A Trip Himalaya planner will help you take the next step.</p>
      </div>
    </section>
    <section className="container grid gap-7 py-12 lg:grid-cols-[.72fr_1.28fr] lg:py-16">
      <aside className="border border-[#dfe8e8] bg-[#f7f9f7] p-6 sm:p-7">
        <p className="display text-3xl font-bold text-[#123d5b]">Talk directly.</p>
        <div className="mt-5 h-0.5 w-10 bg-[#e9781c]" />
        <p className="mt-5 text-sm leading-6 text-slate-600">For a faster conversation about a route, timing, or a tour you see here, call or send a WhatsApp message.</p>
        <a href="https://wa.me/918609752814?text=Hello%20Trip%20Himalaya%2C%20I%20would%20like%20to%20plan%20a%20trip." target="_blank" rel="noreferrer" className="focus-ring mt-7 flex min-h-12 items-center gap-3 border border-[#b7dbc0] bg-[#25d366] px-4 text-xs font-extrabold uppercase tracking-[.08em] text-white transition hover:bg-[#1fac55]"><WhatsAppIcon className="size-5" /> Chat on WhatsApp</a>
        <a href="tel:+918609752814" className="focus-ring mt-3 flex min-h-12 items-center gap-3 border border-[#d3dfda] bg-white px-4 text-xs font-extrabold uppercase tracking-[.08em] text-[#123d5b] transition hover:bg-[#eef4f2]"><Phone className="size-5 text-[#e9781c]" /> Call our local desk</a>
      </aside>
      {done ? <div className="grid min-h-80 place-items-center border border-[#cfe6d8] bg-[#f2fbf4] p-8 text-center"><div><CheckCircle2 className="mx-auto size-12 text-[#2d9b61]" /><h2 className="display mt-5 text-4xl font-bold text-[#123d5b]">Message received.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Thank you. Your enquiry is with Trip Himalaya and the team will reply with the right next step.</p></div></div> : <form onSubmit={submit} className="border border-[#dfe8e8] bg-white p-6 sm:p-8"><div className="mb-7 border-b-2 border-[#e9781c] pb-4"><h2 className="display text-3xl font-bold text-[#123d5b]">Send an enquiry</h2><p className="mt-2 text-sm leading-6 text-slate-500">You do not need a final plan. A few details are enough to begin.</p></div><div className="grid gap-5 sm:grid-cols-2"><ContactField name="name" label="Your name" required /><ContactField name="email" label="Email address" type="email" required /><ContactField name="phone" label="Phone / WhatsApp" /><ContactField name="subject" label="What are you planning?" required /><div className="sm:col-span-2"><Label htmlFor="message">Your message</Label><Textarea id="message" name="message" className="mt-2 min-h-32 rounded-none border-[#ccd9d7]" placeholder="For example: We are two people visiting Dharamshala in October and would like an easy one-day trek." required /></div></div><Button disabled={enquiry.isPending} className="mt-7 h-12 w-full rounded-none bg-[#e9781c] text-xs font-extrabold uppercase tracking-[.1em] hover:bg-[#d86b12]">{enquiry.isPending ? "Sending…" : <><Send className="size-4" /> Send enquiry</>}</Button></form>}
    </section>
  </PublicLayout>;
}

function ContactField({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <div><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} className="mt-2 h-11 rounded-none border-[#ccd9d7]" required={required} /></div>;
}
