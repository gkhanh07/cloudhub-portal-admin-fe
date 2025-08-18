'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { categoryService, Category } from '../../service/categories';

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

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            message.error('Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    };

    const showAddModal = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (category: Category) => {
        setEditingCategory(category);
        form.setFieldsValue(category);
        setIsModalVisible(true);
    };

    const showViewModal = (category: Category) => {
        setViewingCategory(category);
        setIsViewModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingCategory(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingCategory) {
                const response = await categoryService.updateCategory(editingCategory._id, values);
                setCategories(categories.map(cat =>
                    cat._id === editingCategory._id ? response.data : cat
                ));
                message.success('Cập nhật danh mục thành công!');
            } else {
                const response = await categoryService.createCategory(values);
                setCategories([...categories, response.data]);
                message.success('Thêm danh mục thành công!');
            }

            handleCancel();
        } catch (error) {
            message.error('Lưu danh mục thất bại');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await categoryService.deleteCategory(id);
            setCategories(categories.filter(cat => cat._id !== id));
            message.success('Xóa danh mục thành công!');
        } catch (error) {
            message.error('Xóa danh mục thất bại');
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
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            ellipsis: true,
            render: (description: string) => {
                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(description);
                return (
                    <div style={{ maxWidth: 300 }}>
                        {textContent.length > 100 ? `${textContent.substring(0, 100)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_: any, record: Category) => (
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
                        description="Bạn có chắc muốn xóa danh mục này?"
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
                <h1>Quản lý danh mục</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    style={{ marginTop: 16 }}
                >
                    Thêm danh mục
                </Button>
            </div>

            <Table
                dataSource={categories}
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
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục!' },
                            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '150px', marginBottom: '50px' }}
                            placeholder="Nhập mô tả danh mục (không bắt buộc)..."
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Chi tiết danh mục"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {viewingCategory && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Tên danh mục</h3>
                            <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
                                {viewingCategory.name}
                            </p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>ID</h3>
                            <p style={{ fontFamily: 'monospace', color: '#666', marginBottom: 16 }}>
                                {viewingCategory._id}
                            </p>
                        </div>

                        <div>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Mô tả</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 100
                            }}>
                                {viewingCategory.description ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: viewingCategory.description
                                        }}
                                        className="quill-content"
                                    />
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic' }}>
                                        Không có mô tả
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CategoriesPage;
