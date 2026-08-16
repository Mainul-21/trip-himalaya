import { Compass, HeartHandshake, MapPinned, Mountain, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

export type AboutPoint = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

export const aboutServices: AboutPoint[] = [
  { icon: Mountain, title: "Trekking journeys", copy: "Thoughtful routes, practical preparation, and a pace that fits your group." },
  { icon: Compass, title: "Spiritual and Himachal tours", copy: "Meaningful visits and mountain days planned with local context and breathing room." },
  { icon: MapPinned, title: "Camping and village experiences", copy: "Time outdoors, local landscapes, and stays that help you see more than a checklist." },
  { icon: UsersRound, title: "Custom tours", copy: "A flexible plan for families, friends, couples, and travellers with a clear idea of their own." },
];

export const aboutReasons: AboutPoint[] = [
  { icon: Compass, title: "Local Himalayan understanding", copy: "Trip plans are shaped around Dharamshala, Kangra, and Himachal conditions—not copied from a template." },
  { icon: ShieldCheck, title: "Safety and clear details", copy: "We explain routes, stays, timing, inclusions, and practical preparation before you commit." },
  { icon: HeartHandshake, title: "Comfort with honest pricing", copy: "A well-paced journey, sensible choices, and transparent conversations about what your plan includes." },
  { icon: UsersRound, title: "Personal support", copy: "From the first conversation to the journey itself, you can speak with the team when you need help." },
];
