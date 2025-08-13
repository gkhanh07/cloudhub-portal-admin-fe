'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryService, Category } from '../../service/categories';

const CategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_: any, record: Category) => (
                <Space>
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
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập mô tả danh mục (không bắt buộc)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
