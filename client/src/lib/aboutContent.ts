import { Compass, HeartHandshake, MapPinned, Mountain, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

export type AboutPoint = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

export const aboutServices: AboutPoint[] = [
  { icon: Mountain, title: "Guided treks", copy: "Triund, Kareri Lake, Thatharna, and custom mountain routes shaped around your group and pace." },
  { icon: MapPinned, title: "Cultural & sightseeing tours", copy: "Dharamshala monasteries, local heritage, and regional escapes with meaningful local context." },
  { icon: Compass, title: "Adventure activities", copy: "Bir Billing paragliding and custom expedition logistics for travellers seeking an active mountain experience." },
  { icon: UsersRound, title: "Stays & custom travel planning", copy: "Handpicked stays paired with personalised trip guidance for solo travellers, families, and groups." },
];

export const aboutReasons: AboutPoint[] = [
  { icon: Compass, title: "Local expertise", copy: "Based directly in Dharamshala, our deep local knowledge helps create safe, authentic, and hassle-free journeys across Himachal Pradesh." },
  { icon: ShieldCheck, title: "Tailored itineraries", copy: "From the Thatharna Trek and Kareri Lake Trek to the Triund Sunrise Trek, we customise plans around your schedule and travel pace." },
  { icon: HeartHandshake, title: "Diverse experiences", copy: "Choose peaceful monastery visits and Dharamshala culture tours, thrilling paragliding in Bir Billing, or a balanced mix of both." },
  { icon: UsersRound, title: "End-to-end assistance", copy: "Comfortable stays, dedicated local trek guides, and practical travel planning let you focus on enjoying the mountains." },
];
