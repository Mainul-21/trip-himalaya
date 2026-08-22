"use client";

import dynamic from "next/dynamic";

const LegacyBrowserApp = dynamic(() => import("./legacy-browser-app"), { ssr: false });

export default function LegacyClientApp() {
  return <LegacyBrowserApp />;
}
