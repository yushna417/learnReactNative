import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import {
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Alert, AlertText } from "@/components/ui/alert";
import { apiClient } from "@/api/client";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
});

type RegisterFormData = z.infer<typeof authSchema>;
type RegisterResponse = {
	message: string;
	session_token: string;
	email: string;
};

export default function SignUp() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [serverError, setServerError] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(authSchema),
		defaultValues: { email: "" },
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: RegisterFormData) => {
			const response = await apiClient.post<RegisterResponse>(
				"/auth/register/",
				data,
			);
			return response.data;
		},
		onSuccess: async (responseData) => {
			await AsyncStorage.setItem("session_token", responseData.session_token);
			queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

			navigation.navigate("otp", { email: responseData.email });
		},
		onError: (error: any) => {
			const responseData = error?.response?.data;

			if (responseData?.email) {
				setError("email", { message: responseData.email[0] });
			} else if (responseData?.error) {
				setError("email", { message: responseData.error });
			} else {
				setServerError("Registration failed. Please try again.");
			}
		},
	});

	const onSubmit = (data: RegisterFormData) => {
		setServerError(null);
		mutate(data);
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
						{/* Header */}
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

						{serverError && (
							<Alert action="error" variant="solid" className="mb-4">
								<AlertText>{serverError}</AlertText>
							</Alert>
						)}

						<VStack space="lg" className="mb-8">
							<FormControl isRequired isInvalid={!!errors.email}>
								<FormControlLabel className="mb-2">
									<FormControlLabelText className="text-gray-700 font-semibold text-sm">
										Email Address
									</FormControlLabelText>
								</FormControlLabel>
								<Controller
									control={control}
									name="email"
									render={({ field: { onChange, value, onBlur } }) => (
										<Input
											variant="outline"
											size="lg"
											className="h-14 rounded-xl border-gray-200 bg-gray-50 focus:border-yellow-400"
											isInvalid={!!errors.email}
										>
											<InputField
												placeholder="name@example.com"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												keyboardType="email-address"
												autoCapitalize="none"
												autoCorrect={false}
												className="text-gray-900 text-base"
												placeholderTextColor="#9CA3AF"
											/>
										</Input>
									)}
								/>
								<FormControlError>
									<FormControlErrorIcon
										as={AlertCircleIcon}
										className="text-red-500"
									/>
									<FormControlErrorText className="text-red-500 text-xs">
										{errors.email?.message}
									</FormControlErrorText>
								</FormControlError>
							</FormControl>
						</VStack>

						<Button
							size="lg"
							variant="solid"
							onPress={handleSubmit(onSubmit)}
							disabled={isPending || isSubmitting}
							className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
						>
							<ButtonText className="text-white font-bold text-base">
								{isPending ? "Creating Account..." : "Sign Up"}
							</ButtonText>
						</Button>

						<View className="mt-6 flex-row justify-center">
							<Text className="text-gray-600 text-sm">
								Already have an account?{" "}
							</Text>
							<TouchableOpacity onPress={() => navigation.navigate("login")}>
								<Text className="text-yellow-600 font-semibold text-sm">
									Log In
								</Text>
							</TouchableOpacity>
						</View>

						<View className="mt-8">
							<Text className="text-gray-400 text-xs text-center">
								By signing up, you agree to our
								<Text className="text-yellow-600">Terms of Service</Text> and{" "}
								<Text className="text-yellow-600">Privacy Policy</Text>
							</Text>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
