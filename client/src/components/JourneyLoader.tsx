import { Compass } from "lucide-react";
import { OFFICIAL_TRIP_HIMALAYA_LOGO } from "@/lib/brand";

export default function JourneyLoader({ label = "Preparing your journey" }: { label?: string }) {
  return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f8faf8] px-5 text-[#123d5b]" aria-busy="true" aria-live="polite">
    <div className="journey-loader-haze absolute inset-x-0 top-0 h-72" aria-hidden="true" />
    <div className="relative grid justify-items-center">
      <div className="relative grid size-28 place-items-center" aria-hidden="true">
        <span className="journey-loader-wheel absolute inset-0 rounded-full border border-[#123d5b]/15" />
        <span className="journey-loader-wheel-reverse absolute inset-2 rounded-full border border-dashed border-[#e17818]/70" />
        <span className="journey-loader-needle absolute h-9 w-px -translate-y-5 bg-[#e17818]" />
        <span className="relative grid size-16 place-items-center overflow-hidden rounded-2xl border border-white/80 bg-[#123d5b] shadow-[0_16px_32px_rgba(18,61,91,.18)]"><img src={OFFICIAL_TRIP_HIMALAYA_LOGO} alt="" className="h-full w-full object-contain p-1.5" /></span>
        <Compass className="absolute -bottom-1 -right-1 size-6 rounded-full bg-[#e17818] p-1.5 text-white shadow-md" />
      </div>
      <p className="mt-8 font-display text-2xl font-bold uppercase tracking-[.08em]">Trip Himalaya</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#e17818]">{label}</p>
    </div>
  </main>;
}
