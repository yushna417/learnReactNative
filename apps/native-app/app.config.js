
export default {
	expo: {
		name: "Digital Yellow Paper",
		slug: "learn-react-native",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "starterkitexpo",
		userInterfaceStyle: "automatic",

		ios: {
			supportsTablet: true,
			config: {
				googleMapsApiKey: process.env.GOOGLE_API_KEY,
			},
		},

		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			package: "com.yushna417sorganization.learnreactnative",
			permissions: [
				"android.permission.ACCESS_COARSE_LOCATION",
				"android.permission.ACCESS_FINE_LOCATION",
			],
			config: {
				googleMaps: {
					apiKey: process.env.GOOGLE_API_KEY,
				},
			},
		},

		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/icon.png",
		},

		plugins: [
			"expo-router",
			"expo-web-browser",
			"expo-font",
			[
				"expo-location",
				{
					locationWhenInUsePermission: "Allow the app to access your location.",
				},
			],
		],
		"experiments": {
			"typedRoutes": true
		},
		"extra": {
			"router": {},
			"eas": {
				"projectId": "9766bf12-7e0a-4d50-8c03-e7be8d388dd5",
				"projectRoot": "apps/native-app"
			}
		},
		"owner": "yushna417s-organization",
		"runtimeVersion": {
			"policy": "appVersion"
		},
		"updates": {
			"url": "https://u.expo.dev/9766bf12-7e0a-4d50-8c03-e7be8d388dd5"
		}
	}
}