'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Upload,
    Popconfirm,
    Space,
    message,
    Row,
    Col,
    Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { newsService, News } from '../../service/news';

const { TextArea } = Input;

const NewsPage = () => {
    const [news, setNews] = useState<News[]>([]);
    const [filteredNews, setFilteredNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [viewingNews, setViewingNews] = useState<News | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Load news on component mount
    useEffect(() => {
        loadNews();
    }, []);

    // Filter news when search text changes
    useEffect(() => {
        const filtered = news.filter(item =>
            item.title?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredNews(filtered);
    }, [news, searchText]);

    const loadNews = async () => {
        setLoading(true);
        try {
            const response = await newsService.getAllNews();
            if (response.success) {
                setNews(response.data);
            } else {
                message.error(response.message || 'Failed to load news');
            }
        } catch (error) {
            message.error('Failed to load news');
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingNews(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (newsItem: News) => {
        setEditingNews(newsItem);
        form.setFieldsValue({
            ...newsItem,
            publishedAt: newsItem.publishedAt ? dayjs(newsItem.publishedAt) : null,
        });
        setModalVisible(true);
    };

    const handleView = (newsItem: News) => {
        setViewingNews(newsItem);
        setViewModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await newsService.deleteNews(id);
            if (response.success) {
                setNews(news.filter(item => item._id !== id));
                message.success('News deleted successfully');
            } else {
                message.error(response.message || 'Failed to delete news');
            }
        } catch (error) {
            message.error('Failed to delete news');
            console.error('Error deleting news:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const newsData = {
                title: values.title,
                content: values.content,
                summary: values.summary,
                author: values.author || 'Admin',
                imageUrl: values.imageUrl,
                status: 'published' as const,
                publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
            };

            if (editingNews) {
                const response = await newsService.updateNews(editingNews._id, newsData);
                if (response.success) {
                    setNews(news.map(item => item._id === editingNews._id ? response.data : item));
                    message.success('News updated successfully');
                } else {
                    message.error(response.message || 'Failed to update news');
                }
            } else {
                const response = await newsService.createNews(newsData);
                if (response.success) {
                    setNews([...news, response.data]);
                    message.success('News created successfully');
                } else {
                    message.error(response.message || 'Failed to create news');
                }
            }

            setModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save news');
            console.error('Error saving news:', error);
        }
    };

    const handleImageUpload = (info: any) => {
        if (info.file.status === 'done') {
            // In a real application, you would get the URL from the server response
            const imageUrl = URL.createObjectURL(info.file.originFileObj);
            form.setFieldsValue({ imageUrl });
            message.success('Image uploaded successfully');
        } else if (info.file.status === 'error') {
            message.error('Image upload failed');
        }
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG files!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
            return false;
        }
        return true;
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            render: (id: string) => id.slice(-8), // Show last 8 characters
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: News, b: News) => a.title.localeCompare(b.title),
            width: 200,
        },
        {
            title: 'Summary',
            dataIndex: 'summary',
            key: 'summary',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            ellipsis: true,
            render: (content: string) => (
                <div style={{ maxWidth: 300 }}>
                    {content?.length > 100 ? `${content.substring(0, 100)}...` : content}
                </div>
            ),
        },
        {
            title: 'Published At',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Not published',
            sorter: (a: News, b: News) => {
                const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return dateA - dateB;
            },
            width: 150,
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl: string) => (
                <Image
                    src={imageUrl || 'https://via.placeholder.com/300x200/1890ff/ffffff?text=No+Image'}
                    alt="News thumbnail"
                    width={60}
                    height={40}
                    style={{ objectFit: 'cover' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8M+Q4P9yiYBpN3FNIp4A"
                />
            ),
            width: 100,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_: any, record: News) => (
                <Space>
                    <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(record)}
                        title="View Details"
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                        title="Edit"
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this news?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Input.Search
                        placeholder="Search news by title"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add News
                    </Button>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredNews}
                rowKey="_id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingNews ? 'Edit News' : 'Add News'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please input news title!' }]}
                    >
                        <Input />
                    </Form.Item>



                    <Form.Item
                        label="Summary"
                        name="summary"
                        rules={[{ required: true, message: 'Please input news summary!' }]}
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label="Content"
                        name="content"
                        rules={[{ required: true, message: 'Please input news content!' }]}
                    >
                        <TextArea rows={6} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Image"
                                name="imageUrl"
                            >
                                <Input placeholder="Image URL" />
                            </Form.Item>
                            <Upload
                                name="image"
                                listType="picture"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleImageUpload}
                                customRequest={({ onSuccess }) => {
                                    setTimeout(() => {
                                        onSuccess && onSuccess("ok");
                                    }, 0);
                                }}
                            >
                                <Button icon={<UploadOutlined />}>Upload Image</Button>
                            </Upload>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Published At"
                                name="publishedAt"
                                rules={[{ required: true, message: 'Please select published date!' }]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {form.getFieldValue('imageUrl') && (
                        <Form.Item label="Image Preview">
                            <Image
                                src={form.getFieldValue('imageUrl')}
                                alt="Preview"
                                width={200}
                                height={120}
                                style={{ objectFit: 'cover' }}
                            />
                        </Form.Item>
                    )}

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingNews ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="News Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {viewingNews && (
                    <div style={{ padding: '16px 0' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Title</h3>
                                <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
                                    {viewingNews.title}
                                </p>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>

                            <Col span={12}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Published At</h3>
                                <p style={{ marginBottom: 16 }}>
                                    {viewingNews.publishedAt
                                        ? dayjs(viewingNews.publishedAt).format('YYYY-MM-DD HH:mm:ss')
                                        : 'Not published'
                                    }
                                </p>
                            </Col>
                        </Row>

                        {viewingNews.imageUrl && (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Image</h3>
                                    <Image
                                        src={viewingNews.imageUrl}
                                        alt="News image"
                                        width="100%"
                                        style={{ maxWidth: 400, marginBottom: 16 }}
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1xkE8M+Q4P9yiYBpN3FNIp4A"
                                    />
                                </Col>
                            </Row>
                        )}

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Summary</h3>
                                <p style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: 12,
                                    borderRadius: 6,
                                    marginBottom: 16,
                                    lineHeight: 1.6
                                }}>
                                    {viewingNews.summary || 'No summary available'}
                                </p>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Content</h3>
                                <div style={{
                                    backgroundColor: '#fafafa',
                                    padding: 16,
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9',
                                    lineHeight: 1.8,
                                    fontSize: 14
                                }}>
                                    {viewingNews.content ? (
                                        <div dangerouslySetInnerHTML={{
                                            __html: viewingNews.content.replace(/\n/g, '<br />')
                                        }} />
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic' }}>
                                            No content available
                                        </p>
                                    )}
                                </div>
                            </Col>
                        </Row>


                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NewsPage;
