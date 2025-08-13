'use client'
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Table, Typography, Space, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Post, CreatePostRequest, createPost, getPosts, deletePost } from '../../service/posts';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

// Quy tắc validate
const quyTacForm = {
    name: [
        { required: true, message: 'Vui lòng nhập tiêu đề bài viết!' },
        { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự!' },
        { max: 100, message: 'Tiêu đề không được vượt quá 100 ký tự!' }
    ],
    content: [
        { required: true, message: 'Vui lòng nhập nội dung!' },
        { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
    ],
    price: [] // Bỏ validate cho giá
};

export default function QuanLyBaiViet() {
    const { user } = useAuth();

    const [form] = Form.useForm();
    const [baiViet, setBaiViet] = useState<Post[]>([]);
    const [dangTai, setDangTai] = useState(false);
    const [dangTaiBang, setDangTaiBang] = useState(false);

    useEffect(() => { taiBaiViet(); }, []);

    const taiBaiViet = async () => {
        setDangTaiBang(true);
        try {
            const data = await getPosts();
            setBaiViet(data);
        } catch {
            message.error('Không tải được danh sách bài viết');
        } finally {
            setDangTaiBang(false);
        }
    };

    const onFinish = async (values: CreatePostRequest) => {
        setDangTai(true);
        try {
            await createPost(values);
            await taiBaiViet();
            form.resetFields();
            message.success('Thêm bài viết thành công!');
        } catch {
            message.error('Không thể thêm bài viết');
        } finally {
            setDangTai(false);
        }
    };

    const xoaBaiViet = async (id: string) => {
        try {
            await deletePost(Number(id));
            setBaiViet(baiViet.filter(p => String(p._id) !== id));
            message.success('Xóa bài viết thành công!');
        } catch {
            message.error('Không thể xóa bài viết');
        }
    };

    const cotBang = [
        { title: 'Tiêu đề', dataIndex: 'name', key: 'name', width: '25%', ellipsis: true },
        {
            title: 'Nội dung', dataIndex: 'content', key: 'content', width: '50%', ellipsis: true,
            render: (text: string) => <div style={{ maxHeight: 60, overflow: 'hidden' }}>{text}</div>
        },
        { title: 'Giá', dataIndex: 'price', key: 'price', width: '15%' },
        {
            title: 'Thao tác', key: 'actions', width: '10%',
            render: (_: any, r: Post) => (
                <Button type="link" icon={<DeleteOutlined />} danger onClick={() => xoaBaiViet(String(r._id))} size="small" />
            )
        }
    ];

    return (
        <div style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>Quản lý bài viết</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title={<Space><PlusOutlined />Thêm bài viết mới</Space>}>
                        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                            <Form.Item label="Tiêu đề" name="name" rules={quyTacForm.name}>
                                <Input placeholder="Nhập tiêu đề bài viết" size="large" />
                            </Form.Item>
                            <Form.Item label="Nội dung" name="content" rules={quyTacForm.content}>
                                <TextArea rows={4} placeholder="Nhập nội dung bài viết" showCount maxLength={500} />
                            </Form.Item>
                            <Form.Item label="Giá" name="price" rules={quyTacForm.price}>
                                <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} size="large" addonAfter="₫" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit" loading={dangTai} block size="large" icon={<PlusOutlined />}>
                                    Thêm bài viết
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <EditOutlined />Danh sách bài viết ({baiViet.length})
                                <Button type="text" icon={<ReloadOutlined />} onClick={taiBaiViet} loading={dangTaiBang} size="small" />
                            </Space>
                        }
                    >
                        <Table
                            columns={cotBang}
                            dataSource={baiViet}
                            rowKey="_id"
                            loading={dangTaiBang}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (tong, range) => `${range[0]}-${range[1]} của ${tong} bài viết`
                            }}
                            scroll={{ x: 600 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
