'use client'
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Table, Typography, Space, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { Post, CreatePostRequest, createPost, getPosts, deletePost } from '../../service/posts';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

const formRules = {
    name: [
        { required: true, message: 'Please input the post name!' },
        { min: 3, message: 'Name must be at least 3 characters!' },
        { max: 100, message: 'Name must not exceed 100 characters!' }
    ],
    content: [
        { required: true, message: 'Please input the content!' },
        { min: 10, message: 'Content must be at least 10 characters!' }
    ],
    price: [
        { required: true, message: 'Please input the price!' },
        { min: 0, message: 'Price must be positive!' }
    ]
};

export default function PostsPage() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    console.log('PostsPage user:', user);
    const [form] = Form.useForm();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);

    useEffect(() => { loadPosts(); }, []);

    const loadPosts = async () => {
        setTableLoading(true);
        try {
            const data = await getPosts();
            console.log('Loaded posts:', data);
            setPosts(data);
        } catch {
            message.error('Failed to load posts');
        } finally {
            setTableLoading(false);
        }
    };


    const onFinish = async (values: CreatePostRequest) => {
        setLoading(true);
        try {
            await createPost(values);
            await loadPosts();
            form.resetFields();
            message.success('Post created successfully!');
        } catch {
            message.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (id: string) => {
        try {
            await deletePost(Number(id));
            setPosts(posts.filter(p => String(p._id) !== id));
            message.success('Post deleted successfully!');
        } catch {
            message.error('Failed to delete post');
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name', width: '25%', ellipsis: true },
        {
            title: 'Content', dataIndex: 'content', key: 'content', width: '50%', ellipsis: true,
            render: (text: string) => <div style={{ maxHeight: 60, overflow: 'hidden' }}>{text}</div>
        },
        { title: 'Price', dataIndex: 'price', key: 'price', width: '15%', },
        {
            title: 'Actions', key: 'actions', width: '10%',
            render: (_: any, r: Post) => (
                <Button type="link" icon={<DeleteOutlined />} danger onClick={() => handleDelete(String(r._id))} size="small" />
            )
        }
    ];

    return (
        <div style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Title level={2} style={{ marginBottom: 24, color: '#1890ff' }}>Post Management</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title={<Space><PlusOutlined />Add New Post</Space>}>
                        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                            <Form.Item label="Post Name" name="name" rules={formRules.name}>
                                <Input placeholder="Enter post name" size="large" />
                            </Form.Item>
                            <Form.Item label="Content" name="content" rules={formRules.content}>
                                <TextArea rows={4} placeholder="Enter post content" showCount maxLength={500} />
                            </Form.Item>
                            <Form.Item label="Price" name="price" rules={formRules.price}>
                                <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} size="large" addonBefore="$" />
                            </Form.Item>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button type="primary" htmlType="submit" loading={loading} block size="large" icon={<PlusOutlined />}>
                                    Add Post
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card
                        title={<Space><EditOutlined />Posts List ({posts.length})<Button type="text" icon={<ReloadOutlined />} onClick={loadPosts} loading={tableLoading} size="small" /></Space>}
                    >
                        <Table
                            columns={columns}
                            dataSource={posts}
                            rowKey="_id"
                            loading={tableLoading}
                            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t, r) => `${r[0]}-${r[1]} of ${t} posts` }}
                            scroll={{ x: 600 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
