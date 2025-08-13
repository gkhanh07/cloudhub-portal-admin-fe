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

    useEffect(() => {
        loadNews();
    }, []);

    useEffect(() => {
        setFilteredNews(news.filter(item =>
            item.title?.toLowerCase().includes(searchText.toLowerCase())
        ));
    }, [news, searchText]);

    const loadNews = async () => {
        setLoading(true);
        try {
            const response = await newsService.getAllNews();
            if (response.success) {
                setNews(response.data);
            } else {
                message.error(response.message || 'Không tải được tin tức');
            }
        } catch {
            message.error('Không tải được tin tức');
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
                message.success('Xóa tin tức thành công');
            } else {
                message.error(response.message || 'Xóa tin tức thất bại');
            }
        } catch {
            message.error('Xóa tin tức thất bại');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (values.imageUrl && values.imageUrl.startsWith('blob:')) {
                message.error('Vui lòng nhập URL ảnh thực tế thay vì chọn file local.');
                return;
            }

            const newsData = {
                title: values.title,
                content: values.content,
                summary: values.summary,
                author: values.author || 'Quản trị viên',
                imageUrl: values.imageUrl || '',
                status: 'published' as const,
                publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
            };

            if (editingNews) {
                const response = await newsService.updateNews(editingNews._id, newsData);
                if (response.success) {
                    setNews(news.map(item => item._id === editingNews._id ? response.data : item));
                    message.success('Cập nhật tin tức thành công');
                } else {
                    message.error(response.message || 'Cập nhật tin tức thất bại');
                }
            } else {
                const response = await newsService.createNews(newsData);
                if (response.success) {
                    setNews([...news, response.data]);
                    message.success('Thêm tin tức thành công');
                } else {
                    message.error(response.message || 'Thêm tin tức thất bại');
                }
            }

            setModalVisible(false);
            form.resetFields();
        } catch {
            message.error('Lưu tin tức thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            render: (id: string) => id.slice(-8),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: News, b: News) => a.title.localeCompare(b.title),
            width: 200,
        },
        {
            title: 'Tóm tắt',
            dataIndex: 'summary',
            key: 'summary',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Nội dung',
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
            title: 'Ngày đăng',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Chưa đăng',
            sorter: (a: News, b: News) => {
                const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                return dateA - dateB;
            },
            width: 150,
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl: string) => (
                <Image
                    src={imageUrl || 'https://via.placeholder.com/300x200/1890ff/ffffff?text=Không+có+ảnh'}
                    alt="Ảnh tin tức"
                    width={60}
                    height={40}
                    style={{ objectFit: 'cover' }}
                />
            ),
            width: 100,
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_: any, record: News) => (
                <Space>
                    <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(record)}
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa tin tức này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
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
                        placeholder="Tìm kiếm tin tức theo tiêu đề"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm tin tức
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
                        `${range[0]}-${range[1]} trong tổng ${total} mục`,
                }}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingNews ? 'Chỉnh sửa tin tức' : 'Thêm tin tức'}
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
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Tóm tắt"
                        name="summary"
                        rules={[{ required: true, message: 'Vui lòng nhập tóm tắt!' }]}
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <TextArea rows={6} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ngày đăng"
                                name="publishedAt"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày đăng!' }]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="URL Ảnh"
                        name="imageUrl"
                    >
                        <Input placeholder="Nhập URL ảnh hoặc chọn file bên dưới" />
                    </Form.Item>

                    <Form.Item label="Chọn ảnh">
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                            onChange={(info) => {
                                const file = info.file.originFileObj;
                                if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    form.setFieldsValue({ imageUrl: previewUrl });
                                }
                            }}
                            onRemove={() => {
                                form.setFieldsValue({ imageUrl: '' });
                                return true;
                            }}
                        >
                            {!form.getFieldValue('imageUrl') && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                                </div>
                            )}
                        </Upload>

                        {form.getFieldValue('imageUrl') && (
                            <div style={{ marginTop: 8 }}>
                                <Image
                                    src={form.getFieldValue('imageUrl')}
                                    alt="preview"
                                    width={200}
                                />
                                <br />
                                <Button
                                    size="small"
                                    onClick={() => form.setFieldsValue({ imageUrl: '' })}
                                    style={{ marginTop: 8 }}
                                >
                                    Xóa ảnh
                                </Button>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingNews ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chi tiết tin tức"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {viewingNews && (
                    <div style={{ padding: '16px 0' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Tiêu đề</h3>
                                <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
                                    {viewingNews.title}
                                </p>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Ngày đăng</h3>
                                <p style={{ marginBottom: 16 }}>
                                    {viewingNews.publishedAt
                                        ? dayjs(viewingNews.publishedAt).format('YYYY-MM-DD HH:mm:ss')
                                        : 'Chưa đăng'}
                                </p>
                            </Col>
                        </Row>

                        {viewingNews.imageUrl && (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Hình ảnh</h3>
                                    <Image
                                        src={viewingNews.imageUrl}
                                        alt="Ảnh tin tức"
                                        width="100%"
                                        style={{ maxWidth: 400, marginBottom: 16 }}
                                    />
                                </Col>
                            </Row>
                        )}

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Tóm tắt</h3>
                                <p style={{
                                    backgroundColor: '#f5f5f5',
                                    padding: 12,
                                    borderRadius: 6,
                                    marginBottom: 16,
                                    lineHeight: 1.6
                                }}>
                                    {viewingNews.summary || 'Không có tóm tắt'}
                                </p>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Nội dung</h3>
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
                                            Không có nội dung
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
