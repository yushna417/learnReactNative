import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Fab, FabIcon, FabLabel } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";
import { useGetAllListings } from "@/hooks/useBusinessListings";
import { useBusinessSearch } from "@/hooks/Usebusinesssearch";

import {
	BusinessFilterModal,
	SORT_OPTIONS,
} from "@/components/BusinessFilterModal";
import { BusinessCard } from "@/components/Businesscard";
import { BusinessListFooter } from "@/components/Businesslistfooter";
import { SortModal } from "@/components/Sortmodal";

export default function BusinessSearch() {
	const router = useRouter();
	const { data: user } = useAuth();

	const {
		state,
		dispatch,
		apiParams,
		activeFilterCount,
		requestGPSLocation,
		geocodeAddress,
	} = useBusinessSearch();

	const { data, isLoading, isError, refetch, isFetching } =
		useGetAllListings(apiParams);

	const listings = data?.listings ?? [];
	const pagination = data?.pagination ?? null;

	// ── Helpers ───────────────────────────────────────────────────────────────

	const openFilters = () => dispatch({ type: "TOGGLE_FILTERS", value: true });
	const openSort = () => dispatch({ type: "TOGGLE_SORT", value: true });
	const clearAll = () => dispatch({ type: "CLEAR_FILTERS" });

	return (
		<SafeAreaView className="flex-1 bg-gray-50 py-4">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="px-6 pb-1">
					<Heading size="2xl" className="text-gray-900 mb-4">
						Local Businesses
					</Heading>

					<View className="flex-row gap-2 mb-3">
						<View className="flex-1 bg-gray-100 rounded-xl">
							<Input className="border-0 h-12">
								<InputField
									placeholder="Search by name, category, or keyword…"
									value={state.searchInput}
									onChangeText={(v) =>
										dispatch({ type: "SET_SEARCH_INPUT", value: v })
									}
									className="text-gray-900 text-base"
									placeholderTextColor="#9CA3AF"
								/>
							</Input>
						</View>

						<TouchableOpacity
							onPress={openFilters}
							className={`w-12 h-12 rounded-xl items-center justify-center ${
								activeFilterCount > 0 ? "bg-yellow-500" : "bg-gray-100"
							}`}
						>
							<Ionicons
								name="options-outline"
								size={22}
								color={activeFilterCount > 0 ? "#fff" : "#374151"}
							/>
							{activeFilterCount > 0 && (
								<View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
									<Text className="text-white text-xs font-bold">
										{activeFilterCount}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>

					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<TouchableOpacity
							onPress={openSort}
							className="mr-2 px-4 py-2 bg-gray-100 rounded-full flex-row items-center"
						>
							<Ionicons
								name="swap-vertical-outline"
								size={14}
								color="#374151"
							/>
							<Text className="text-gray-700 text-sm mx-1">Sort:</Text>
							<Text className="text-yellow-600 text-sm font-semibold">
								{SORT_OPTIONS.find((o) => o.value === state.sortBy)?.label}
							</Text>
						</TouchableOpacity>

						{state.category !== "All" && (
							<TouchableOpacity
								onPress={() => dispatch({ type: "SET_CATEGORY", value: "All" })}
								className="mr-2 px-4 py-2 bg-yellow-100 rounded-full flex-row items-center"
							>
								<Text className="text-yellow-800 text-sm">
									{state.category}
								</Text>
								<Text className="text-yellow-800 ml-1 text-xs">✕</Text>
							</TouchableOpacity>
						)}

						{/* Radius chip */}
						{state.radiusKm !== null && (
							<TouchableOpacity
								onPress={() => dispatch({ type: "SET_RADIUS", value: null })}
								className="mr-2 px-4 py-2 bg-yellow-100 rounded-full flex-row items-center gap-1"
							>
								<Ionicons name="location-outline" size={13} color="#92400E" />
								<Text className="text-yellow-800 text-sm">
									{state.radiusKm} km
									{state.locationLabel ? ` · ${state.locationLabel}` : ""}
								</Text>
								<Text className="text-yellow-800 ml-1 text-xs">✕</Text>
							</TouchableOpacity>
						)}

						{activeFilterCount > 0 && (
							<TouchableOpacity
								onPress={clearAll}
								className="px-4 py-2 bg-gray-100 rounded-full"
							>
								<Text className="text-gray-500 text-sm">Clear all</Text>
							</TouchableOpacity>
						)}
					</ScrollView>

					{pagination ? (
						<BusinessListFooter
							pagination={pagination}
							perPage={state.perPage}
							isFetching={isFetching}
							dispatch={dispatch}
						/>
					) : null}
				</View>

				{isLoading ? (
					<View className="flex-1 justify-center items-center">
						<ActivityIndicator size="large" color="#EAB308" />
						<Text className="text-gray-400 mt-3 text-sm">
							Fetching businesses…
						</Text>
					</View>
				) : isError ? (
					<View className="flex-1 justify-center items-center px-6">
						<Text className="text-5xl mb-4">⚠️</Text>
						<Text className="text-gray-700 font-semibold text-lg mb-2">
							Failed to load
						</Text>
						<Text className="text-gray-500 text-center mb-6">
							Could not fetch businesses. Check your connection.
						</Text>
						<TouchableOpacity
							onPress={() => refetch()}
							className="px-6 py-3 bg-yellow-500 rounded-xl"
						>
							<Text className="text-white font-semibold">Retry</Text>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						data={listings}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<BusinessCard
								item={item}
								onPress={() =>
									router.push({
										pathname: "/business/business-detail",
										params: { businessId: String(item.id) },
									})
								}
							/>
						)}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4 }}
						ListEmptyComponent={
							<View className="items-center py-20">
								<Text className="text-6xl mb-4">🔍</Text>
								<Heading size="lg" className="text-gray-900 mb-2">
									No businesses found
								</Heading>
								<Text className="text-gray-500 text-center mb-6">
									Try adjusting your search or filters
								</Text>
								<TouchableOpacity
									onPress={clearAll}
									className="px-6 py-3 bg-yellow-500 rounded-xl"
								>
									<Text className="text-white font-semibold">
										Clear Filters
									</Text>
								</TouchableOpacity>
							</View>
						}
					/>
				)}

				<Fab
					size="md"
					placement="bottom right"
					isHovered={false}
					isDisabled={isLoading}
					onPress={() => router.push(user ? "/business" : "/(auth)/login")}
				>
					<FabIcon as={AddIcon} />
					<FabLabel>Add Business</FabLabel>
				</Fab>

				<BusinessFilterModal
					state={state}
					dispatch={dispatch}
					onRequestGPS={requestGPSLocation}
					onGeocodeAddress={geocodeAddress}
					onClearAll={clearAll}
				/>
				<SortModal state={state} dispatch={dispatch} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
