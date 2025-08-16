'use client';
import React, { useLayoutEffect, useState } from 'react';
import {
    CalendarOutlined,
    EditOutlined,
    HomeOutlined,
    TagsOutlined,
    ShoppingOutlined,
    LogoutOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Menu, Modal, Avatar, Typography, Divider } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '../service/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

// Map key menu → { label, icon, path }
const mucMenu = [
    { key: 'trang-chu', icon: <HomeOutlined />, label: 'Trang chủ', path: '/' },
    { key: 'bai-viet', icon: <EditOutlined />, label: 'Các dịch vụ cơ bản', path: '/posts' },
    { key: 'san-pham', icon: <ShoppingOutlined />, label: 'Sản phẩm', path: '/products' },
    { key: 'danh-muc', icon: <TagsOutlined />, label: 'Danh mục', path: '/categories' },
    { key: 'tin-tuc', icon: <CalendarOutlined />, label: 'Tin tức', path: '/news' },
    { key: 'dang-xuat', icon: <LogoutOutlined />, label: 'Đăng xuất' }, // đặc biệt
];

const ThanhMenu: React.FC = () => {
    const duongDanHienTai = usePathname();
    const { user } = useAuth();
    const [anhDaiDien, setAnhDaiDien] = useState<string | null>(null);

    // Key menu ban đầu dựa trên pathname
    const [keyDangChon, setKeyDangChon] = useState<string[]>([]);

    useLayoutEffect(() => {
        const found = mucMenu.find((item) => item.path === duongDanHienTai);
        setKeyDangChon([found?.key || 'trang-chu']);
    }, [duongDanHienTai]);

    // Xử lý logout
    const xuLyClickMenu = ({ key }: { key: string }) => {
        if (key === 'dang-xuat') {
            Modal.confirm({
                title: 'Xác nhận đăng xuất',
                content: 'Bạn có chắc chắn muốn đăng xuất?',
                okText: 'Đăng xuất',
                cancelText: 'Hủy',
                onOk: () => {
                    authService.logout();
                    window.location.href = '/login'; // dùng reload thay vì router.push
                },
            });
        }
    };

    return (
        <div style={{ width: 256, padding: 16 }}>
            {/* Header người dùng */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Avatar
                    size={48}
                    src={anhDaiDien || undefined}
                    icon={!anhDaiDien ? <UserOutlined /> : undefined}
                    style={{ marginRight: 12 }}
                />
                <div>
                    <Text strong style={{ fontSize: 16 }}>
                        {user?.name || 'Người dùng'}
                    </Text>
                    <div style={{ fontSize: 12, color: '#888' }}>{user?.email}</div>
                </div>
            </div>
            <Divider style={{ margin: '8px 0' }} />

            <Menu
                selectedKeys={keyDangChon}
                mode="inline"
                theme="light"
                onClick={xuLyClickMenu}
                items={mucMenu.map((item) => ({
                    key: item.key,
                    icon: item.icon,
                    label:
                        item.key === 'dang-xuat' ? (
                            item.label
                        ) : (
                            <Link href={item.path!}>{item.label}</Link>
                        ),
                }))}
                style={{ borderRight: 'none' }}
            />
        </div>
    );
};

export default ThanhMenu;
