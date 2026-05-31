

import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Shared types ─────────────────────────────────────────────────────────────

export type ListingParams = {
  search?: string;
  category?: string;
  sort_by?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  page?: number;
  per_page?: number;
}

export type BusinessListing = {
  id: number;
  title: string;
  business_category: string;
  service_detail: string;
  phone_no: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  location_url: string | null;
  /** Populated only on radius searches; null otherwise */
  distance_km: number | null;
  created_at: string;
  updated_at: string;
}

export type PaginationMeta = {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export type ListingsResponse = {
  listings: BusinessListing[];
  pagination: PaginationMeta;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Drop undefined / null / empty-string values so the URL stays clean */
function clean(params: ListingParams): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Record<string, string | number>;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function fetchListings(
  params: ListingParams = {}
): Promise<ListingsResponse> {
  const { data } = await apiClient.get<ListingsResponse>("/business/listings/", {
    params: clean(params),
  });
  return data;
}

export async function fetchListingById(
  id: number | string
): Promise<BusinessListing> {
  const { data } = await apiClient.get<BusinessListing>(
    `/business/${id}/`
  );
  return data;
}

// ─── Nominatim (OSM) forward geocoding ───────────────────────────────────────

export type NominatimResult = {
  place_id: string;
  lat: string;   // string decimal, e.g. "27.7172"
  lon: string;
  display_name: string;
  type: string;
}

/**
 * Convert a human-readable address/place name → lat+lon.
 * Uses OSM Nominatim — free, no API key, but respect the 1 req/s rate limit.
 */
export async function geocodeAddress(
  address: string
): Promise<NominatimResult[]> {
  const { data } = await axios.get<NominatimResult[]>(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: address, format: "json", limit: 5, addressdetails: 0 },
      headers: { "Accept-Language": "en", "User-Agent": "BusinessSearchApp/1.0" },
    }
  );
  return data;
}