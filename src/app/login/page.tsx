'use client'
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authService } from '../../service/auth';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginForm {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const onFinish = async (values: LoginForm) => {
        setLoading(true);
        try {
            console.log('Attempting login with:', values);
            const response = await authService.login(values);
            console.log('Login response:', response);

            // Lưu token vào AuthContext
            if (response.access_token) {
                login(response.access_token);
                message.success('Đăng nhập thành công!');
                router.push('/'); // Redirect to dashboard
            } else {
                throw new Error('Token không được trả về từ server');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error?.response);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Đăng nhập thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
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
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Nhập email của bạn"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Nhập mật khẩu"
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
