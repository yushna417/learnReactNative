import React, { useState } from "react";
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertCircleIcon, MailIcon } from "@/components/ui/icon";
import { HStack } from "@/components/ui/hstack";
import { useNavigation } from "expo-router";

export default function Login() {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log("Sending OTP to:", email);
        }, 1500);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6">
                    {/* Logo and Header */}
                    <View className="items-center mb-12">
                        <View className="w-20 h-20 bg-yellow-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                            <Image
                                source={{
                                    uri: "https://icons.veryicon.com/png/o/miscellaneous/small-yellow-icon/search-361.png",
                                }}
                                style={{ width: 50, height: 50, resizeMode: "contain" }}
                            />
                        </View>
                        <Heading size="3xl" className="text-gray-900 font-bold mb-2">
                            Welcome Back
                        </Heading>
                        <Text className="text-gray-500 text-base text-center">
                            Enter your email to receive a one-time password
                        </Text>
                    </View>

                    {/* Form */}
                    <VStack space="xl" className="mb-8">
                        <FormControl isRequired isInvalid={!!error}>
                            <FormControlLabel className="mb-2">
                                <FormControlLabelText className="text-gray-700 font-semibold text-sm">
                                    Email Address
                                </FormControlLabelText>
                            </FormControlLabel>

                            <Input
                                variant="outline"
                                size="lg"
                                className="h-14 rounded-xl border-gray-200 bg-gray-50 focus:border-yellow-400 transition-all"
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

                            {error ? (
                                <FormControlError>
                                    <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
                                    <FormControlErrorText className="text-red-500 text-xs">
                                        {error}
                                    </FormControlErrorText>
                                </FormControlError>
                            ) : null}
                        </FormControl>
                    </VStack>

                    {/* Login Button */}
                    <Button
                        size="lg"
                        variant="solid"
                        onPress={handleSendOTP}
                        disabled={isLoading}
                        className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
                    >
                        <ButtonText className="text-white font-semibold text-base">
                            {isLoading ? "Sending..." : "Continue with Email"}
                        </ButtonText>
                    </Button>

                    {/* Sign Up Link */}
                    <View className="mt-6 flex-row justify-center">
                        <Text className="text-gray-600 text-sm">
                            Don't have an account?{" "}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('sign-up')}>
                            <Text className="text-yellow-600 font-semibold text-sm">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className="flex-row items-center mt-8">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="mx-4 text-gray-400 text-xs">OR</Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>

                    {/* Demo Account Note */}
                    <View className="mt-6 bg-gray-50 rounded-xl p-4">
                        <Text className="text-gray-500 text-xs text-center">
                            Demo: any valid email works
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}