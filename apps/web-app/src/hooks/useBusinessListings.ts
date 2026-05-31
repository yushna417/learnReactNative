

import { useQuery } from "@tanstack/react-query";
import {
  fetchListings,
  fetchListingById,
  type ListingParams,
  type ListingsResponse,
  type BusinessListing,
} from "../api/businessListings";


export function useGetAllListings(params: ListingParams = {}) {
  const stableParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

  return useQuery<ListingsResponse>({
    queryKey: ["listings", stableParams],
    queryFn: () => fetchListings(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useGetListingById(id: number | string | undefined) {
  return useQuery<BusinessListing>({
    queryKey: ["listing", id],
    queryFn: () => fetchListingById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}