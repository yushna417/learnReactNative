import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Alert,
	ScrollView,
	StatusBar,
	Pressable,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Box } from "@/components/ui/box";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import { ButtonText, Button, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import {
	FontAwesome,
	FontAwesome6,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons";

export default function AccountScreen() {
	const { data: user, isLoading } = useAuth();
	const { mutate: logout } = useLogout();
	const router = useRouter();
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleLogout = () => {
		Alert.alert(
			"Exit ",
			"Are you sure you want to logout from Digital Yellow Paper.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Log out",
					style: "destructive",
					onPress: () => {
						logout(undefined, {
							onError: () =>
								Alert.alert("Error", "Failed to delete. Please try again."),
						});
					},
				},
			],
		);
	};

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-yellow-50 items-center justify-center">
				<ActivityIndicator size="large" color="#EAB308" />
			</SafeAreaView>
		);
	}

	if (!user) {
		return (
			<SafeAreaView className="flex-1 bg-yellow-50">
				<StatusBar barStyle="dark-content" backgroundColor="#FEF3C7" />
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					<Box className="flex-1 px-4 py-8">
						<Center className="mb-8 mt-10">
							<Box className="w-24 h-24 rounded-full bg-yellow-200 items-center justify-center border-4 border-yellow-500 mb-4">
								<AntDesign name="user" size={50} color="#EAB308" />
							</Box>
							<Heading size="2xl" className="text-gray-800 mb-2">
								Welcome!
							</Heading>
							<Text className="text-gray-500 text-base">
								Please login to continue
							</Text>
						</Center>

						<Card className="bg-white rounded-2xl p-6 shadow-sm">
							<VStack space="md">
								<Button
									className="bg-yellow-500 rounded-xl mt-4"
									onPress={() => router.push("/(auth)/login")}
									size="lg"
								>
									<ButtonText className="text-white font-semibold">
										Login
									</ButtonText>
								</Button>

								<HStack className="justify-center mt-4" space="sm">
									<Text className="text-gray-500">Don't have an account?</Text>
									<Pressable onPress={() => router.push("/(auth)/sign-up")}>
										<Text className="text-yellow-600 font-semibold">
											Sign Up
										</Text>
									</Pressable>
								</HStack>
							</VStack>
						</Card>
					</Box>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-yellow-50">
			<StatusBar barStyle="dark-content" backgroundColor="#FEFCE8" />

			<ScrollView showsVerticalScrollIndicator={false}>
				<Box className="flex-1 px-5 pt-6 pb-10">
					{/* ===== HEADER CARD ===== */}
					<Card className="bg-white rounded-3xl p-6 mb-6 shadow-md border border-yellow-100">
						<Center>
							{/* Avatar */}
							<Box className="relative mb-4">
								<Box className="absolute inset-0 bg-yellow-200 rounded-full w-28 h-28 opacity-40" />
								<Avatar
									size="2xl"
									className="bg-yellow-500 border-4 border-white shadow-lg"
								>
									<AvatarFallbackText className="text-white text-2xl font-bold">
										{user.email.charAt(0).toUpperCase()}
									</AvatarFallbackText>
								</Avatar>
							</Box>

							{/* Username */}
							<Heading className="text-gray-900 text-xl font-bold">
								{user.email.split("@")[0]}
							</Heading>

							{/* Status Badge */}
							<Badge
								className={`mt-2 px-3 py-1 rounded-full ${
									user.is_active ? "bg-emerald-100" : "bg-red-100"
								}`}
							>
								<HStack className="items-center">
									<Box
										className={`w-2 h-2 rounded-full mr-2 ${
											user.is_active ? "bg-emerald-500" : "bg-red-500"
										}`}
									/>
									<BadgeText
										className={`text-xs font-semibold ${
											user.is_active ? "text-emerald-700" : "text-red-700"
										}`}
									>
										{user.is_active ? "Active" : "Inactive"}
									</BadgeText>
								</HStack>
							</Badge>
						</Center>
					</Card>

					{/* ===== ACCOUNT INFO ===== */}
					<Card className="bg-white rounded-3xl p-5 mb-6 shadow-md border border-yellow-100">
						<VStack space="lg">
							<HStack className="items-center">
								<MaterialIcons name="account-box" size={24} color="#ca8a04" />
								<Text className="ml-2 text-gray-900 font-semibold">
									Account Info
								</Text>
							</HStack>

							<Divider className="bg-yellow-100" />

							{/* Item */}
							{[
								{
									icon: <Ionicons name="mail" size={20} color="#ca8a04" />,
									label: "Email",
									value: user.email,
								},
								{
									icon: (
										<FontAwesome6
											name="calendar-day"
											size={20}
											color="#ca8a04"
										/>
									),
									label: "Member Since",
									value: formatDate(user.created_at),
								},
							].map((item, idx) => (
								<HStack key={idx} space="md" className="items-start">
									<Box className="w-8 mt-1">{item.icon}</Box>
									<Box className="flex-1">
										<Text className="text-xs text-gray-500">{item.label}</Text>
										<Text className="text-sm font-medium text-gray-900">
											{item.value}
										</Text>
									</Box>
								</HStack>
							))}
						</VStack>
					</Card>

					{/* ===== ACCOUNT TYPE ===== */}
					<Card className="bg-white rounded-3xl p-5 mb-8 shadow-md border border-yellow-100">
						<HStack className="justify-between items-center">
							<HStack className="items-center">
								<MaterialCommunityIcons
									name="account-tag"
									size={20}
									color="#eab308"
								/>
								<Text className="ml-2 text-gray-900 font-medium">
									Account Type
								</Text>
							</HStack>

							<Badge
								className={`px-3 py-1 rounded-full ${
									user.is_staff ? "bg-yellow-200" : "bg-gray-100"
								}`}
							>
								<BadgeText
									className={`text-xs font-semibold ${
										user.is_staff ? "text-yellow-800" : "text-gray-600"
									}`}
								>
									{user.is_staff ? "Staff" : "Regular"}
								</BadgeText>
							</Badge>
						</HStack>
					</Card>

					{/* ===== LOGOUT BUTTON ===== */}
					<Button
						size="lg"
						className="rounded-2xl bg-yellow-500 active:bg-yellow-600 shadow-md"
						onPress={handleLogout}
					>
						<HStack className="items-center" space="sm">
							<AntDesign name="logout" size={18} color="white" />
							<ButtonText className="text-white font-semibold">
								Logout
							</ButtonText>
						</HStack>
					</Button>
				</Box>
			</ScrollView>
		</SafeAreaView>
	);
}
