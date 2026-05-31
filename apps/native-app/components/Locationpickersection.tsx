import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Keyboard,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SearchState, Action } from "@/hooks/Usebusinesssearch";

interface LocationPickerSectionProps {
	state: SearchState;
	dispatch: React.Dispatch<Action>;
	onRequestGPS: () => Promise<boolean>;
	onGeocodeAddress: (address: string) => Promise<boolean>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LocationPickerSection({
	state,
	dispatch,
	onRequestGPS,
	onGeocodeAddress,
}: LocationPickerSectionProps) {
	const [addressInput, setAddressInput] = useState("");
	const [showAddressInput, setShowAddressInput] = useState(false);

	const hasLocation = state.userLat !== null && state.userLon !== null;

	const handleGPS = async () => {
		const ok = await onRequestGPS();
		if (ok) setShowAddressInput(false);
	};

	const handleSearch = async () => {
		if (!addressInput.trim()) return;
		Keyboard.dismiss();
		const ok = await onGeocodeAddress(addressInput);
		if (ok) {
			setShowAddressInput(false);
			setAddressInput("");
		}
	};

	const handleClear = () => {
		dispatch({ type: "CLEAR_LOCATION" });
		setAddressInput("");
		setShowAddressInput(false);
	};

	return (
		<View>
			<View className="flex-row items-center justify-between mb-3">
				<Text className="text-gray-900 font-semibold text-base">
					Search Location
				</Text>
				{hasLocation && (
					<TouchableOpacity onPress={handleClear}>
						<Text className="text-red-500 text-xs font-medium">Clear</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* ── Active location card ──────────────────────────────────────── */}
			{hasLocation ? (
				<View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3">
					<View className="flex-row items-start gap-3">
						<View className="w-9 h-9 bg-green-500 rounded-full items-center justify-center mt-0.5">
							<Ionicons name="location" size={18} color="white" />
						</View>
						<View className="flex-1">
							<Text
								className="text-green-800 font-semibold text-sm"
								numberOfLines={1}
							>
								{state.locationLabel ?? "Location set"}
							</Text>
							<Text className="text-green-600 text-xs mt-0.5">
								{state.userLat!.toFixed(5)}, {state.userLon!.toFixed(5)}
							</Text>
						</View>
						{/* Allow changing location */}
						<TouchableOpacity
							onPress={() => setShowAddressInput(true)}
							className="bg-green-100 px-3 py-1 rounded-full"
						>
							<Text className="text-green-700 text-xs font-medium">Change</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : null}

			{/* ── Picker buttons (shown when no location OR changing) ────────── */}
			{(!hasLocation || showAddressInput) && (
				<View className="gap-3">
					{/* GPS button */}
					<TouchableOpacity
						onPress={handleGPS}
						disabled={state.locationLoading}
						className={`flex-row items-center gap-3 p-4 rounded-2xl border-2 ${
							state.locationLoading
								? "border-gray-200 bg-gray-50"
								: "border-yellow-400 bg-yellow-50 active:bg-yellow-100"
						}`}
					>
						{state.locationLoading ? (
							<ActivityIndicator size="small" color="#EAB308" />
						) : (
							<View className="w-9 h-9 bg-yellow-500 rounded-full items-center justify-center">
								<Ionicons name="navigate" size={18} color="white" />
							</View>
						)}
						<View className="flex-1">
							<Text className="text-gray-900 font-semibold text-sm">
								Use my current location
							</Text>
							<Text className="text-gray-500 text-xs mt-0.5">
								Uses GPS to find businesses near you
							</Text>
						</View>
						{!state.locationLoading && (
							<Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
						)}
					</TouchableOpacity>

					<View className="flex-row items-center gap-3">
						<View className="flex-1 h-px bg-gray-200" />
						<Text className="text-gray-400 text-xs">or search a place</Text>
						<View className="flex-1 h-px bg-gray-200" />
					</View>

					<View className="flex-row items-center bg-gray-100 rounded-2xl px-4 gap-2">
						<MaterialIcons name="search" size={20} color="#9CA3AF" />
						<TextInput
							className="flex-1 py-3 text-gray-900 text-sm"
							placeholder="City, neighbourhood, or address…"
							placeholderTextColor="#9CA3AF"
							value={addressInput}
							onChangeText={setAddressInput}
							onSubmitEditing={handleSearch}
							returnKeyType="search"
							autoCorrect={false}
						/>
						{addressInput.length > 0 && (
							<TouchableOpacity
								onPress={handleSearch}
								disabled={state.locationLoading}
							>
								{state.locationLoading ? (
									<ActivityIndicator size="small" color="#EAB308" />
								) : (
									<View className="bg-yellow-500 px-3 py-1.5 rounded-xl">
										<Text className="text-white text-xs font-semibold">Go</Text>
									</View>
								)}
							</TouchableOpacity>
						)}
					</View>

					{/* Permission denied warning */}
					{state.locationDenied && (
						<View className="bg-red-50 border border-red-200 rounded-xl p-3 flex-row items-start gap-2">
							<Ionicons
								name="warning"
								size={16}
								color="#EF4444"
								style={{ marginTop: 1 }}
							/>
							<Text className="text-red-600 text-xs flex-1">
								Location permission denied. Enable it in Settings, or search a
								place manually above.
							</Text>
						</View>
					)}
				</View>
			)}
		</View>
	);
}
