'use client'
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authService } from '../../service/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

// Sửa interface để khớp với dữ liệu form
interface LoginFormValues {
    email: string;
    password: string;
}

interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();


    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {

            const response: LoginResponse = await authService.login(values);


            if (response.data.accessToken) {
                login(response.data.accessToken, response.data.refreshToken);
                message.success('Đăng nhập thành công!');

                // Đợi một chút để user thấy thông báo thành công trước khi chuyển trang
                await new Promise(resolve => setTimeout(resolve, 500));

                router.push('/');

                // Không setLoading(false) ở đây để loading tiếp tục cho đến khi chuyển trang
                return;
            } else {
                throw new Error('Token không được trả về từ server');
            }
        } catch (error: any) {
            // Chỉ tắt loading khi có lỗi
            setLoading(false);

            let errorMessage = 'Đăng nhập thất bại!';

            if (error?.response?.status === 401) {
                errorMessage = 'Tài khoản hoặc mật khẩu không chính xác!';
            } else if (error?.response?.status === 400) {
                errorMessage = 'Thông tin đăng nhập không hợp lệ!';
            } else if (error?.response?.status === 404) {
                errorMessage = 'Tài khoản không tồn tại!';
            } else if (error?.response?.status === 429) {
                errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau!';
            } else if (error?.response?.status >= 500) {
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau!';
            } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
                errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet!';
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            message.error(errorMessage);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={2} style={{ marginBottom: 8, color: '#1890ff' }}>
                        CloudHub Portal
                    </Title>
                    <Text type="secondary">Đăng nhập vào hệ thống quản trị</Text>
                </div>

                <Spin spinning={loading}>
                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    // Xóa onSubmitCapture vì nó không cần thiết và có thể gây xung đột
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Định dạng email không hợp lệ!' },
                                { max: 255, message: 'Email không được quá 255 ký tự!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Nhập email của bạn"
                                autoComplete="email"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                                { max: 50, message: 'Mật khẩu không được quá 50 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu"
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{
                                    width: '100%',
                                    height: 45,
                                    fontSize: 16,
                                    fontWeight: 500
                                }}
                                loading={loading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        © 2025 CloudHub Portal. All rights reserved.
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;