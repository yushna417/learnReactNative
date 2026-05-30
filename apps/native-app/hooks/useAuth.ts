import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';


export type AuthUser = {
    id: number;
    email: string;
    is_active: boolean;
    is_staff: boolean;
    created_at: string;
    updated_at: string;
};

export const useAuth = () => {
    return useQuery<AuthUser>({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await apiClient.get('/auth/me/');
            return response.data;
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await apiClient.post('/auth/logout/');
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

            return response.data;
        },
    });
};