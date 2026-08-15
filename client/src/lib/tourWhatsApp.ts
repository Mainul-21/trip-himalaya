export type TourWhatsAppDetails = {
  title: string;
  location: string;
  duration: string;
  difficulty: string;
  shortDescription: string;
  priceFrom: number;
};

export function buildTourWhatsAppMessage(tour: TourWhatsAppDetails) {
  return encodeURIComponent([
    "Hello Trip Himalaya, I would like to know more about this journey:",
    `Tour: ${tour.title}`,
    `Location: ${tour.location} · ${tour.duration} · ${tour.difficulty}`,
    `About: ${tour.shortDescription}`,
    `Starting from: ₹${tour.priceFrom.toLocaleString("en-IN")} per person. Please share availability and the next steps.`,
  ].join("\n"));
}
