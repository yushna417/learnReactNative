import React, { useEffect, useRef, useState } from "react";
import {
    View, Text, TouchableOpacity, KeyboardAvoidingView,
    Platform, ScrollView, TextInput as RNTextInput, Modal,
    StyleSheet, Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import {
    FormControl, FormControlError, FormControlErrorIcon,
    FormControlErrorText, FormControlLabel, FormControlLabelText
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Alert, AlertText, AlertIcon } from "@/components/ui/alert";
import { useCreateListing } from "@/hooks/useBusinessListings";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
    "Electronics Repair", "Restaurant", "Retail", "Healthcare",
    "Education", "Technology", "Construction", "Real Estate",
    "Transportation", "Hospitality", "Entertainment",
    "Professional Services", "Other",
];

// ── Zod schema ────────────────────────────────────────────────────────────────
export const businessSchema = z.object({
    title: z
        .string()
        .min(1, "Business title is required")
        .max(100, "Must be less than 100 characters"),

    business_category: z
        .string()
        .min(1, "Please select a category"),

    service_detail: z
        .string()
        .min(1, "Service details are required")
        .max(2000, "Must be less than 2000 characters"),

    phone_no: z
        .string()
        .min(1, "Phone number is required")
        .regex(/^\+[1-9]\d{1,14}$/, "Use E.164 format e.g. +9779801122334"),

    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),

    latitude: z.string().min(1, "Location is required"),
    longitude: z.string().min(1, "Location is required"),
});

type BusinessFormData = z.infer<typeof businessSchema>;

// ── Rich Text Editor ──────────────────────────────────────────────────────────
const RichTextEditor = ({
    value, onChange, error, charCount,
}: {
    value: string; onChange: (v: string) => void;
    error?: string; charCount: number;
}) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View className={`border rounded-xl bg-gray-50 ${error ? "border-red-300" : isFocused ? "border-yellow-400" : "border-gray-200"}`}>
            <RNTextInput
                className="p-4 text-gray-900 min-h-[150px] text-base"
                multiline
                numberOfLines={8}
                placeholder="Describe your business services, specialties, and offerings..."
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={2000}
                textAlignVertical="top"
            />
            <View className="p-2 border-t border-gray-200">
                <Text className="text-right text-gray-400 text-xs">{charCount}/2000</Text>
            </View>
        </View>
    );
};

