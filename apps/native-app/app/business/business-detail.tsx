import React, { useState } from "react";
import {
    View, Text, TouchableOpacity, ScrollView,
    Linking, Modal, ActivityIndicator, TextInput as RNTextInput, Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import {
    FormControl, FormControlError, FormControlErrorIcon,
    FormControlErrorText, FormControlLabel, FormControlLabelText
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Alert as GlueAlert, AlertText, AlertIcon } from "@/components/ui/alert";
import { useListingDetail, useUpdateListing, useDeleteListing } from "@/hooks/useBusinessListings";
import { FontAwesome5, Entypo, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
    "Electronics Repair", "Restaurant", "Technology", "Healthcare",
    "Retail", "Hospitality", "Transportation", "Education",
    "Construction", "Real Estate", "Entertainment", "Professional Services", "Other",
];

const editSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    business_category: z.string().min(1, "Category is required"),
    service_detail: z.string().min(1, "Service detail is required").max(2000),
    phone_no: z.string().regex(/^\+[1-9]\d{1,14}$/, "Use E.164 format e.g. +9779801122334"),
    email: z.string().email("Enter a valid email"),
});

type EditFormData = z.infer<typeof editSchema>;

const CategoryPicker = ({ value, onChange, error }: {
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
                    activeOpacity={1} onPress={() => setOpen(false)}
                >
                    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-10">
                        <View className="p-4 border-b border-gray-100">
                            <Text className="text-gray-900 font-bold text-lg text-center">Category</Text>
                        </View>
                        <ScrollView className="max-h-80">
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity key={cat}
                                    onPress={() => { onChange(cat); setOpen(false); }}
                                    className={`px-6 py-4 border-b border-gray-50 ${value === cat ? "bg-yellow-50" : ""}`}>
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

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ visible, business, onClose, id }: {
    visible: boolean; business: any; onClose: () => void; id: number;
}) => {
    const { mutate: updateListing, isPending, error: updateError } = useUpdateListing(id);

    const { control, handleSubmit, setError, formState: { errors } } = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            title: business?.title ?? "",
            business_category: business?.business_category ?? "",
            service_detail: business?.service_detail ?? "",
            phone_no: business?.phone_no ?? "",
            email: business?.email ?? "",
        },
    });

    const onSubmit = (data: EditFormData) => {
        updateListing(data, {
            onSuccess: () => onClose(),
            onError: (error: any) => {
                const d = error?.response?.data;
                if (d?.title) setError("title", { message: d.title[0] });
                else if (d?.email) setError("email", { message: d.email[0] });
                else if (d?.phone_no) setError("phone_no", { message: d.phone_no[0] });
                else setError("root", { message: d?.error || d?.detail || "Update failed." });
            },
        });
    };

    return (
        <Modal visible={visible} animationType="slide">
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose} className="mr-4">
                        <Text className="text-gray-500 text-base">✕ Cancel</Text>
                    </TouchableOpacity>
                    <Text className="flex-1 text-gray-900 font-bold text-base text-center">
                        Edit Business
                    </Text>
                    <View style={{ width: 70 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {errors.root?.message && (
                        <GlueAlert action="error" variant="solid" className="mb-4 rounded-xl">
                            <AlertIcon as={AlertCircleIcon} className="text-white mr-2" />
                            <AlertText className="text-white text-sm">{errors.root.message}</AlertText>
                        </GlueAlert>
                    )}

                    <VStack space="lg">
                        {/* Title */}
                        <FormControl isRequired isInvalid={!!errors.title}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Business Title
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Controller control={control} name="title"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <Input variant="outline" size="lg"
                                        className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                        isInvalid={!!errors.title}>
                                        <InputField value={value} onChangeText={onChange} onBlur={onBlur}
                                            placeholder="Business title" className="text-gray-900 text-base"
                                            placeholderTextColor="#9CA3AF" />
                                    </Input>
                                )} />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.title?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        {/* Category */}
                        <FormControl isRequired isInvalid={!!errors.business_category}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Category
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Controller control={control} name="business_category"
                                render={({ field: { onChange, value } }) => (
                                    <CategoryPicker value={value} onChange={onChange}
                                        error={errors.business_category?.message} />
                                )} />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.business_category?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        {/* Service Detail */}
                        <FormControl isRequired isInvalid={!!errors.service_detail}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Service Detail
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Controller control={control} name="service_detail"
                                render={({ field: { onChange, value } }) => (
                                    <View className={`border rounded-xl bg-gray-50 ${errors.service_detail ? "border-red-300" : "border-gray-200"}`}>
                                        <RNTextInput
                                            className="p-4 text-gray-900 min-h-[120px] text-base"
                                            multiline numberOfLines={6} textAlignVertical="top"
                                            value={value} onChangeText={onChange}
                                            placeholder="Describe your services..."
                                            placeholderTextColor="#9CA3AF" maxLength={2000}
                                        />
                                    </View>
                                )} />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.service_detail?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        {/* Phone */}
                        <FormControl isRequired isInvalid={!!errors.phone_no}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Phone Number
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Controller control={control} name="phone_no"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <Input variant="outline" size="lg"
                                        className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                        isInvalid={!!errors.phone_no}>
                                        <InputField value={value} onChangeText={onChange} onBlur={onBlur}
                                            placeholder="+9779801122334" keyboardType="phone-pad"
                                            className="text-gray-900 text-base" placeholderTextColor="#9CA3AF" />
                                    </Input>
                                )} />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.phone_no?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        {/* Email */}
                        <FormControl isRequired isInvalid={!!errors.email}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Business Email
                                </FormControlLabelText>
                            </FormControlLabel>
                            <Controller control={control} name="email"
                                render={({ field: { onChange, value, onBlur } }) => (
                                    <Input variant="outline" size="lg"
                                        className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                        isInvalid={!!errors.email}>
                                        <InputField value={value} onChangeText={onChange} onBlur={onBlur}
                                            placeholder="contact@business.com" keyboardType="email-address"
                                            autoCapitalize="none" className="text-gray-900 text-base"
                                            placeholderTextColor="#9CA3AF" />
                                    </Input>
                                )} />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <Button size="lg" variant="solid" onPress={handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl mt-2">
                            <ButtonText className="text-white font-bold text-base">
                                {isPending ? "Saving..." : "Save Changes"}
                            </ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default function BusinessDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { businessId } = route.params as { businessId: number };

    const [editVisible, setEditVisible] = useState(false);
    const { data: user } = useAuth();
    const { data: business, isLoading, isError, refetch } = useListingDetail(businessId);
    const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

    const handleDelete = () => {
        Alert.alert(
            "Delete Business",
            "Are you sure you want to delete this listing? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteListing(businessId, {
                            onSuccess: () => navigation.goBack(),
                            onError: () =>
                                Alert.alert("Error", "Failed to delete. Please try again."),
                        });
                    },
                },
            ]
        );
    };

    const openGoogleMaps = () => {
        if (!business?.latitude || !business?.longitude) return;
        const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;
        Linking.openURL(url);
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#EAB308" />
                <Text className="text-gray-400 mt-3">Loading business...</Text>
            </SafeAreaView>
        );
    }

    if (isError || !business) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
                <MaterialIcons name="running-with-errors" size={24} color="black" />
                <Text className="text-gray-700 font-semibold text-lg mb-2">Failed to load</Text>
                <TouchableOpacity onPress={() => refetch()} className="px-6 py-3 bg-yellow-500 rounded-xl">
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const hasCoords = !!business.latitude && !!business.longitude;
    const lat = parseFloat(business.latitude);
    const lng = parseFloat(business.longitude);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBlock: 40 }}>
                <View className="flex-row items-center justify-between px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()}
                        className="px-3 py-1 bg-gray-100 rounded-full items-center gap-3 flex-row">
                        <Ionicons name="arrow-back-sharp" size={24} color="black" />
                        <Text className="text-gray-600 text-lg">Back</Text>
                    </TouchableOpacity>
                    {user &&
                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => setEditVisible(true)}
                                className="w-10 h-10  rounded-full items-center justify-center">
                                <FontAwesome5 name="pen" size={20} color="#a16207" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} disabled={isDeleting}
                                className="w-10 h-10 rounded-full items-center justify-center">
                                {isDeleting
                                    ? <ActivityIndicator size="small" color="#EF4444" />
                                    : <FontAwesome5 name="trash" size={20} color="#EF4444" />
                                }
                            </TouchableOpacity>
                        </View>
                    }
                </View>

                <View className="px-6 pt-6">
                    <View className="flex-row mb-4">
                        <View className="bg-yellow-100 px-3 py-1 rounded-full">
                            <Text className="text-yellow-700 text-sm font-semibold">
                                {business.business_category}
                            </Text>
                        </View>
                    </View>

                    <Heading size="2xl" className="text-gray-900 font-bold mb-4">
                        {business.title}
                    </Heading>

                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <Text className="text-gray-600 text-base leading-6">
                            {business.service_detail}
                        </Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <Text className="text-gray-700 font-semibold text-sm mb-3">Contact</Text>

                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${business.phone_no}`)}
                            className="flex-row items-center mb-3"
                        >
                            <View className="w-9 h-9 rounded-full items-center justify-center mr-3">
                                <FontAwesome5 name="phone-alt" size={20} color="#ca8a04" />
                            </View>
                            <Text className="text-yellow-600 font-medium text-base">
                                {business.phone_no}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => Linking.openURL(`mailto:${business.email}`)}
                            className="flex-row items-center"
                        >
                            <View className="w-9 h-9 rounded-full items-center justify-center mr-3">
                                <Entypo name="mail" size={20} color="#ca8a04" />
                            </View>
                            <Text className="text-yellow-600 font-medium text-base">
                                {business.email}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {hasCoords && (
                        <View className="mb-6">
                            <Text className="text-gray-700 font-semibold text-sm mb-3">Location</Text>
                            <View className="rounded-xl overflow-hidden border border-gray-200">
                                <MapView
                                    style={{ height: 200 }}
                                    region={{ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                >
                                    <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor="#EAB308" />
                                </MapView>
                            </View>
                            <TouchableOpacity
                                onPress={openGoogleMaps}
                                className="mt-3 flex-row items-center justify-center bg-yellow-50 border border-yellow-200 rounded-xl py-3 gap-4"
                            >
                                <FontAwesome5 name="route" size={24} color="#a16207" />
                                <Text className="text-yellow-700 font-semibold text-sm">
                                    Open in Google Maps
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            <EditModal
                visible={editVisible}
                business={business}
                onClose={() => setEditVisible(false)}
                id={businessId}
            />
        </SafeAreaView>
    );
}