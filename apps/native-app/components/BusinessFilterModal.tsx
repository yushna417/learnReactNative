import React from "react";
import {
    View, Text, TouchableOpacity, ScrollView, Modal,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Action, SearchState } from "@/hooks/Usebusinesssearch";
import { LocationPickerSection } from "./Locationpickersection";



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

function SectionLabel({ children }: { children: string }) {
    return (
        <Text className="text-gray-900 font-semibold text-base mb-3">{children}</Text>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BusinessFilterModalProps {
    state: SearchState;
    dispatch: React.Dispatch<Action>;
    onRequestGPS: () => Promise<boolean>;
    onGeocodeAddress: (address: string) => Promise<boolean>;
    onClearAll: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BusinessFilterModal({
    state,
    dispatch,
    onRequestGPS,
    onGeocodeAddress,
    onClearAll,
}: BusinessFilterModalProps) {

    const close = () => dispatch({ type: "TOGGLE_FILTERS", value: false });

    // Tapping a radius chip when no location is set → open GPS automatically
    const handleRadiusPress = async (value: number) => {
        const next = state.radiusKm === value ? null : value;
        if (next === null) {
            dispatch({ type: "SET_RADIUS", value: null });
            return;
        }
        // Ensure location is available before activating radius
        if (!state.userLat) {
            const ok = await onRequestGPS();
            if (!ok) return;
        }
        dispatch({ type: "SET_RADIUS", value: next });
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={state.showFilters}
            onRequestClose={close}
        >
            <View className="flex-1 bg-black/50">
                {/* Tap backdrop to dismiss */}
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={close} />

                <View className="bg-white rounded-t-3xl">
                    <View className="p-6">

                        {/* ── Header ──────────────────────────────────────── */}
                        <View className="flex-row justify-between items-center mb-6">
                            <Heading size="xl" className="text-gray-900">Filters</Heading>
                            <TouchableOpacity onPress={close} hitSlop={12}>
                                <Text className="text-gray-400 text-xl">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            className="max-h-[480px]"
                        >
                            {/* ── Category ────────────────────────────────── */}
                            <View className="mb-6">
                                <SectionLabel>Category</SectionLabel>
                                <View className="flex-row flex-wrap">
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => dispatch({ type: "SET_CATEGORY", value: cat })}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full ${state.category === cat
                                                ? "bg-yellow-500"
                                                : "bg-gray-100"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${state.category === cat
                                                    ? "text-white font-semibold"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="h-px bg-gray-100 mb-6" />

                            <View className="mb-6">
                                <LocationPickerSection
                                    state={state}
                                    dispatch={dispatch}
                                    onRequestGPS={onRequestGPS}
                                    onGeocodeAddress={onGeocodeAddress}
                                />
                            </View>

                            {/* ── Radius (only meaningful with a location) ── */}
                            <View className="mb-2">
                                <View className="flex-row items-center justify-between mb-3">
                                    <SectionLabel>Search Radius</SectionLabel>
                                    {!state.userLat && (
                                        <Text className="text-gray-400 text-xs">
                                            Set a location first
                                        </Text>
                                    )}
                                </View>
                                <View className="flex-row flex-wrap">
                                    {RADIUS_OPTIONS.map((r) => {
                                        const active = state.radiusKm === r.value;
                                        const enabled = !!state.userLat;
                                        return (
                                            <TouchableOpacity
                                                key={r.value}
                                                onPress={() => handleRadiusPress(r.value)}
                                                className={`mr-2 mb-2 px-4 py-2 rounded-full ${active
                                                    ? "bg-yellow-500"
                                                    : enabled
                                                        ? "bg-gray-100"
                                                        : "bg-gray-50"
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-sm ${active
                                                        ? "text-white font-semibold"
                                                        : enabled
                                                            ? "text-gray-700"
                                                            : "text-gray-300"
                                                        }`}
                                                >
                                                    {r.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>

                        {/* ── Footer actions ───────────────────────────────── */}
                        <View className="flex-row gap-3 mt-6 pb-2">
                            <Button
                                onPress={onClearAll}
                                variant="outline"
                                className="flex-1 h-12 rounded-xl border-gray-300"
                            >
                                <ButtonText className="text-gray-700">Clear All</ButtonText>
                            </Button>
                            <Button
                                onPress={close}
                                className="flex-1 h-12 bg-yellow-500 rounded-xl"
                            >
                                <ButtonText className="text-white font-semibold">Done</ButtonText>
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}