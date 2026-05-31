
import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Spinner, TextInput, Button, Badge } from "flowbite-react";
import { HiSearch, HiLocationMarker, HiX } from "react-icons/hi";


// Fix Leaflet default marker icon (broken by bundlers)
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import { geocodeAddress, NominatimResult } from "../api/businessListings";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIconUrl,
    iconRetinaUrl: markerIcon2xUrl,
    shadowUrl: markerShadowUrl,
});


type LocationPickerMapProps = {
    lat: number | null;
    lon: number | null;
    label: string | null;
    loading: boolean;
    onPick: (lat: number, lon: number, label: string) => void;
    onClear: () => void;
}

// ─── Internal: click handler ──────────────────────────────────────────────────

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// ─── Internal: fly-to when external coords change ────────────────────────────

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lon], 13, { duration: 1.2 });
    }, [lat, lon, map]);
    return null;
}


export function LocationPickerMap({
    lat, lon, label, loading, onPick, onClear,
}: LocationPickerMapProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced suggestion fetch (500 ms)
    const fetchSuggestions = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!q.trim()) { setSuggestions([]); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const results = await geocodeAddress(q);
                setSuggestions(results.slice(0, 5));
            } catch { /* ignore */ }
            finally { setSearching(false); }
        }, 500);
    }, []);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        fetchSuggestions(e.target.value);
    };

    const handleSuggestionClick = (r: NominatimResult) => {
        const shortLabel = r.display_name.split(",").slice(0, 3).join(",").trim();
        onPick(parseFloat(r.lat), parseFloat(r.lon), shortLabel);
        setQuery(shortLabel);
        setSuggestions([]);
    };

    const handleMapClick = (clickLat: number, clickLon: number) => {
        // Reverse label: use coordinates as label when clicking directly
        onPick(clickLat, clickLon, `${clickLat.toFixed(5)}, ${clickLon.toFixed(5)}`);
        setSuggestions([]);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* ── Search input ─────────────────────────────────────────────────── */}
            <div className="relative">
                <div className="relative">
                    <TextInput
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Search a city, neighbourhood, address…"
                        icon={searching ? () => <Spinner size="sm" /> : HiSearch}
                        sizing="sm"
                    />
                </div>

                {/* Suggestion dropdown */}
                {suggestions.length > 0 && (
                    <ul className="absolute z-1000 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                        {suggestions.map((r) => (
                            <li key={r.place_id}>
                                <button
                                    type="button"
                                    onClick={() => handleSuggestionClick(r)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                >
                                    <span className="font-medium">{r.display_name.split(",")[0]}</span>
                                    <span className="text-gray-400 text-xs block truncate">
                                        {r.display_name.split(",").slice(1).join(",").trim()}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Active location badge ─────────────────────────────────────────── */}
            {lat !== null && label && (
                <div className="flex items-center gap-2">
                    <Badge color="success" icon={HiLocationMarker} className="flex-1 truncate">
                        {label}
                    </Badge>
                    <button
                        type="button"
                        onClick={() => { onClear(); setQuery(""); setSuggestions([]); }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Clear location"
                    >
                        <HiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <MapContainer
                    center={lat !== null ? [lat, lon!] : [27.7172, 85.324]}
                    zoom={lat !== null ? 13 : 6}
                    style={{ height: 260, width: "100%" }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {lat !== null && <Marker position={[lat, lon!]} />}
                    {lat !== null && <FlyTo lat={lat} lon={lon!} />}
                    <ClickHandler onPick={handleMapClick} />
                </MapContainer>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-999">
                        <Spinner size="lg" />
                    </div>
                )}

                {/* Hint */}
                {lat === null && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-500 pointer-events-none">
                        <span className="bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full shadow">
                            Click on the map to drop a pin
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}