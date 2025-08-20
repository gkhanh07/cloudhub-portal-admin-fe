import apiClient from '../config/axios';
import Cookies from 'js-cookie';
import { LoginRequest, LoginResponse } from '../interface/auth';



export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await apiClient.post('/users/login', credentials);
            const data = response.data;

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
