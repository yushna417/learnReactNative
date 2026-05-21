import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function OTPVerification() {
    const navigation = useNavigation();
    // const { email } = route.params.email;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const inputRefs = useRef([]);

    useEffect(() => {
        let interval;
        if (timer > 0 && !isResendEnabled) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsResendEnabled(true);
        }

        return () => clearInterval(interval);
    }, [timer, isResendEnabled]);

    const handleOtpChange = (text, index) => {
        if (text.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setError("Please enter the complete 6-digit code");
            return;
        }

        setError("");
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // For demo, accept any 6-digit code
            if (otpValue.length === 6) {
                console.log("OTP Verified successfully");
                Alert.alert(
                    "Success",
                    "OTP verified successfully!",
                    [
                        {
                            text: "Continue",
                            onPress: () => navigation.navigate("tabs") // Navigate to your main app
                        }
                    ]
                );
            } else {
                setError("Invalid OTP. Please try again.");
            }
        }, 1500);
    };

    const handleResendOTP = () => {
        setIsResendEnabled(false);
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0].focus();

        // Simulate resending OTP
        // console.log("Resending OTP to:", email);
        // Alert.alert("OTP Sent", `A new verification code has been sent to ${email}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6">
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-yellow-100 rounded-2xl items-center justify-center mb-4 shadow-sm">
                            <View className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center">
                                <Text className="text-white text-2xl font-bold">✓</Text>
                            </View>
                        </View>
                        <Heading size="3xl" className="text-gray-900 font-bold mb-2">
                            Verify OTP
                        </Heading>
                        <Text className="text-gray-500 text-base text-center">
                            Enter the 6-digit verification code sent to
                        </Text>
                        <Text className="text-yellow-600 font-semibold text-base mt-1">
                            {/* {email} */}
                        </Text>
                    </View>

                    {/* OTP Input Fields */}
                    <VStack space="xl" className="mb-8">
                        <View className="flex-row justify-between gap-2">
                            {otp.map((digit, index) => (
                                <View
                                    key={index}
                                    className={`flex-1 h-14 rounded-xl border ${error
                                        ? "border-red-300 bg-red-50"
                                        : digit
                                            ? "border-yellow-400 bg-yellow-50"
                                            : "border-gray-200 bg-gray-50"
                                        } items-center justify-center`}
                                >
                                    <TextInput
                                        ref={(ref) => (inputRefs.current[index] = ref)}
                                        className="text-2xl font-bold text-gray-900 text-center"
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        selectTextOnFocus
                                        placeholder="•"
                                        placeholderTextColor="#D1D5DB"
                                    />
                                </View>
                            ))}
                        </View>

                        {error ? (
                            <View className="bg-red-50 rounded-xl p-3">
                                <Text className="text-red-500 text-xs text-center">
                                    {error}
                                </Text>
                            </View>
                        ) : null}
                    </VStack>

                    <View className="flex-row justify-center items-center mb-8">
                        {!isResendEnabled ? (
                            <Text className="text-gray-500 text-sm">
                                Resend code in
                                <Text className="text-yellow-600 font-semibold">
                                    00:{timer < 10 ? `0${timer}` : timer}
                                </Text>
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResendOTP}>
                                <Text className="text-yellow-600 font-semibold text-sm">
                                    Resend Verification Code
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Verify Button */}
                    <Button
                        size="lg"
                        variant="solid"
                        onPress={handleVerifyOTP}
                        disabled={isLoading}
                        className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
                    >
                        <ButtonText className="text-white font-semibold text-base">
                            {isLoading ? "Verifying..." : "Verify & Continue"}
                        </ButtonText>
                    </Button>

                    {/* Back to Login */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("login")}
                        className="mt-6"
                    >
                        <Text className="text-gray-500 text-sm text-center">
                            ← Back to Login
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-8 bg-gray-50 rounded-xl p-4">
                        <Text className="text-gray-500 text-xs text-center">
                            Didn't receive the code? Check your spam folder or{" "}
                            <Text className="text-yellow-600">contact support</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}