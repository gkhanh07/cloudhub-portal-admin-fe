'use client';
import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
    CalendarOutlined,
    LinkOutlined,
    SettingOutlined,
    EditOutlined,
    HomeOutlined,
    TagsOutlined,
    ShoppingOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Menu, Modal, Avatar, Typography, Divider } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../service/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

const items = [
    { key: 'posts', icon: <EditOutlined />, label: 'Posts' },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: 'categories', icon: <TagsOutlined />, label: 'Categories' },
    { key: 'news', icon: <CalendarOutlined />, label: 'News' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất' },
];

const pathToKeyMap: Record<string, string> = {
    '/': 'home',
    '/posts': 'posts',
    '/products': 'products',
    '/categories': 'categories',
    '/news': 'news',
};

const MenuComponent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const initialKey = (() => {
        const map: Record<string, string> = {
            '/': 'home',
            '/posts': 'posts',
            '/products': 'products',
            '/categories': 'categories',
            '/news': 'news',
        };
        return map[pathname] || 'home';
    })();

    const [selectedKeys, setSelectedKeys] = useState<string[]>([initialKey]);
    const { user } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);



    useLayoutEffect(() => {
        setSelectedKeys([pathToKeyMap[pathname] || 'home']);
    }, [pathname]);

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            Modal.confirm({
                title: 'Xác nhận đăng xuất',
                content: 'Bạn có chắc chắn muốn đăng xuất?',
                okText: 'Đăng xuất',
                cancelText: 'Hủy',
                onOk: () => {
                    authService.logout();
                    router.push('/login');
                },
            });
            return;
        }

        if (pathToKeyMap && Object.values(pathToKeyMap).includes(key)) {
            const targetPath = Object.keys(pathToKeyMap).find(
                (path) => pathToKeyMap[path] === key
            );
            if (targetPath) router.push(targetPath);
        }
    };

    return (
        <div style={{ width: 256, padding: 16 }}>
            {/* Header user */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Avatar
                    size={48}
                    src={avatarUrl || undefined}
                    icon={!avatarUrl ? <UserOutlined /> : undefined}
                    style={{ marginRight: 12 }}
                />
                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        {user?.name || 'User'}
                    </Text>
                    {/* Nếu muốn, thêm email hoặc vai trò */}
                    <div style={{ fontSize: 12, color: '#888' }}>{user?.email}</div>
                </div>
            </div>
            <Divider style={{ margin: '8px 0' }} />

            <Menu
                selectedKeys={selectedKeys}
                mode="inline"
                theme="light"
                items={items}
                onClick={handleMenuClick}
                style={{ borderRight: 'none' }}
            />
        </div>
    );
};

export default MenuComponent;
