
import React from "react";
import { Drawer, Badge, Button, DrawerItems, DrawerHeader } from "flowbite-react";
import { HiAdjustments, HiLocationMarker } from "react-icons/hi";
import { LocationPickerMap } from "./LocationPickerMap";
import { Action, SearchState } from "../hooks/useBusinessSearch";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES = [
    "All", "Electronics Repair", "Restaurant", "Technology", "Healthcare",
    "Retail", "Hospitality", "Transportation", "Education",
    "Construction", "Real Estate", "Entertainment", "Professional Services", "Other",
];

export const RADIUS_OPTIONS = [
    { label: "1 km", value: 1 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
];

export const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
];

// ─── Section header ───────────────────────────────────────────────────────────

function Section({ label, hint }: { label: string; hint?: string }) {
    return (
        <div className="flex items-baseline gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-wide uppercase">
                {label}
            </span>
            {hint && <span className="text-xs text-gray-400">{hint}</span>}
        </div>
    );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
    label, active, disabled, onClick,
}: {
    label: string; active: boolean; disabled?: boolean; onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={[
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 select-none",
                active
                    ? "bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900"
                    : disabled
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-400",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type BusinessFilterDrawerProps = {
    state: SearchState;
    dispatch: React.Dispatch<Action>;
    onRequestGPS: () => Promise<boolean>;
    onGeocodeAddress: (address: string) => Promise<boolean>;
    onClearAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BusinessFilterDrawer({
    state,
    dispatch,
    onRequestGPS,
    onGeocodeAddress,
    onClearAll,
}: BusinessFilterDrawerProps) {
    const close = () => dispatch({ type: "TOGGLE_FILTERS", value: false });

    const handleRadiusPress = async (value: number) => {
        const next = state.radiusKm === value ? null : value;
        if (next === null) {
            dispatch({ type: "SET_RADIUS", value: null });
            return;
        }
        if (!state.userLat) {
            const ok = await onRequestGPS();
            if (!ok) return;
        }
        dispatch({ type: "SET_RADIUS", value: next });
    };

    const handleMapPick = (lat: number, lon: number, label: string) => {
        dispatch({ type: "SET_LOCATION", lat, lon, label });
    };

    return (
        <Drawer open={state.showFilters} onClose={close} position="right" className="w-[50%]">
            <DrawerHeader
                title="Filters"
                titleIcon={HiAdjustments}
            />

            <DrawerItems>
                <div className="flex flex-col gap-7 py-8">

                    <div>
                        <Section label="Category" />
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    active={state.category === cat}
                                    onClick={() => dispatch({ type: "SET_CATEGORY", value: cat })}
                                />
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-100 dark:border-gray-700" />

                    <div>
                        <Section
                            label="Search Location"
                            hint={state.userLat ? undefined : "optional"}
                        />

                        {/* GPS button */}
                        <Button
                            color={state.userLat ? "success" : "light"}
                            size="sm"
                            className="mb-3 w-full"
                            onClick={onRequestGPS}
                            disabled={state.locationLoading}
                        >
                            <HiLocationMarker className="mr-2 h-4 w-4" />
                            {state.userLat && state.locationLabel === "Current location"
                                ? "📍 Using current location"
                                : "Use my current location"}
                        </Button>

                        {state.locationDenied && (
                            <p className="text-xs text-red-500 mb-3">
                                Location permission denied. Search a place below, or click the map.
                            </p>
                        )}

                        {/* Map picker */}
                        <LocationPickerMap
                            lat={state.userLat}
                            lon={state.userLon}
                            label={state.locationLabel}
                            loading={state.locationLoading}
                            onPick={handleMapPick}
                            onClear={() => dispatch({ type: "CLEAR_LOCATION" })}
                        />
                    </div>

                    {/* ── Radius ───────────────────────────────────────────────────── */}
                    <div>
                        <Section
                            label="Search Radius"
                            hint={!state.userLat ? "set a location first" : undefined}
                        />
                        <div className="flex flex-wrap gap-2">
                            {RADIUS_OPTIONS.map((r) => (
                                <Chip
                                    key={r.value}
                                    label={r.label}
                                    active={state.radiusKm === r.value}
                                    disabled={!state.userLat}
                                    onClick={() => handleRadiusPress(r.value)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button color="light" className="flex-1" onClick={onClearAll}>
                            Clear All
                        </Button>
                        <Button color="yellow" className="flex-1" onClick={close}>
                            Apply
                        </Button>
                    </div>

                </div>
            </DrawerItems>
        </Drawer>
    );
}

