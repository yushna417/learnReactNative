import React from "react";
import {
	View,
	Text,
	Image,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import z from "zod";

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
import { Alert, AlertText, AlertIcon } from "@/components/ui/alert";
import { CheckCircleIcon } from "@/components/ui/icon";
import { apiClient } from "@/api/client";
import { authSchema } from "./sign-up";

type LoginFormData = z.infer<typeof authSchema>;

export default function Login() {
	const navigation = useNavigation<any>();
	const queryClient = useQueryClient();

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(authSchema),
		defaultValues: { email: "" },
	});

	const { mutate, isPending, isSuccess, data } = useMutation({
		mutationFn: async (formData: LoginFormData) => {
			const response = await apiClient.post("/auth/login/", formData);
			return response.data;
		},
		onSuccess: async (data) => {
			if (data.access_token) {
				apiClient.defaults.headers.common["Authorization"] =
					`Bearer ${data.access_token}`;
				await AsyncStorage.setItem("access_token", data.access_token);
			}
			if (data.refresh_token) {
				await AsyncStorage.setItem("refresh_token", data.refresh_token);
			}
			await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
			navigation.navigate("business");
		},
		onError: (error) => {
			setError("email", { message: error.message });
		},
	});

	const onSubmit = (data: LoginFormData) => {
		mutate(data);
	};

	return (
		<SafeAreaView className="flex-1 bg-white">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1 justify-center px-6">
					{/* Header */}
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
							Enter your email to sign in to your account
						</Text>
					</View>

					{isSuccess && data?.message && (
						<Alert action="success" variant="solid" className="mb-4 rounded-xl">
							<AlertIcon as={CheckCircleIcon} className="text-white mr-2" />
							<AlertText className="text-white text-sm font-medium">
								{data.message}
							</AlertText>
						</Alert>
					)}

					{/* Form */}
					<VStack space="xl" className="mb-8">
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
						disabled={isPending}
						className="h-14 bg-yellow-500 active:bg-yellow-600 rounded-xl shadow-sm"
					>
						<ButtonText className="text-white font-semibold text-base">
							{isPending ? "Logging In..." : "Login"}
						</ButtonText>
					</Button>

					<View className="flex-row items-center mt-8">
						<View className="flex-1 h-px bg-gray-200" />
						<Text className="mx-4 text-gray-400 text-xs">OR</Text>
						<View className="flex-1 h-px bg-gray-200" />
					</View>

					<View className="mt-6 flex-row justify-center">
						<Text className="text-gray-600 text-sm">
							Don't have an account?{" "}
						</Text>
						<TouchableOpacity onPress={() => navigation.navigate("sign-up")}>
							<Text className="text-yellow-600 font-semibold text-sm">
								Sign Up
							</Text>
						</TouchableOpacity>
					</View>




				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
