export type MatchableTrip = {
  origin: string;
  destination: string;
  via: string[];
  departureAt: Date;
  availableWeightKg: number;
};

export function normalizePlace(place: string): string {
  return place
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function placeMatches(routePlace: string, searchPlace: string): boolean {
  const route = normalizePlace(routePlace);
  const search = normalizePlace(searchPlace);
  return route === search || route.includes(search) || search.includes(route);
}

export function matchesTrip(
  trip: MatchableTrip,
  query: { origin: string; destination: string; weightKg: number },
): boolean {
  if (trip.availableWeightKg < query.weightKg || trip.departureAt <= new Date()) {
    return false;
  }

  const stops = [trip.origin, ...trip.via, trip.destination];
  return stops.some((stop, index) =>
    placeMatches(stop, query.origin) &&
    stops.slice(index + 1).some((nextStop) => placeMatches(nextStop, query.destination)),
  );
}

export function scoreTrip(
  trip: MatchableTrip,
  query: { origin: string; destination: string },
): number {
  const stops = [trip.origin, ...trip.via, trip.destination].map(normalizePlace);
  const originIndex = stops.findIndex((place) => placeMatches(place, query.origin));
  const destinationIndex = stops.findIndex(
    (place, index) => index > originIndex && placeMatches(place, query.destination),
  );
  if (originIndex < 0 || destinationIndex < 0) return 0;
  return (originIndex === 0 ? 2 : 0) + (destinationIndex === stops.length - 1 ? 2 : 0);
}
