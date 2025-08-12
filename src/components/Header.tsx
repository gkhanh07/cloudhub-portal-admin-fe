'use client';

import React from 'react';
import { Button, Space, Typography } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

const Header: React.FC = () => {
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    console.log('Header user:', user);

    if (isLoading) {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <Text>Loading...</Text>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div style={{ padding: '16px' }}>
                <Text>Chưa đăng nhập</Text>
            </div>
        );
    }

    return (
        <div style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0'
        }}>
            <Space>
                <UserOutlined />
                <Text strong>Xin chào, {user?.name || user?.email || 'User'}</Text>
                {user?.role && <Text type="secondary">({user.role})</Text>}
            </Space>

            <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={logout}
            >
                Đăng xuất
            </Button>
        </div>
    );
};

export default Header;
