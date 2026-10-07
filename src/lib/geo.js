const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

/** Distancia en km entre dos puntos [lat, lng] (fórmula del semiverseno). */
export function distanceKm([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Minutos aproximados andando (4,8 km/h) y en coche por ciudad (35 km/h). */
export function travelMinutes(km) {
  return {
    walk: Math.round((km / 4.8) * 60),
    car: Math.max(1, Math.round((km / 35) * 60))
  };
}
