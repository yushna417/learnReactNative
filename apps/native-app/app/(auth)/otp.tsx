import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText } from "@/components/ui/button";
import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { CheckCircleIcon, AlertCircleIcon } from "@/components/ui/icon";
import { apiClient } from "@/api/client";

export default function OTPVerification() {
	const navigation = useNavigation();
	const route = useRoute();
	const email = route.params?.email;
	const queryClient = useQueryClient();

	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const [timer, setTimer] = useState(60);
	const [isResendEnabled, setIsResendEnabled] = useState(false);
	const [localError, setLocalError] = useState("");

	const inputRefs = useRef<TextInput[]>([]);

	useEffect(() => {
		if (timer === 0) {
			setIsResendEnabled(true);
			return;
		}
		const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
		return () => clearInterval(interval);
	}, [timer]);

	const {
		mutate: verifyOtp,
		isPending: isVerifying,
		isSuccess,
		error: verifyError,
	} = useMutation({
		mutationFn: async (otpCode: string) => {
			const sessionToken = await AsyncStorage.getItem("session_token");
			if (!sessionToken)
				throw new Error("Session expired. Please log in again. kk");

			const response = await apiClient.post("/auth/verify-otp/", {
				otp: otpCode,
				session_token: sessionToken,
			});
			return response.data;
		},
		onSuccess: () => {
			AsyncStorage.removeItem("session_token");
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

			navigation.navigate("login");
		},
		onError: (error: any) => {
			const msg =
				error?.response?.data?.error ||
				error?.response?.data?.otp?.[0] ||
				error?.message ||
				"Invalid OTP. Please try again.";
			setLocalError(msg);
		},
	});

	const { mutate: resendOtp, isPending: isResending } = useMutation({
		mutationFn: async () => {
			const response = await apiClient.post("/auth/register/", { email });
			return response.data;
		},
		onSuccess: async (data) => {
			await AsyncStorage.setItem("session_token", data.session_token);
			setOtp(["", "", "", "", "", ""]);
			setTimer(60);
			setIsResendEnabled(false);
			setLocalError("");
			inputRefs.current[0]?.focus();
		},
		onError: (error: any) => {
			const msg =
				error?.response?.data?.error ||
				"Failed to resend OTP. Please try again.";
			setLocalError(msg);
		},
	});

	const handleOtpChange = (text: string, index: number) => {
		if (text.length > 1) return;
		const newOtp = [...otp];
		newOtp[index] = text;
		setOtp(newOtp);
		setLocalError("");
		if (text && index < 5) inputRefs.current[index + 1]?.focus();
	};

	const handleKeyPress = (e: any, index: number) => {
		if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = () => {
		const otpValue = otp.join("");
		if (otpValue.length !== 6) {
			setLocalError("Please enter the complete 6-digit code");
			return;
		}
		setLocalError("");
		verifyOtp(otpValue);
	};

	const errorMessage =
		localError ||
		(verifyError as any)?.response?.data?.error ||
		(verifyError as any)?.message;

	return (
		<SafeAreaView className="flex-1 bg-white">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1 justify-center px-6">
					{/* Header */}
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
							{email}
						</Text>
					</View>

					{isSuccess && (
						<Alert action="success" variant="solid" className="mb-4 rounded-xl">
							<AlertIcon as={CheckCircleIcon} className="text-white mr-2" />
							<AlertText className="text-white text-sm font-medium">
								OTP verified successfully!
							</AlertText>
						</Alert>
					)}

					{errorMessage ? (
						<Alert action="error" variant="solid" className="mb-4 rounded-xl">
							<AlertIcon as={AlertCircleIcon} className="text-white mr-2" />
							<AlertText className="text-white text-sm font-medium">
								{errorMessage}
							</AlertText>
						</Alert>
					) : null}

					<VStack space="xl" className="mb-8">
						<View className="flex-row justify-between gap-2">
							{otp.map((digit, index) => (
								<View
									key={index}
									className={`flex-1 h-14 rounded-xl border ${
										errorMessage
											? "border-red-300 bg-red-50"
											: digit
												? "border-yellow-400 bg-yellow-50"
												: "border-gray-200 bg-gray-50"
									} items-center justify-center`}
								>
									<TextInput
										ref={(ref) => (inputRefs.current[index] = ref!)}
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
					</VStack>

					{/* Timer / Resend */}
					<View className="flex-row justify-center items-center mb-8">
						{!isResendEnabled ? (
							<Text className="text-gray-500 text-sm">
								Resend code in{" "}
								<Text className="text-yellow-600 font-semibold">
									00:{timer < 10 ? `0${timer}` : timer}
								</Text>
							</Text>
						) : (
							<TouchableOpacity
								onPress={() => resendOtp()}
								disabled={isResending}
							>
								<Text className="text-yellow-600 font-semibold text-sm">
									{isResending ? "Sending..." : "Resend Verification Code"}
								</Text>
							</TouchableOpacity>
						)}
					</View>

					<Button
						size="lg"
						variant="solid"
						onPress={handleVerify}
						disabled={isVerifying}
						className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
					>
						<ButtonText className="text-white font-semibold text-base">
							{isVerifying ? "Verifying..." : "Verify & Continue"}
						</ButtonText>
					</Button>

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
