import apiClient from '../config/axios';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
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
            throw error;
        }
    },

    logout: () => {
        // AuthContext sẽ xử lý việc xóa cookie
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    getCurrentUser: () => {
        const token = localStorage.getItem('access_token');
        return token ? true : false;
    }
};
