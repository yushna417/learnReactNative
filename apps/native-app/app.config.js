
export default {
	expo: {
		name: "Digital Yellow Paper",
		slug: "digital-yellow-paper",
		version: "1.0.1",
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
			package: "com.konnectcraft.freshstart",
			googleServicesFile: "./google-services.json",
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
				"projectId": "c4ba2b6c-7ff4-44cc-8ec2-7db713697fdd",
				"projectRoot": "apps/native-app"
			}
		},
		"owner": "yushna417s-organization",
		"runtimeVersion": {
			"policy": "appVersion"
		},
		"updates": {
			"url": "https://u.expo.dev/c4ba2b6c-7ff4-44cc-8ec2-7db713697fdd"
		}
	}
}