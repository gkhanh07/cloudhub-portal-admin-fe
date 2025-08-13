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
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../service/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Text } = Typography;

// Danh sách menu
const mucMenu = [
    { key: 'trang-chu', icon: <HomeOutlined />, label: 'Trang chủ' },
    { key: 'bai-viet', icon: <EditOutlined />, label: 'Bài viết' },
    { key: 'san-pham', icon: <ShoppingOutlined />, label: 'Sản phẩm' },
    { key: 'danh-muc', icon: <TagsOutlined />, label: 'Danh mục' },
    { key: 'tin-tuc', icon: <CalendarOutlined />, label: 'Tin tức' },
    { key: 'dang-xuat', icon: <LogoutOutlined />, label: 'Đăng xuất' },
];

// Map đường dẫn → key menu
const duongDanToKey: Record<string, string> = {
    '/': 'trang-chu',
    '/posts': 'bai-viet',
    '/products': 'san-pham',
    '/categories': 'danh-muc',
    '/news': 'tin-tuc',
};

const ThanhMenu: React.FC = () => {
    const router = useRouter();
    const duongDanHienTai = usePathname();

    // Key menu ban đầu dựa trên đường dẫn hiện tại
    const keyBanDau = duongDanToKey[duongDanHienTai] || 'trang-chu';
    const [keyDangChon, setKeyDangChon] = useState<string[]>([keyBanDau]);

    const { user } = useAuth();
    const [anhDaiDien, setAnhDaiDien] = useState<string | null>(null);

    // Cập nhật menu khi đường dẫn thay đổi
    useLayoutEffect(() => {
        setKeyDangChon([duongDanToKey[duongDanHienTai] || 'trang-chu']);
    }, [duongDanHienTai]);

    // Xử lý khi click menu
    const xuLyClickMenu = ({ key }: { key: string }) => {
        if (key === 'dang-xuat') {
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

        if (Object.values(duongDanToKey).includes(key)) {
            const duongDanMoi = Object.keys(duongDanToKey).find(
                (path) => duongDanToKey[path] === key
            );
            if (duongDanMoi) router.push(duongDanMoi);
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
                items={mucMenu}
                onClick={xuLyClickMenu}
                style={{ borderRight: 'none' }}
            />
        </div>
    );
};

export default ThanhMenu;
