export function formatPublishedJourneyCount(count: number): string {
  const safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  return `${safeCount} current ${safeCount === 1 ? "journey" : "journeys"}`;
}
