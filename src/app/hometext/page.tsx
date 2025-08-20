'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { homeTextService } from '../../service/homeText';
import { HomeText } from '../../interface/homeText';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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

const HomeTextPage: React.FC = () => {
    const [homeTexts, setHomeTexts] = useState<HomeText[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingHomeText, setEditingHomeText] = useState<HomeText | null>(null);
    const [viewingHomeText, setViewingHomeText] = useState<HomeText | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadHomeTexts();
    }, []);

    const loadHomeTexts = async () => {
        setLoading(true);
        try {
            const response = await homeTextService.getAllHomeText();
            setHomeTexts(response.data);
        } catch (error) {
            message.error('Không thể tải home text');
        } finally {
            setLoading(false);
        }
    };

    const showAddModal = () => {
        setEditingHomeText(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (homeText: HomeText) => {
        setEditingHomeText(homeText);
        form.setFieldsValue(homeText);
        setIsModalVisible(true);
    };

    const showViewModal = (homeText: HomeText) => {
        setViewingHomeText(homeText);
        setIsViewModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingHomeText(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingHomeText) {
                const response = await homeTextService.updateHomeText(editingHomeText._id, values);
                setHomeTexts(homeTexts.map(item =>
                    item._id === editingHomeText._id ? response.data : item
                ));
                message.success('Cập nhật home text thành công!');
            } else {
                const response = await homeTextService.createHomeText(values);
                setHomeTexts([...homeTexts, response.data]);
                message.success('Thêm home text thành công!');
            }

            handleCancel();
        } catch (error) {
            message.error('Lưu home text thất bại');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await homeTextService.deleteHomeText(id);
            setHomeTexts(homeTexts.filter(item => item._id !== id));
            message.success('Xóa home text thành công!');
        } catch (error) {
            message.error('Xóa home text thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 100,
            render: (id: string) => id.slice(-6),
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Nội dung',
            dataIndex: 'text',
            key: 'text',
            ellipsis: true,
            render: (text: string) => {
                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(text);
                return (
                    <div style={{ maxWidth: 300 }}>
                        {textContent.length > 100 ? `${textContent.substring(0, 100)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => {
                if (!date) return '-';
                return new Date(date).toLocaleDateString('vi-VN');
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_: any, record: HomeText) => (
                <Space>
                    <Button
                        type="default"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showViewModal(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa home text này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <h1>Quản lý Home Text</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    style={{ marginTop: 16 }}
                >
                    Thêm Home Text
                </Button>
            </div>

            <Table
                dataSource={homeTexts}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mục`,
                }}
            />

            <Modal
                title={editingHomeText ? 'Chỉnh sửa Home Text' : 'Thêm Home Text mới'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingHomeText ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tiêu đề!' },
                            { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập tiêu đề..." />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung"
                        name="text"
                        rules={[
                            { required: true, message: 'Vui lòng nhập nội dung!' },
                            { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự!' }
                        ]}
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '200px', marginBottom: '50px' }}
                            placeholder="Nhập nội dung home text..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chi tiết Home Text"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {viewingHomeText && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>ID</h3>
                            <p style={{ fontFamily: 'monospace', color: '#666', marginBottom: 16 }}>
                                {viewingHomeText._id}
                            </p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Tiêu đề</h3>
                            <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
                                {viewingHomeText.title}
                            </p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Ngày tạo</h3>
                            <p style={{ color: '#666', marginBottom: 16 }}>
                                {viewingHomeText.createdAt ?
                                    new Date(viewingHomeText.createdAt).toLocaleString('vi-VN') :
                                    'Không có thông tin'
                                }
                            </p>
                        </div>

                        {viewingHomeText.updatedAt && (
                            <div style={{ marginBottom: 24 }}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Ngày cập nhật</h3>
                                <p style={{ color: '#666', marginBottom: 16 }}>
                                    {new Date(viewingHomeText.updatedAt).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}

                        <div>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Nội dung</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 150
                            }}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: viewingHomeText.text
                                    }}
                                    className="quill-content"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HomeTextPage;
