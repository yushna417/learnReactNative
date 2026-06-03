
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
				"projectId": "98028cd3-07ad-4c5e-bf03-3d0fd768ba73",
				"projectRoot": "apps/native-app"
			}
		},
		"owner": "konnectcraft-org",
		"runtimeVersion": {
			"policy": "appVersion"
		},
		"updates": {
			"url": "https://u.expo.dev/98028cd3-07ad-4c5e-bf03-3d0fd768ba73"
		}
	}
}