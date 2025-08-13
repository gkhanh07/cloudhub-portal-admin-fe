import apiClient from '../config/axios';
import Cookies from 'js-cookie';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    }
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            console.log('Sending login request:', credentials);
            const response = await apiClient.post('/users/login', credentials);
            console.log('Full response:', response);
            const data = response.data;
            console.log('Response data:', data);

            // Trả về data để AuthContext xử lý token
            return data;
        } catch (error: any) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });

            // Tạo lỗi với thông tin chi tiết hơn
            const enhancedError = {
                ...error,
                response: {
                    ...error.response,
                    data: {
                        message: error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message,
                        ...error.response?.data
                    }
                }
            };

            throw enhancedError;
        }
    },

    logout: () => {
        // AuthContext sẽ xử lý việc xóa cookie
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
    },

    getCurrentUser: () => {
        const token = Cookies.get('access_token');
        return token ? true : false;
    }
};
