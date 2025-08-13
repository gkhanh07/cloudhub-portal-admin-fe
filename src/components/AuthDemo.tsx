'use client';

import React from 'react';
import { Card, Space, Typography, Button, Descriptions } from 'antd';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

const AuthDemo: React.FC = () => {
    const { user, isAuthenticated, isLoading, logout, refreshUserData } = useAuth();

    if (isLoading) {
        return (
            <Card>
                <Text>Đang tải thông tin người dùng...</Text>
            </Card>
        );
    }

    return (
        <Card title="Thông tin xác thực" style={{ margin: '20px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={4}>Trạng thái đăng nhập</Title>
                    <Text strong>
                        {isAuthenticated ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập'}
                    </Text>
                </div>

                {isAuthenticated && user && (
                    <div>
                        <Title level={4}>Thông tin người dùng</Title>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="ID">
                                {user.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {user.email}
                            </Descriptions.Item>
                            {user.name && (
                                <Descriptions.Item label="Tên">
                                    {user.name}
                                </Descriptions.Item>
                            )}
                            {user.role && (
                                <Descriptions.Item label="Vai trò">
                                    {user.role}
                                </Descriptions.Item>
                            )}
                            {user.exp && (
                                <Descriptions.Item label="Token hết hạn">
                                    {new Date(user.exp * 1000).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                            {user.iat && (
                                <Descriptions.Item label="Token được tạo">
                                    {new Date(user.iat * 1000).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default AuthDemo;
