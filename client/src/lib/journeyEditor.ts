export type JourneyDay = {
  day: string;
  title: string;
  description: string;
};

export function addJourneyItem(items: string[], value: string) {
  const clean = value.trim();
  return clean ? [...items, clean] : items;
}

export function updateJourneyItem(items: string[], index: number, value: string) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

export function removeJourneyItem(items: string[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function addJourneyDay(items: JourneyDay[]) {
  return [...items, { day: `Day ${items.length + 1}`, title: "", description: "" }];
}

export function updateJourneyDay(items: JourneyDay[], index: number, patch: Partial<JourneyDay>) {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}

export function removeJourneyDay(items: JourneyDay[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function cleanJourneyDetails(details: {
  highlights: string[];
  itinerary: JourneyDay[];
  inclusions: string[];
  exclusions: string[];
}) {
  return {
    highlights: details.highlights.map(item => item.trim()).filter(Boolean),
    itinerary: details.itinerary
      .map(item => ({
        day: item.day.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter(item => item.day && item.title && item.description),
    inclusions: details.inclusions.map(item => item.trim()).filter(Boolean),
    exclusions: details.exclusions.map(item => item.trim()).filter(Boolean),
  };
}
