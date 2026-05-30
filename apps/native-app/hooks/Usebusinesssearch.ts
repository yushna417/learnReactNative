

import { useReducer, useEffect, useRef, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { Alert } from "react-native";

// ─── State ────────────────────────────────────────────────────────────────────

export interface SearchState {
    searchInput: string;   // live text buffer (not sent to API)
    searchQuery: string;   // debounced, sent to API

    // Filters
    category: string;
    sortBy: string;
    radiusKm: number | null;

    // Location — either device GPS or a manually geocoded address
    userLat: number | null;
    userLon: number | null;
    /**
     * Human-readable label shown in the UI:
     *   "Current location"          → GPS fix
     *   "Thamel, Kathmandu, Nepal"  → geocoded custom address
     *   null                        → no location set
     */
    locationLabel: string | null;
    locationLoading: boolean;
    locationDenied: boolean;

    // Pagination
    page: number;
    perPage: number;

    // Modal visibility
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
            // Clearing radius → also clear location so stale coords don't linger
            if (action.value === null) {
                return {
                    ...state,
                    radiusKm: null,
                    userLat: null,
                    userLon: null,
                    locationLabel: null,
                    page: 1,
                };
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
            return {
                ...state,
                userLat: null,
                userLon: null,
                locationLabel: null,
                radiusKm: null,   // radius is meaningless without a location
                page: 1,
            };

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
                searchInput: "",
                searchQuery: "",
                category: "All",
                radiusKm: null,
                sortBy: "relevance",
                userLat: null,
                userLon: null,
                locationLabel: null,
                page: 1,
                showFilters: false,
            };

        default:
            return state;
    }
}

// ─── Initial state ────────────────────────────────────────────────────────────

function buildInitialState(params: Record<string, string>): SearchState {
    return {
        searchInput: params.search ?? "",
        searchQuery: params.search ?? "",
        category: params.category ?? "All",
        sortBy: params.sort_by ?? "relevance",
        radiusKm: params.radius_km ? Number(params.radius_km) : null,
        page: params.page ? Number(params.page) : 1,
        perPage: params.per_page ? Number(params.per_page) : 10,
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
    const rawParams = useLocalSearchParams<Record<string, string>>();
    const router = useRouter();

    const [state, dispatch] = useReducer(reducer, rawParams, buildInitialState);

    // ── Debounce search → commit after 400 ms ────────────────────────────────
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(
            () => dispatch({ type: "COMMIT_SEARCH", value: state.searchInput }),
            400,
        );
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [state.searchInput]);

    // ── Sync committed state → URL (not on every keystroke) ──────────────────
    useEffect(() => {
        const next: Record<string, string> = {};
        if (state.searchQuery) next.search = state.searchQuery;
        if (state.category !== "All") next.category = state.category;
        if (state.sortBy !== "relevance") next.sort_by = state.sortBy;
        if (state.radiusKm) next.radius_km = String(state.radiusKm);
        if (state.page > 1) next.page = String(state.page);
        if (state.perPage !== 10) next.per_page = String(state.perPage);
        router.setParams(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.searchQuery, state.category, state.sortBy, state.radiusKm, state.page, state.perPage]);

    // ── Silently grab GPS on mount if already permitted ───────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === "granted") {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                dispatch({
                    type: "SET_LOCATION",
                    lat: loc.coords.latitude,
                    lon: loc.coords.longitude,
                    label: "Current location",
                });
            }
        })();
    }, []);

    // ── Request GPS (called from UI) ──────────────────────────────────────────
    const requestGPSLocation = useCallback(async (): Promise<boolean> => {
        dispatch({ type: "SET_LOCATION_LOADING", value: true });
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                dispatch({ type: "SET_LOCATION_DENIED", value: true });
                Alert.alert(
                    "Location Permission Denied",
                    "Enable location in your device settings to use radius search.",
                );
                return false;
            }
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            dispatch({
                type: "SET_LOCATION",
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
                label: "Current location",
            });
            return true;
        } catch {
            Alert.alert("Location Error", "Could not fetch your location. Try again.");
            dispatch({ type: "SET_LOCATION_LOADING", value: false });
            return false;
        }
    }, []);

    // ── Geocode a typed address (called from LocationPickerSection) ───────────
    const geocodeAddress = useCallback(async (address: string): Promise<boolean> => {
        if (!address.trim()) return false;
        dispatch({ type: "SET_LOCATION_LOADING", value: true });
        try {
            const results = await Location.geocodeAsync(address);
            if (!results.length) {
                Alert.alert("Address Not Found", "Try a more specific address or place name.");
                dispatch({ type: "SET_LOCATION_LOADING", value: false });
                return false;
            }
            const { latitude, longitude } = results[0];
            dispatch({
                type: "SET_LOCATION",
                lat: latitude,
                lon: longitude,
                label: address.trim(),
            });
            return true;
        } catch {
            Alert.alert("Geocoding Error", "Could not look up that address. Try again.");
            dispatch({ type: "SET_LOCATION_LOADING", value: false });
            return false;
        }
    }, []);

    // ── Derived API params ────────────────────────────────────────────────────
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
        geocodeAddress,
    };
}