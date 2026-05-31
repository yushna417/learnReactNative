import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme.web";

export default function HomeScreen() {
	const systemColorScheme = useColorScheme();
	const router = useRouter();

	useEffect(() => {
		const timer = setTimeout(() => {
			router.replace("/(public)/home");
		}, 5000); // 2.5 seconds

		return () => clearTimeout(timer);
	}, []);

	return (
		<View className="flex-1 flex flex-row items-center justify-center px-6">
			<Image
				source={{
					uri: "https://icons.veryicon.com/png/o/miscellaneous/small-yellow-icon/search-361.png",
				}}
				style={{ width: 120, height: 120, resizeMode: "contain" }}
			/>
			<View className="flex flex-col items-start">
				<Text
					style={styles.baseText}
					className="text-4xl font-bold font-roboto"
				>
					Digital
				</Text>
				<Text
					style={styles.baseText}
					className="text-yellow-500 text-5xl font-black font-jakarta"
				>
					{" "}
					Yellow Page
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	baseText: {
		fontWeight: "900",
	},
});
