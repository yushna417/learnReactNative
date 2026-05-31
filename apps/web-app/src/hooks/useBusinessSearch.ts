

import { useReducer, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { geocodeAddress } from "../api/businessListings";

// ─── State ────────────────────────────────────────────────────────────────────

export type SearchState = {
    searchInput: string;   // live typing buffer (not sent to API)
    searchQuery: string;   // debounced — sent to API

    category: string;
    sortBy: string;

    radiusKm: number | null;

    userLat: number | null;
    userLon: number | null;
    /** "Current location" | typed address string | null */
    locationLabel: string | null;

    locationLoading: boolean;
    locationDenied: boolean;

    page: number;
    perPage: number;

    // UI visibility
    showFilters: boolean;
    showSort: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type Action =
    | { type: "SET_SEARCH_INPUT"; value: string }
    | { type: "COMMIT_SEARCH"; value: string }
    | { type: "SET_CATEGORY"; value: string }
    | { type: "SET_SORT"; value: string }
    | { type: "SET_RADIUS"; value: number | null }
    | { type: "SET_PAGE"; value: number }
    | { type: "SET_PER_PAGE"; value: number }
    | { type: "SET_LOCATION"; lat: number; lon: number; label: string }
    | { type: "CLEAR_LOCATION" }
    | { type: "SET_LOCATION_LOADING"; value: boolean }
    | { type: "SET_LOCATION_DENIED"; value: boolean }
    | { type: "TOGGLE_FILTERS"; value: boolean }
    | { type: "TOGGLE_SORT"; value: boolean }
    | { type: "CLEAR_FILTERS" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: SearchState, action: Action): SearchState {
    switch (action.type) {
        case "SET_SEARCH_INPUT":
            return { ...state, searchInput: action.value };
        case "COMMIT_SEARCH":
            return { ...state, searchQuery: action.value, page: 1 };
        case "SET_CATEGORY":
            return { ...state, category: action.value, page: 1 };
        case "SET_SORT":
            return { ...state, sortBy: action.value, page: 1 };
        case "SET_RADIUS":
            if (action.value === null) {
                return { ...state, radiusKm: null, userLat: null, userLon: null, locationLabel: null, page: 1 };
            }
            return { ...state, radiusKm: action.value, page: 1 };
        case "SET_PAGE":
            return { ...state, page: action.value };
        case "SET_PER_PAGE":
            return { ...state, perPage: action.value, page: 1 };
        case "SET_LOCATION":
            return {
                ...state,
                userLat: action.lat,
                userLon: action.lon,
                locationLabel: action.label,
                locationLoading: false,
                locationDenied: false,
            };
        case "CLEAR_LOCATION":
            return { ...state, userLat: null, userLon: null, locationLabel: null, radiusKm: null, page: 1 };
        case "SET_LOCATION_LOADING":
            return { ...state, locationLoading: action.value };
        case "SET_LOCATION_DENIED":
            return { ...state, locationDenied: action.value, locationLoading: false };
        case "TOGGLE_FILTERS":
            return { ...state, showFilters: action.value };
        case "TOGGLE_SORT":
            return { ...state, showSort: action.value };
        case "CLEAR_FILTERS":
            return {
                ...state,
                searchInput: "", searchQuery: "",
                category: "All", radiusKm: null, sortBy: "relevance",
                userLat: null, userLon: null, locationLabel: null,
                page: 1, showFilters: false,
            };
        default:
            return state;
    }
}

// ─── Seed from URL search params ──────────────────────────────────────────────

type UrlParams = {
    search?: string;
    category?: string;
    sort_by?: string;
    radius_km?: string;
    page?: string;
    per_page?: string;
}

function buildInitialState(params: UrlParams): SearchState {
    return {
        searchInput: params.search ?? "",
        searchQuery: params.search ?? "",
        category: params.category ?? "All",
        sortBy: params.sort_by ?? "relevance",
        radiusKm: params.radius_km ? Number(params.radius_km) : null,
        page: params.page ? Number(params.page) : 1,
        perPage: params.per_page ? Number(params.per_page) : 12,
        userLat: null,
        userLon: null,
        locationLabel: null,
        locationLoading: false,
        locationDenied: false,
        showFilters: false,
        showSort: false,
    };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBusinessSearch() {
    const urlParams = useSearch({ strict: false }) as UrlParams;
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, urlParams, buildInitialState);

    // ── Search debounce ────────────────────────────────────────────────────────
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
            () => dispatch({ type: "COMMIT_SEARCH", value: state.searchInput }),
            400
        );
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [state.searchInput]);

    // ── Sync committed state → URL ─────────────────────────────────────────────
    useEffect(() => {
        const next: Record<string, string> = {};
        if (state.searchQuery) next.search = state.searchQuery;
        if (state.category !== "All") next.category = state.category;
        if (state.sortBy !== "relevance") next.sort_by = state.sortBy;
        if (state.radiusKm) next.radius_km = String(state.radiusKm);
        if (state.page > 1) next.page = String(state.page);
        if (state.perPage !== 12) next.per_page = String(state.perPage);

        navigate({ search: next as any, replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.searchQuery, state.category, state.sortBy, state.radiusKm, state.page, state.perPage]);

    // ── Browser GPS ────────────────────────────────────────────────────────────
    const requestGPSLocation = useCallback(async (): Promise<boolean> => {
        if (!("geolocation" in navigator)) {
            alert("Your browser does not support geolocation.");
            return false;
        }
        dispatch({ type: "SET_LOCATION_LOADING", value: true });
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    dispatch({
                        type: "SET_LOCATION",
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        label: "Current location",
                    });
                    resolve(true);
                },
                (err) => {
                    console.warn("GPS error:", err.message);
                    dispatch({ type: "SET_LOCATION_DENIED", value: true });
                    resolve(false);
                },
                { enableHighAccuracy: false, timeout: 8000 }
            );
        });
    }, []);

    // ── Nominatim geocoding ────────────────────────────────────────────────────
    const geocodeAddressSearch = useCallback(async (address: string): Promise<boolean> => {
        if (!address.trim()) return false;
        dispatch({ type: "SET_LOCATION_LOADING", value: true });
        try {
            const results = await geocodeAddress(address);
            if (!results.length) {
                dispatch({ type: "SET_LOCATION_LOADING", value: false });
                return false;
            }
            const { lat, lon, display_name } = results[0];
            dispatch({
                type: "SET_LOCATION",
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                label: display_name.split(",").slice(0, 3).join(",").trim(),
            });
            return true;
        } catch {
            dispatch({ type: "SET_LOCATION_LOADING", value: false });
            return false;
        }
    }, []);

    // ── Derived API params ─────────────────────────────────────────────────────
    const apiParams = {
        search: state.searchQuery || undefined,
        category: state.category !== "All" ? state.category : undefined,
        sort_by: state.sortBy !== "relevance" ? state.sortBy : undefined,
        lat: state.radiusKm && state.userLat ? state.userLat : undefined,
        lon: state.radiusKm && state.userLon ? state.userLon : undefined,
        radius_km: state.radiusKm ?? undefined,
        page: state.page,
        per_page: state.perPage,
    };

    const activeFilterCount = [
        state.category !== "All",
        state.radiusKm !== null,
    ].filter(Boolean).length;

    return {
        state,
        dispatch,
        apiParams,
        activeFilterCount,
        requestGPSLocation,
        geocodeAddress: geocodeAddressSearch,
    };
}