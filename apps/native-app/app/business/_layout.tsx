export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

import { Stack } from "expo-router";

export default function AppLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="business-detail" options={{ headerShown: false }} />
		</Stack>
	);
}
