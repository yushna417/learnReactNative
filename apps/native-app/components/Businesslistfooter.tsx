import { PaginationMeta } from "@/hooks/useBusinessListings";
import { Action } from "@/hooks/Usebusinesssearch";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";


const PER_PAGE_OPTIONS = [10, 20, 50];

type BusinessListFooterProps = {
    pagination: PaginationMeta;
    perPage: number;
    isFetching: boolean;
    dispatch: React.Dispatch<Action>;
}

export function BusinessListFooter({
    pagination,
    perPage,
    isFetching,
    dispatch,
}: BusinessListFooterProps) {
    const { page, total_pages, total, per_page } = pagination;
    const start = (page - 1) * per_page + 1;
    const end = Math.min(page * per_page, total);

    return (
        <View className="pt-2 flex flex-col gap-4">
            <View className="flex flex-row justify-between items-center">
                <Text className="text-gray-400 text-xs">
                    Showing {start}–{end} of {total} {total === 1 ? "business" : "businesses"}
                </Text>
                <View className="flex-row items-center gap-2">
                    <Text className="text-gray-400 text-xs">Rows per page:</Text>
                    {PER_PAGE_OPTIONS.map((n) => (
                        <TouchableOpacity
                            key={n}
                            onPress={() => dispatch({ type: "SET_PER_PAGE", value: n })}
                            className={`px-3 py-1.5 rounded-full ${perPage === n ? "bg-yellow-500" : "bg-gray-100"
                                }`}
                        >
                            <Text
                                className={`text-xs font-semibold ${perPage === n ? "text-white" : "text-gray-600"
                                    }`}
                            >
                                {n}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="flex-row items-center justify-center gap-3 mb-5">
                <TouchableOpacity
                    onPress={() => dispatch({ type: "SET_PAGE", value: page - 1 })}
                    disabled={!pagination.has_previous || isFetching}
                    className={`px-4 py-2 rounded-xl ${pagination.has_previous && !isFetching ? "bg-yellow-500" : "bg-gray-100"
                        }`}
                >
                    <Text
                        className={`text-xs font-semibold ${pagination.has_previous && !isFetching ? "text-white" : "text-gray-300"
                            }`}
                    >
                        ← Prev
                    </Text>
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                        {Array.from({ length: total_pages }, (_, i) => i + 1).map((p) => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => dispatch({ type: "SET_PAGE", value: p })}
                                disabled={isFetching}
                                className={`w-7 h-7 rounded-full items-center justify-center ${p === page ? "bg-yellow-500" : "bg-gray-100"
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${p === page ? "text-white" : "text-gray-600"
                                        }`}
                                >
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <TouchableOpacity
                    onPress={() => dispatch({ type: "SET_PAGE", value: page + 1 })}
                    disabled={!pagination.has_next || isFetching}
                    className={`px-4 py-2 rounded-xl ${pagination.has_next && !isFetching ? "bg-yellow-500" : "bg-gray-100"
                        }`}
                >
                    <Text
                        className={`text-xs font-semibold ${pagination.has_next && !isFetching ? "text-white" : "text-gray-300"
                            }`}
                    >
                        Next →
                    </Text>
                </TouchableOpacity>
            </View>


        </View>
    );
}