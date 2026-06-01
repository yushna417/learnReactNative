import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { z } from "zod";
import { businessSchema } from "@/app/business";

type BusinessListingData = z.infer<typeof businessSchema>;

export const useCreateListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: BusinessListingData) => {
			const response = await apiClient.post("/business/create/", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};
// adjust to your actual path


export type ListingParams = {
	search?: string;
	category?: string;
	sort_by?: string;
	lat?: number | null;
	lon?: number | null;
	radius_km?: number | null;
	page?: number;
	per_page?: number;
};

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
	distance_km: number | null;
	created_at: string;
	updated_at: string;
};

export type PaginationMeta = {
	total: number;
	page: number;
	per_page: number;
	total_pages: number;
	has_next: boolean;
	has_previous: boolean;
};

export type ListingsResponse = {
	listings: BusinessListing[];
	pagination: PaginationMeta;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useGetAllListings = (params: ListingParams = {}) => {
	const cleanParams = Object.fromEntries(
		Object.entries(params).filter(
			([, v]) => v !== null && v !== undefined && v !== "",
		),
	) as Record<string, string | number>;

	return useQuery<ListingsResponse>({
		queryKey: ["listings", cleanParams],
		queryFn: async () => {
			const response = await apiClient.get("/business/listings/", {
				params: cleanParams,
			});
			return response.data as ListingsResponse;
		},
		// Keep previous data while new page/filter is loading → no layout jump
		placeholderData: (prev) => prev,
	});
};

export const useListingDetail = (id: number) => {
	return useQuery({
		queryKey: ["listing", id],
		queryFn: async () => {
			const response = await apiClient.get(`/business/${id}/`);
			return response.data;
		},
		enabled: !!id,
	});
};

export const useUpdateListing = (id: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Partial<BusinessListingData>) => {
			const response = await apiClient.patch(`/business/${id}/update/`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listing", id] });
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};

export const useDeleteListing = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const response = await apiClient.delete(`/business/${id}/delete/`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["listings"] });
		},
	});
};
