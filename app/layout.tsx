import type { Metadata } from "next";
import "../client/src/index.css";

export const metadata: Metadata = {
  title: "Trip Himalaya | Dharamshala Tour Agency",
  description: "Guided Himalayan tours, treks, stays, and tailored travel plans from Dharamshala.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
