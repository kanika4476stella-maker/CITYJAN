/**
 * Client-side geocoding helper for CITYजन report module.
 * Calls the /api/geocode server route which keeps the API key secure.
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

/** Reverse geocode a lat/lng to a human-readable address */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    });
    const data = await res.json();
    return data.address ?? coordinateString(lat, lng);
  } catch {
    return coordinateString(lat, lng);
  }
}

/** Get the user's current GPS position */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

/** Format coordinates as a readable string */
export function coordinateString(lat: number, lng: number): string {
  return `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`;
}

/** Default map center: India */
export const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
export const INDIA_ZOOM = 5;
export const CITY_ZOOM = 14;
export const PIN_ZOOM = 17;
