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
import dynamic from 'next/dynamic';
import { newsService, News } from '../../service/news';
import { uploadImage, getFileUrl } from '../../store/appwrite';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const { TextArea } = Input;

// Quill editor configuration
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ],
};

const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'align', 'color', 'background'
];

const NewsPage = () => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [filteredNewsList, setFilteredNewsList] = useState<News[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [viewingNews, setViewingNews] = useState<News | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');


    useEffect(() => {
        loadNewsList();
    }, []);

    useEffect(() => {
        setFilteredNewsList(
            newsList.filter(item =>
                item.title?.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [newsList, searchText]);

    const loadNewsList = async () => {
        setIsLoading(true);
        try {
            const response = await newsService.getAllNews();
            if (response.success) {
                setNewsList(Array.isArray(response.data) ? response.data : []);
            } else {
                message.error(response.message || 'Không tải được tin tức');
            }
        } catch {
            message.error('Không tải được tin tức');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNews = () => {
        setEditingNews(null);
        form.resetFields();
        setUploadedImageUrl('');
        // Tự động đặt ngày hiện tại
        form.setFieldsValue({
            publishedAt: dayjs()
        });
        setIsModalVisible(true);
    };

    const handleEditNews = (newsItem: News) => {
        setEditingNews(newsItem);
        setUploadedImageUrl(newsItem.imageUrl || '');
        form.setFieldsValue({
            ...newsItem,
            publishedAt: newsItem.publishedAt ? dayjs(newsItem.publishedAt) : null,
        });
        setIsModalVisible(true);
    };

    const handleViewNews = (newsItem: News) => {
        setViewingNews(newsItem);
        setIsViewModalVisible(true);
    };

    const handleDeleteNews = async (id: string) => {
        try {
            const response = await newsService.deleteNews(id);
            if (response.success) {
                setNewsList(newsList.filter(item => item._id !== id));
                message.success('Xóa tin tức thành công');
            } else {
                message.error(response.message || 'Xóa tin tức thất bại');
            }
        } catch {
            message.error('Xóa tin tức thất bại');
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const uploadedFile = await uploadImage(file);
            const imageUrl = getFileUrl(uploadedFile.$id);
            setUploadedImageUrl(imageUrl);
            form.setFieldsValue({ imageUrl: imageUrl });
            message.success('Tải ảnh lên thành công!');
            return imageUrl;
        } catch (error) {
            message.error('Tải ảnh lên thất bại!');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitForm = async (values: any) => {
        try {
            const newsData = {
                title: values.title,
                content: values.content,
                author: values.author || 'Quản trị viên',
                imageUrl: uploadedImageUrl || values.imageUrl || '',
                status: 'published' as const,
                publishedAt: values.publishedAt ? values.publishedAt.toISOString() : undefined,
            };

            if (editingNews) {
                const response = await newsService.updateNews(editingNews._id, newsData);
                if (response.success) {
                    setNewsList(newsList.map(item =>
                        item._id === editingNews._id ? response.data : item
                    ));
                    message.success('Cập nhật tin tức thành công');
                } else {
                    message.error(response.message || 'Cập nhật tin tức thất bại');
                }
            } else {
                const response = await newsService.createNews(newsData);
                if (response.success) {
                    setNewsList([...newsList, response.data]);
                    message.success('Thêm tin tức thành công');
                } else {
                    message.error(response.message || 'Thêm tin tức thất bại');
                }
            }

            setIsModalVisible(false);
            setUploadedImageUrl('');
            form.resetFields();
        } catch {
            message.error('Lưu tin tức thất bại');
        }
    };

    const tableColumns = [
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
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            ellipsis: true,
            render: (content: string) => {
                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(content);
                return (
                    <div style={{ maxWidth: 300 }}>
                        {textContent.length > 100 ? `${textContent.substring(0, 100)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            render: (date: string) =>
                date ? dayjs(date).format('YYYY-MM-DD HH:mm') : 'Chưa đăng',
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
                        onClick={() => handleViewNews(record)}
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditNews(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa tin tức này?"
                        onConfirm={() => handleDeleteNews(record._id)}
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNews}>
                        Thêm tin tức
                    </Button>
                </Col>
            </Row>

            <Table
                columns={tableColumns}
                dataSource={filteredNewsList}
                rowKey="_id"
                loading={isLoading}
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
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setUploadedImageUrl('');
                    form.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitForm}
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
                        label="Nội dung"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '200px', marginBottom: '50px' }}
                            placeholder="Nhập nội dung tin tức..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày đăng"
                        name="publishedAt"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày đăng!' }]}
                        hidden
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="URL Ảnh" name="imageUrl" hidden>
                        <Input placeholder="Nhập URL ảnh hoặc tải ảnh lên bên dưới" />
                    </Form.Item>

                    <Form.Item label="Tải ảnh lên">
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={(file) => {
                                const isImage = file.type.startsWith('image/');
                                if (!isImage) {
                                    message.error('Chỉ được tải lên file ảnh!');
                                    return false;
                                }
                                const isLt5M = file.size / 1024 / 1024 < 5;
                                if (!isLt5M) {
                                    message.error('Ảnh phải nhỏ hơn 5MB!');
                                    return false;
                                }
                                handleImageUpload(file);
                                return false;
                            }}
                            onRemove={() => {
                                setUploadedImageUrl('');
                                form.setFieldsValue({ imageUrl: '' });
                                return true;
                            }}
                            fileList={uploadedImageUrl ? [{
                                uid: '1',
                                name: 'image.png',
                                status: 'done',
                                url: uploadedImageUrl,
                            }] : []}
                        >
                            {!uploadedImageUrl && !uploading && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </div>
                            )}
                            {uploading && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Đang tải...</div>
                                </div>
                            )}
                        </Upload>

                        {(uploadedImageUrl || form.getFieldValue('imageUrl')) && (
                            <div style={{ marginTop: 8 }}>
                                <Image
                                    src={uploadedImageUrl || form.getFieldValue('imageUrl')}
                                    alt="preview"
                                    width={200}
                                />
                                <br />
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setUploadedImageUrl('');
                                        form.setFieldsValue({ imageUrl: '' });
                                    }}
                                    style={{ marginTop: 8 }}
                                >
                                    Xóa ảnh
                                </Button>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => {
                                setIsModalVisible(false);
                                setUploadedImageUrl('');
                                form.resetFields();
                            }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={uploading}>
                                {editingNews ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chi tiết tin tức"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
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
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Nội dung</h3>
                                <div style={{
                                    backgroundColor: '#fafafa',
                                    padding: 16,
                                    borderRadius: 6,
                                    border: '1px solid #d9d9d9',
                                    lineHeight: 1.8,
                                    fontSize: 14,
                                    minHeight: 100
                                }}>
                                    {viewingNews.content ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: viewingNews.content
                                            }}
                                            className="quill-content"
                                        />
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