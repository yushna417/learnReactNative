export {
  ErrorBoundary,
} from 'expo-router';
import { Stack } from 'expo-router';

export type RootStackParamList = {
  login: undefined;
  otp: { email: string };
  tabs: undefined;
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="otp" options={{ headerShown: false }} />
    </Stack>
  );
}
