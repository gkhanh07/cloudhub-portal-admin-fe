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

    // Load categories on mount
    useEffect(() => {
        loadCategories();
    }, []);

    // API Functions
    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            message.error('Failed to load categories');
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
                message.success('Category updated successfully!');
            } else {
                const response = await categoryService.createCategory(values);
                setCategories([...categories, response.data]);
                message.success('Category created successfully!');
            }

            handleCancel();
        } catch (error) {
            message.error('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await categoryService.deleteCategory(id);
            setCategories(categories.filter(cat => cat._id !== id));
            message.success('Category deleted successfully!');
        } catch (error) {
            message.error('Failed to delete category');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 100,
            render: (id: string) => id.slice(-6), // Show last 6 characters
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
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
                        Edit
                    </Button>
                    <Popconfirm
                        title="Confirm Delete"
                        description="Are you sure you want to delete this category?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
                <h1>Categories Management</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    style={{ marginTop: 16 }}
                >
                    Add Category
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
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
            />

            <Modal
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingCategory ? 'Update' : 'Create'}
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please input category name!' },
                            { min: 2, message: 'Category name must be at least 2 characters!' }
                        ]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter category description (optional)"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoriesPage;
