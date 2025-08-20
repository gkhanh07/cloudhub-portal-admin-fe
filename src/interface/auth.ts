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