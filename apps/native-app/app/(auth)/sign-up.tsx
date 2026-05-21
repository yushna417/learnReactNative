import React, { useState } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertCircleIcon, UserIcon, MailIcon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { useNavigation } from "@react-navigation/native";

export default function SignUp() {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Registering user:", { name, email });
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 px-6 pt-12 pb-8">
                        {/* Header Section */}
                        <View className="mb-10">
                            <View className="w-16 h-16 bg-yellow-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                                <View className="w-8 h-8 bg-yellow-500 rounded-lg" />
                            </View>
                            <Heading size="3xl" className="text-gray-900 font-bold mb-2">
                                Create Account
                            </Heading>
                            <Text className="text-gray-500 text-base">
                                Sign up to get started with your journey
                            </Text>
                        </View>

                        <VStack space="lg" className="mb-8">
                            <FormControl isRequired isInvalid={!!error && email && !email.includes("@")}>
                                <FormControlLabel className="mb-2">
                                    <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                        Email Address
                                    </FormControlLabelText>
                                </FormControlLabel>
                                <Input
                                    variant="outline"
                                    size="lg"
                                    className="h-14 rounded-xl border-gray-200 bg-gray-50 focus:border-yellow-400"
                                >
                                    <InputField
                                        placeholder="name@example.com"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        className="text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </Input>
                            </FormControl>

                            {error ? (
                                <FormControl isInvalid={true}>
                                    <FormControlError>
                                        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
                                        <FormControlErrorText className="text-red-500 text-xs">
                                            {error}
                                        </FormControlErrorText>
                                    </FormControlError>
                                </FormControl>
                            ) : null}
                        </VStack>

                        <Button
                            size="lg"
                            variant="solid"
                            onPress={() =>
                                navigation.navigate('otp', { email: {email} })
                            }
                            disabled={isLoading}
                            className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
                        >
                            <ButtonText className="text-white font-bold text-base">
                                {isLoading ? "Sending OTP..." : "Send OTP"}
                            </ButtonText>
                        </Button>

                        {/* Login Link */}
                        <View className="mt-6 flex-row justify-center">
                            <Text className="text-gray-600 text-sm">
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('login')}>
                                <Text className="text-yellow-600 font-semibold text-sm">
                                    Log In
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms and Conditions */}
                        <View className="mt-8">
                            <Text className="text-gray-400 text-xs text-center">
                                By signing up, you agree to our{" "}
                                <Text className="text-yellow-600">Terms of Service</Text>{" "}
                                and{" "}
                                <Text className="text-yellow-600">Privacy Policy</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}