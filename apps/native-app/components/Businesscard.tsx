import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import { BusinessListing } from "@/hooks/useBusinessListings";

interface BusinessCardProps {
    item: BusinessListing;
    onPress: () => void;
}

export function BusinessCard({ item, onPress }: BusinessCardProps) {
    const shortAddress = item.address
        ? item.address.split(",").slice(0, 2).join(",")
        : "";

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-xl overflow-hidden shadow-md active:opacity-90 mb-5"
        >
            <Card variant="outline" className="rounded-4xl">
                {item.business_category && (
                    <Badge size="lg" variant="solid" action="warning">
                        <BadgeText>{item.business_category}</BadgeText>
                    </Badge>
                )}

                <View className="p-4">
                    {/* Title */}
                    <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
                        {item.title || "Untitled Business"}
                    </Text>

                    {/* Description */}
                    {item.service_detail ? (
                        <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                            {item.service_detail}
                        </Text>
                    ) : null}

                    {/* Address + distance */}
                    <View className="flex-row items-center mt-2 gap-3">
                        {shortAddress ? (
                            <View className="flex-row items-center flex-1">
                                <Text className="text-gray-400 mr-1">📍</Text>
                                <Text className="text-gray-500 text-xs flex-shrink" numberOfLines={1}>
                                    {shortAddress}
                                </Text>
                            </View>
                        ) : null}

                        {item.distance_km != null && (
                            <View className="bg-blue-50 px-2.5 py-1 rounded-full">
                                <Text className="text-blue-600 text-xs font-semibold">
                                    {item.distance_km} km away
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Footer row */}
                    <View className="flex-row justify-between items-center mt-4">
                        {item.phone_no ? (
                            <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full gap-2">
                                <FontAwesome5 name="phone-alt" size={13} color="#ca8a04" />
                                <Text className="text-gray-700 text-xs">{item.phone_no}</Text>
                            </View>
                        ) : (
                            <View />
                        )}

                        <View className="bg-yellow-500 px-4 py-2 rounded-full flex-row items-center gap-1">
                            <Text className="text-white text-xs font-semibold">View Details</Text>
                            <Text className="text-white text-xs">→</Text>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}