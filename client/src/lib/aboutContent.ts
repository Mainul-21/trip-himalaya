import { Compass, HeartHandshake, MapPinned, Mountain, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

export type AboutPoint = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

export const aboutServices: AboutPoint[] = [
  { icon: Mountain, title: "Treks", copy: "Guided mountain walks at the right pace." },
  { icon: MapPinned, title: "Dharamshala days", copy: "Local plans around McLeod Ganj and Kangra." },
  { icon: UsersRound, title: "Private trips", copy: "Flexible travel for friends, families and small groups." },
];

export const aboutReasons: AboutPoint[] = [
  { icon: Compass, title: "Local planning", copy: "Routes built around your dates and time." },
  { icon: ShieldCheck, title: "Clear details", copy: "Straight guidance on the plan and preparation." },
  { icon: HeartHandshake, title: "Direct support", copy: "Speak to the team before you travel." },
];
