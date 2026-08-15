type FeaturedTour = {
  isFeatured: boolean;
  featureOrder: number;
};

/**
 * Keeps the public homepage focused on the administrator-selected Top 4.
 * Sorting again here prevents an unexpected backend ordering change from
 * changing the visible rank order.
 */
export function selectTopFeaturedTours<T extends FeaturedTour>(tours: T[], limit = 4): T[] {
  return [...tours]
    .filter(tour => tour.isFeatured)
    .sort((first, second) => first.featureOrder - second.featureOrder)
    .slice(0, limit);
}
