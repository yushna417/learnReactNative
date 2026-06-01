import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme.web";

export default function HomeScreen() {
	const router = useRouter();
	const systemColorScheme = useColorScheme();

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/(public)/home");
		}, 3000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<View className="flex-1 bg-white items-center justify-center px-6">
			{/* Logo / Illustration */}
			<Image
				source={require("../assets/images/welcome.png")}
				className="w-full h-64 mb-6"
				resizeMode="contain"
			/>

			<View className="items-center">
				<Text className="text-3xl font-bold text-gray-800">
					Welcome to
				</Text>

				<Text className="text-5xl font-extrabold text-yellow-500 mt-2">
					Digital Yellow Page
				</Text>

				<Text className="text-gray-500 mt-3 text-center">
					Discover businesses, services & more in one place
				</Text>
			</View>

			{/* Footer dot animation style feel */}
			<View className="mt-10 flex-row space-x-3">
				<View className="w-2 h-2 bg-yellow-400 rounded-full" />
				<View className="w-2 h-2 bg-yellow-300 rounded-full" />
				<View className="w-2 h-2 bg-yellow-500 rounded-full" />
			</View>
		</View>
	);
}