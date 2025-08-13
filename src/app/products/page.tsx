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
import { Product } from '../../../interface/product';
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

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [products, searchText]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getAllProducts();
            setProducts(response.data);
        } catch {
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch {
            message.error('Không thể tải danh sách danh mục');
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
            message.success('Xóa sản phẩm thành công');
        } catch {
            message.error('Xóa sản phẩm thất bại');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingProduct) {
                const response = await productService.updateProduct(editingProduct._id, values);
                setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
                message.success('Cập nhật sản phẩm thành công');
            } else {
                const response = await productService.createProduct(values);
                setProducts([...products, response.data]);
                message.success('Thêm sản phẩm thành công');
            }
            setModalVisible(false);
            form.resetFields();
        } catch {
            message.error('Lưu sản phẩm thất bại');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            render: (id: string) => id.slice(-6),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Product, b: Product) => a.name.localeCompare(b.name),
        },
        { title: 'CPU', dataIndex: 'cpu', key: 'cpu' },
        { title: 'GPU (GB)', dataIndex: 'gpu', key: 'gpu' },
        { title: 'Memory (GB)', dataIndex: 'memory_gb', key: 'memory_gb', width: 120 },
        { title: 'Disk SSD (GB)', dataIndex: 'disk_ssd_gb', key: 'disk_ssd_gb', width: 130 },
        { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
        { title: 'Hệ điều hành', dataIndex: 'os', key: 'os' },
        { title: 'Băng thông', dataIndex: 'bandwidth', key: 'bandwidth' },
        {
            title: 'Giá / Tháng',
            dataIndex: 'price_per_month',
            key: 'price_per_month',
            render: (price: number) => `${price.toLocaleString()}₫`,
            sorter: (a: Product, b: Product) => a.price_per_month - b.price_per_month,
            width: 120,
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (category: Category | string) =>
                typeof category === 'object' ? category.name : category,
        },
        {
            title: 'Hành động',
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
                        title="Bạn có chắc muốn xóa sản phẩm này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} size="small" />
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
                        placeholder="Tìm kiếm sản phẩm theo tên"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm sản phẩm
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
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} sản phẩm`,
                }}
                scroll={{ x: 1400 }}
            />

            <Modal
                title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Tên sản phẩm" name="name">
                                <Input placeholder="VD: GOLD NVME 1-1-20 (Xeon 6148 2.4ghz)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="CPU" name="cpu">
                                <Input placeholder="VD: Xeon 6148 2.4ghz" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="GPU (GB)" name="gpu">
                                <InputNumber min={0} style={{ width: '100%' }} placeholder="8" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Memory (GB)" name="memory_gb">
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Disk SSD (GB)" name="disk_ssd_gb">
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="20" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="IP" name="ip">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Hệ điều hành" name="os">
                                <Select placeholder="Chọn hệ điều hành">
                                    <Select.Option value="Windows">Windows</Select.Option>
                                    <Select.Option value="Linux">Linux</Select.Option>
                                    <Select.Option value="Windows/Linux">Windows/Linux</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Băng thông" name="bandwidth">
                                <Select placeholder="Chọn băng thông">
                                    <Select.Option value="Không giới hạn">Không giới hạn</Select.Option>
                                    <Select.Option value="100 Mbps">100 Mbps</Select.Option>
                                    <Select.Option value="1 Gbps">1 Gbps</Select.Option>
                                    <Select.Option value="10 Gbps">10 Gbps</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Giá / Tháng (VNĐ)" name="price_per_month">
                                <InputNumber
                                    min={0}
                                    step={1000}
                                    style={{ width: '100%' }}
                                    placeholder="50000"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: string | undefined): number => {
                                        return Number(value?.replace(/\$\s?|(,*)/g, '') || 0);
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Danh mục" name="category">
                                <Select placeholder="Chọn danh mục">
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
                            <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsPage;