'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Popconfirm,
    Space,
    message,
    Row,
    Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { productService } from '../../service/products';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../../interface/product';
import { categoryService, Category as CategoryType } from '../../service/categories';
import { Category } from '../../../interface/categories';

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    // Load data on mount
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    // Filter products when search changes
    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [products, searchText]);

    // API Functions
    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAllProducts();
            setProducts(response.data);
        } catch (error) {
            message.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            message.error('Failed to load categories');
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        form.setFieldsValue(product);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
            message.success('Product deleted successfully');
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingProduct) {
                const response = await productService.updateProduct(editingProduct._id, values);
                setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
                message.success('Product updated successfully');
            } else {
                const response = await productService.createProduct(values);
                setProducts([...products, response.data]);
                message.success('Product created successfully');
            }
            setModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to save product');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            render: (id: string) => id.slice(-6), // Show last 6 characters
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
        },
        {
            title: 'CPU',
            dataIndex: 'cpu',
            key: 'cpu',
        },
        {
            title: 'GPU',
            dataIndex: 'gpu',
            key: 'gpu',
        },
        {
            title: 'Memory (GB)',
            dataIndex: 'memory_gb',
            key: 'memory_gb',
            width: 120,
        },
        {
            title: 'Disk SSD (GB)',
            dataIndex: 'disk_ssd_gb',
            key: 'disk_ssd_gb',
            width: 130,
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
        },
        {
            title: 'OS',
            dataIndex: 'os',
            key: 'os',
        },
        {
            title: 'Bandwidth',
            dataIndex: 'bandwidth',
            key: 'bandwidth',
        },
        {
            title: 'Price/Month',
            dataIndex: 'price_per_month',
            key: 'price_per_month',
            render: (price: number) => `$${price.toFixed(2)}`,
            sorter: (a: Product, b: Product) => a.price_per_month - b.price_per_month,
            width: 120,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: Category | string) =>
                typeof category === 'object' ? category.name : category,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this product?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
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
                        placeholder="Search products by name"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Add Product
                    </Button>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredProducts}
                rowKey="_id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
                scroll={{ x: 1400 }}
            />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input product name!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="CPU"
                                name="cpu"
                                rules={[{ required: true, message: 'Please input CPU!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="GPU"
                                name="gpu"
                                rules={[{ required: true, message: 'Please input GPU!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Memory (GB)"
                                name="memory_gb"
                                rules={[
                                    { required: true, message: 'Please input memory!' },
                                    { type: 'number', min: 1, message: 'Memory must be greater than 0!' }
                                ]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Disk SSD (GB)"
                                name="disk_ssd_gb"
                                rules={[
                                    { required: true, message: 'Please input disk size!' },
                                    { type: 'number', min: 1, message: 'Disk size must be greater than 0!' }
                                ]}
                            >
                                <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="IP Address"
                                name="ip"
                                rules={[{ required: true, message: 'Please input IP address!' }]}
                            >
                                <Input placeholder="192.168.1.1" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Operating System"
                                name="os"
                                rules={[{ required: true, message: 'Please input OS!' }]}
                            >
                                <Input placeholder="Ubuntu 22.04, Windows Server 2022" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Bandwidth"
                                name="bandwidth"
                                rules={[{ required: true, message: 'Please input bandwidth!' }]}
                            >
                                <Input placeholder="1 Gbps, 100 Mbps" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Price per Month"
                                name="price_per_month"
                                rules={[
                                    { required: true, message: 'Please input price!' },
                                    { type: 'number', min: 0.01, message: 'Price must be greater than 0!' }
                                ]}
                            >
                                <InputNumber
                                    min={0.01}
                                    step={0.01}
                                    precision={2}
                                    style={{ width: '100%' }}
                                    addonBefore="$"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[{ required: true, message: 'Please select category!' }]}
                            >
                                <Select placeholder="Select category">
                                    {categories.map(category => (
                                        <Select.Option key={category._id} value={category._id}>
                                            {category.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingProduct ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
