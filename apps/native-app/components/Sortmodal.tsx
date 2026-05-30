import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Heading } from "@/components/ui/heading";
import { SORT_OPTIONS } from "./BusinessFilterModal";
import { SearchState, Action } from "@/hooks/Usebusinesssearch";

interface SortModalProps {
    state: SearchState;
    dispatch: React.Dispatch<Action>;
}

export function SortModal({ state, dispatch }: SortModalProps) {
    const close = () => dispatch({ type: "TOGGLE_SORT", value: false });

    return (
        <Modal
            animationType="fade"
            transparent
            visible={state.showSort}
            onRequestClose={close}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 justify-center items-center"
                activeOpacity={1}
                onPress={close}
            >
                <View className="bg-white rounded-2xl w-80 p-6">
                    <Heading size="md" className="text-gray-900 mb-4">Sort By</Heading>
                    {SORT_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                                dispatch({ type: "SET_SORT", value: option.value });
                                dispatch({ type: "TOGGLE_SORT", value: false });
                            }}
                            className="py-3 border-b border-gray-100"
                        >
                            <View className="flex-row justify-between items-center">
                                <Text
                                    className={`text-base ${state.sortBy === option.value
                                        ? "text-yellow-600 font-semibold"
                                        : "text-gray-700"
                                        }`}
                                >
                                    {option.label}
                                </Text>
                                {state.sortBy === option.value && (
                                    <Text className="text-yellow-600">✓</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}