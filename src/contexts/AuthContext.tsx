'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

// Định nghĩa interface cho user data từ JWT
interface UserData {
    id: string;
    email: string;
    name?: string;
    role?: string;
    exp?: number;
    iat?: number;
}

// Định nghĩa interface cho AuthContext
interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshUserData: () => void;
}

// Tạo AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Decode token và lấy thông tin user
    const decodeTokenAndSetUser = (token: string) => {
        try {
            const decoded = jwtDecode<UserData>(token);

            // Kiểm tra token có hết hạn không
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                // Token đã hết hạn
                Cookies.remove('access_token');
                setUser(null);
                return false;
            }

            setUser(decoded);
            return true;
        } catch (error) {
            console.error('Error decoding token:', error);
            Cookies.remove('access_token');
            setUser(null);
            return false;
        }
    };

    // Khởi tạo user data từ cookie khi component mount
    useEffect(() => {
        const token = Cookies.get('access_token');

        if (token) {
            decodeTokenAndSetUser(token);
        }

        setIsLoading(false);
    }, []);

    // Hàm login - lưu token vào cookie và decode
    const login = (token: string) => {
        Cookies.set('access_token', token, {
            expires: 7, // 7 ngày
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        decodeTokenAndSetUser(token);
    };

    // Hàm logout - xóa token và reset user
    const logout = () => {
        Cookies.remove('access_token');
        setUser(null);
    };

    // Hàm refresh user data từ token hiện tại
    const refreshUserData = () => {
        const token = Cookies.get('access_token');
        if (token) {
            decodeTokenAndSetUser(token);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUserData,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để sử dụng AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
