import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/',
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
        const originalRequest = error.config;

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

                const refreshResponse = await axios.post('http://localhost:8080/users/refresh-token', {
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
