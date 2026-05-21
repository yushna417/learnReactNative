import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput as RNTextInput,
    Alert,
    Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import * as DocumentPicker from 'expo-document-picker';

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertCircleIcon, PhoneIcon, MailIcon, LinkIcon, } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { useNavigation } from "@react-navigation/native";

// Rich Text Editor Component (Simplified)
const RichTextEditor = ({ value, onChange, error }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={`border rounded-xl bg-gray-50 ${error ? 'border-red-300' : isFocused ? 'border-yellow-400' : 'border-gray-200'}`}>

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
            />
            <View className="p-2 border-t border-gray-200">
                <Text className="text-right text-gray-400 text-xs">
                    {value.length}/2000 characters
                </Text>
            </View>
        </View>
    );
};





export default function AddBusiness() {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Form Fields
    const [businessTitle, setBusinessTitle] = useState("");
    const [serviceDetail, setServiceDetail] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [email, setEmail] = useState("");
    const [locationLink, setLocationLink] = useState("");
    const [website, setWebsite] = useState("");
    const [category, setCategory] = useState("");
    const [businessImages, setBusinessImages] = useState([]);

    // Categories
    const categories = [
        "Restaurant", "Retail", "Healthcare", "Education",
        "Technology", "Construction", "Real Estate", "Transportation",
        "Hospitality", "Entertainment", "Professional Services", "Other"
    ];

    const validatePhoneNumber = (phone) => {
        // E.164 format validation: + followed by 1-15 digits
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phone);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!businessTitle.trim()) {
            newErrors.businessTitle = "Business title is required";
        } else if (businessTitle.length > 100) {
            newErrors.businessTitle = "Business title must be less than 100 characters";
        }

        if (!serviceDetail.trim()) {
            newErrors.serviceDetail = "Service details are required";
        } else if (serviceDetail.length > 2000) {
            newErrors.serviceDetail = "Service details must be less than 2000 characters";
        }

        if (!phoneNo.trim()) {
            newErrors.phoneNo = "Phone number is required";
        } else if (!validatePhoneNumber(phoneNo)) {
            newErrors.phoneNo = "Please enter a valid phone number in E.164 format (e.g., +1234567890)";
        }

        if (!email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!email.includes("@") || !email.includes(".")) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!locationLink.trim()) {
            newErrors.locationLink = "Location link is required";
        } else if (!locationLink.includes("google.com/maps") && !locationLink.includes("goo.gl/maps")) {
            newErrors.locationLink = "Please enter a valid Google Maps link";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert("Validation Error", "Please check all fields and try again.");
            return;
        }

        setIsLoading(true);

        // Prepare form data
        const formData = {
            businessTitle,
            serviceDetail,
            phoneNo,
            email,
            locationLink,
            createdAt: new Date().toISOString()
        };

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Business Data:", formData);
            Alert.alert(
                "Success",
                "Business has been added successfully!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        }, 1500);
    };

    const openMapPreview = () => {
        if (locationLink && locationLink.includes("http")) {
            Linking.openURL(locationLink);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 30 }}
                >
                    <View className="px-6 pt-4 pb-8">
                        {/* Header */}
                        <View className="mb-6">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="mb-4"
                            >
                                <Text className="text-gray-500 text-base">← Back</Text>
                            </TouchableOpacity>
                            <View className="w-16 h-16 bg-yellow-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                                <AlertCircleIcon size={32} color="#EAB308" />
                            </View>
                            <Heading size="3xl" className="text-gray-900 font-bold mb-2">
                                Add Business
                            </Heading>
                            <Text className="text-gray-500 text-base">
                                List your business to reach more customers
                            </Text>
                        </View>

                        <VStack space="lg">
                            <FormControl isRequired isInvalid={!!errors.businessTitle}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Title
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                >
                                    <InputField
                                        placeholder="Official trading name"
                                        value={businessTitle}
                                        onChangeText={setBusinessTitle}
                                        maxLength={100}
                                        className="text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Input>
                                {errors.businessTitle && (
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} />
                                        <FormControlErrorText>{errors.businessTitle}</FormControlErrorText>
                                    </FormControlError>
                                )}
                                <Text className="text-gray-400 text-xs mt-1">
                                    {businessTitle.length}/100 characters
                                </Text>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.serviceDetail}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Provided Service Detail
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <RichTextEditor
                                    value={serviceDetail}
                                    onChange={setServiceDetail}
                                    error={errors.serviceDetail}
                                />
                                {errors.serviceDetail && (
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} />
                                        <FormControlErrorText>{errors.serviceDetail}</FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.phoneNo}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Phone Number
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                >
                                    <InputField
                                        placeholder="+1234567890"
                                        value={phoneNo}
                                        onChangeText={setPhoneNo}
                                        keyboardType="phone-pad"
                                        className="text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Input>
                                {errors.phoneNo && (
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} />
                                        <FormControlErrorText>{errors.phoneNo}</FormControlErrorText>
                                    </FormControlError>
                                )}
                                <Text className="text-gray-400 text-xs mt-1">
                                    Format: +[country code][number] (e.g., +14155552671)
                                </Text>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.email}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Business Email
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                >
                                    <InputField
                                        placeholder="contact@business.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Input>
                                {errors.email && (
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} />
                                        <FormControlErrorText>{errors.email}</FormControlErrorText>
                                    </FormControlError>
                                )}
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.locationLink}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Location Link
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50"
                                >
                                    <InputField
                                        placeholder="https://maps.google.com/..."
                                        value={locationLink}
                                        onChangeText={setLocationLink}
                                        autoCapitalize="none"
                                        className="text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Input>
                                {errors.locationLink && (
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} />
                                        <FormControlErrorText>{errors.locationLink}</FormControlErrorText>
                                    </FormControlError>
                                )}
                                {locationLink && locationLink.includes("http") && (
                                    <TouchableOpacity onPress={openMapPreview} className="mt-2">
                                        <Text className="text-yellow-600 text-sm">Preview Location →</Text>
                                    </TouchableOpacity>
                                )}
                            </FormControl>

                            <Button
                                size="lg"
                                variant="solid"
                                onPress={handleSubmit}
                                disabled={isLoading}
                                className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm mt-4"
                            >
                                <ButtonText className="text-white font-semibold text-base">
                                    {isLoading ? "Adding Business..." : "Add Business"}
                                </ButtonText>
                            </Button>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="mt-4"
                            >
                                <Text className="text-gray-500 text-base text-center">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </VStack>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}