// ── Category Picker ───────────────────────────────────────────────────────────
const CategoryPicker = ({
    value, onChange, error,
}: {
    value: string; onChange: (v: string) => void; error?: string;
}) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className={`h-14 rounded-xl border px-4 bg-gray-50 justify-center ${error ? "border-red-300" : "border-gray-200"}`}
            >
                <Text className={value ? "text-gray-900 text-base" : "text-gray-400 text-base"}>
                    {value || "Select a category..."}
                </Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="slide">
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8">
                        <View className="p-4 border-b border-gray-100">
                            <Text className="text-gray-900 font-bold text-lg text-center">
                                Select Category
                            </Text>
                        </View>
                        <ScrollView className="max-h-80">
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => { onChange(cat); setOpen(false); }}
                                    className={`px-6 py-4 border-b border-gray-50 ${value === cat ? "bg-yellow-50" : ""}`}
                                >
                                    <Text className={`text-base ${value === cat ? "text-yellow-600 font-semibold" : "text-gray-700"}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

// ── Location Picker Modal ─────────────────────────────────────────────────────
const LocationPickerModal = ({
    visible, onConfirm, onClose,
}: {
    visible: boolean;
    onConfirm: (lat: string, lng: string) => void;
    onClose: () => void;
}) => {
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region>({
        latitude: 27.7172,
        longitude: 85.3240,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [markerCoord, setMarkerCoord] = useState({
        latitude: 27.7172,
        longitude: 85.3240,
    });
    const [loading, setLoading] = useState(true);

    // Go to user's current location when modal opens
    useEffect(() => {
        if (!visible) return;
        (async () => {
            setLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const loc = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = loc.coords;
                const next = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
                setRegion(next);
                setMarkerCoord({ latitude, longitude });
                mapRef.current?.animateToRegion(next, 500);
            }
            setLoading(false);
        })();
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView style={{ flex: 1 }}>
                {/* Top bar */}
                <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
                    <TouchableOpacity onPress={onClose} className="mr-4">
                        <Text className="text-gray-500 text-base">✕ Cancel</Text>
                    </TouchableOpacity>
                    <Text className="flex-1 text-gray-900 font-bold text-base text-center">
                        Pin Business Location
                    </Text>
                    <View style={{ width: 60 }} />
                </View>

                <Text className="text-gray-500 text-xs text-center py-2 bg-white">
                    Tap the map or drag the pin to set your location
                </Text>

                {/* Map */}
                <View style={{ flex: 1 }}>
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFillObject}
                        region={region}
                        onPress={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        <Marker
                            coordinate={markerCoord}
                            draggable
                            onDragEnd={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
                            pinColor="#EAB308"
                        />
                    </MapView>

                    {loading && (
                        <View className="absolute inset-0 items-center justify-center bg-black/20">
                            <Text className="text-white font-semibold">Getting location...</Text>
                        </View>
                    )}
                </View>

                {/* Coords preview + confirm */}
                <View className="bg-white px-6 py-4 border-t border-gray-100">
                    <Text className="text-gray-500 text-xs text-center mb-3">
                        📍 {markerCoord.latitude.toFixed(7)}, {markerCoord.longitude.toFixed(7)}
                    </Text>
                    <Button
                        size="lg"
                        variant="solid"
                        onPress={() =>
                            onConfirm(
                                markerCoord.latitude.toFixed(7),
                                markerCoord.longitude.toFixed(7)
                            )
                        }
                        className="h-14 bg-yellow-500 rounded-xl"
                    >
                        <ButtonText className="text-white font-bold text-base">
                            Confirm Location
                        </ButtonText>
                    </Button>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AddBusiness() {
    const navigation = useNavigation();
    const [mapModalVisible, setMapModalVisible] = useState(false);

    const {
        control, handleSubmit, setValue, watch,
        setError, formState: { errors },
    } = useForm<BusinessFormData>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            title: "", business_category: "", service_detail: "",
            phone_no: "", email: "", latitude: "", longitude: "",
        },
    });

    const { mutate: createListing, isPending } = useCreateListing();

    const latitude = watch("latitude");
    const longitude = watch("longitude");
    const serviceDetail = watch("service_detail");
    const title = watch("title");

    const handleLocationConfirm = (lat: string, lng: string) => {
        setValue("latitude", lat, { shouldValidate: true });
        setValue("longitude", lng, { shouldValidate: true });
        setMapModalVisible(false);
    };

    const onSubmit = (data: BusinessFormData) => {
        createListing(data, {
            onSuccess: () => navigation.navigate("(public)"),
            onError: (error: any) => {
                const d = error?.response?.data;
                console.error("[AddBusiness]", { status: error?.response?.status, d });

                if (d?.title) setError("title", { message: d.title[0] });
                else if (d?.business_category) setError("business_category", { message: d.business_category[0] });
                else if (d?.phone_no) setError("phone_no", { message: d.phone_no[0] });
                else if (d?.email) setError("email", { message: d.email[0] });
                else setError("root", {
                    message: d?.error || d?.detail || error?.message || "Failed to add business.",
                });
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBlock: 70 }}                >
                    <View className="px-6 pt-4 pb-8">
                        <View className="mb-6">
                            <Heading size="3xl" className="text-gray-900 font-bold mb-2">
                                Add Business
                            </Heading>
                            <Text className="text-gray-500 text-base">
                                List your business to reach more customers
                            </Text>
                        </View>

                        {errors.root?.message && (
                            <Alert action="error" variant="solid" className="mb-4 rounded-xl">
                                <AlertIcon as={AlertCircleIcon} className="text-white mr-2" />
                                <AlertText className="text-white text-sm font-medium">
                                    {errors.root.message}
                                </AlertText>
                            </Alert>
                        )}

                        <VStack space="lg">
                            <FormControl isRequired isInvalid={!!errors.title}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Title
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="title"
                                    render={({ field: { onChange, value, onBlur } }) => (
                                        <Input variant="outline" size="lg"
                                            className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                            isInvalid={!!errors.title}>
                                            <InputField
                                                placeholder="Official trading name"
                                                value={value} onChangeText={onChange} onBlur={onBlur}
                                                maxLength={100} className="text-gray-900 text-base"
                                                placeholderTextColor="#9CA3AF"
                                            />
                                        </Input>
                                    )}
                                />
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>{errors.title?.message}</FormControlErrorText>
                                </FormControlError>
                                <Text className="text-gray-400 text-xs mt-1">{title.length}/100</Text>
                            </FormControl>

                            {/* Category */}
                            <FormControl isRequired isInvalid={!!errors.business_category}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Category
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="business_category"
                                    render={({ field: { onChange, value } }) => (
                                        <CategoryPicker
                                            value={value}
                                            onChange={onChange}
                                            error={errors.business_category?.message}
                                        />
                                    )}
                                />
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>{errors.business_category?.message}</FormControlErrorText>
                                </FormControlError>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.service_detail}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Provided Service Detail
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="service_detail"
                                    render={({ field: { onChange, value } }) => (
                                        <RichTextEditor
                                            value={value} onChange={onChange}
                                            error={errors.service_detail?.message}
                                            charCount={serviceDetail.length}
                                        />
                                    )}
                                />
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>{errors.service_detail?.message}</FormControlErrorText>
                                </FormControlError>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.phone_no}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Phone Number
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="phone_no"
                                    render={({ field: { onChange, value, onBlur } }) => (
                                        <Input variant="outline" size="lg"
                                            className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                            isInvalid={!!errors.phone_no}>
                                            <InputField
                                                placeholder="+9779801122334"
                                                value={value} onChangeText={onChange} onBlur={onBlur}
                                                keyboardType="phone-pad" className="text-gray-900 text-base"
                                                placeholderTextColor="#9CA3AF"
                                            />
                                        </Input>
                                    )}
                                />
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>{errors.phone_no?.message}</FormControlErrorText>
                                </FormControlError>
                                <Text className="text-gray-400 text-xs mt-1">
                                    Format: +[country code][number]
                                </Text>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.email}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Email
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, value, onBlur } }) => (
                                        <Input variant="outline" size="lg"
                                            className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                            isInvalid={!!errors.email}>
                                            <InputField
                                                placeholder="contact@business.com"
                                                value={value} onChangeText={onChange} onBlur={onBlur}
                                                keyboardType="email-address" autoCapitalize="none"
                                                className="text-gray-900 text-base"
                                                placeholderTextColor="#9CA3AF"
                                            />
                                        </Input>
                                    )}
                                />
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
                                </FormControlError>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.latitude || !!errors.longitude}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Location
                                    </FormControlLabelText>
                                </FormControlLabel>

                                {latitude && longitude ? (
                                    <View className="rounded-xl overflow-hidden border border-yellow-400">
                                        <MapView
                                            style={{ height: 160 }}
                                            region={{
                                                latitude: parseFloat(latitude),
                                                longitude: parseFloat(longitude),
                                                latitudeDelta: 0.005,
                                                longitudeDelta: 0.005,
                                            }}
                                            scrollEnabled={false}
                                            zoomEnabled={false}
                                        >
                                            <Marker
                                                coordinate={{
                                                    latitude: parseFloat(latitude),
                                                    longitude: parseFloat(longitude),
                                                }}
                                                pinColor="#EAB308"
                                            />
                                        </MapView>
                                        <View className="bg-yellow-50 px-4 py-2 flex-row justify-between items-center">
                                            <Text className="text-gray-600 text-xs">
                                                📍 {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}
                                            </Text>
                                            <TouchableOpacity onPress={() => setMapModalVisible(true)}>
                                                <Text className="text-yellow-600 text-xs font-semibold">
                                                    Change →
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => setMapModalVisible(true)}
                                        className={`h-14 rounded-xl border px-4 bg-gray-50 flex-row items-center gap-3 ${errors.latitude ? "border-red-300" : "border-gray-200"}`}
                                    >
                                        <Text className="text-2xl">📍</Text>
                                        <Text className="text-gray-400 text-base">
                                            Tap to pin business location on map
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} />
                                    <FormControlErrorText>
                                        {errors.latitude?.message || errors.longitude?.message}
                                    </FormControlErrorText>
                                </FormControlError>
                            </FormControl>

                            <Button
                                size="lg"
                                variant="solid"
                                onPress={handleSubmit(onSubmit)}
                                disabled={isPending}
                                className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm mt-4"
                            >
                                <ButtonText className="text-white font-semibold text-base">
                                    {isPending ? "Adding Business..." : "Add Business"}
                                </ButtonText>
                            </Button>

                            <TouchableOpacity onPress={() => navigation.navigate('(public)')} className="mt-4">
                                <Text className="text-gray-500 text-base text-center">Cancel</Text>
                            </TouchableOpacity>
                        </VStack>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <LocationPickerModal
                visible={mapModalVisible}
                onConfirm={handleLocationConfirm}
                onClose={() => setMapModalVisible(false)}
            />
        </SafeAreaView>
    );
}