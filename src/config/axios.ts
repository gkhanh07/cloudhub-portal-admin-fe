import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Nếu dùng cookie để gửi token thì thêm:
    // withCredentials: true,
});

// Hàm lấy cookie theo tên
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()!.split(';').shift() || null;
    }
    return null;
}

apiClient.interceptors.request.use((config) => {
    const token = getCookie('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


apiClient.interceptors.response.use(
    response => response,
    async error => {
        const baseURL = process.env.NEXT_PUBLIC_API_URL;
        const originalRequest = error.config;

        // Xử lý timeout
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
            error.message = 'Kết nối quá chậm. Vui lòng thử lại!';
        }

        // Xử lý lỗi mạng
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            error.message = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet!';
        }

        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const refreshToken = getCookie('refresh_token');

                if (!refreshToken) {
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                const refreshResponse = await axios.post(`${baseURL}users/refresh-token`, {
                    refreshToken,
                });

                const newAccessToken = refreshResponse.data.data.accessToken;
                document.cookie = `access_token=${newAccessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
