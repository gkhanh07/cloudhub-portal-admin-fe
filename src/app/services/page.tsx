'use client';

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Upload,
    Popconfirm,
    Space,
    message,
    Row,
    Col,
    Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { serviceService } from '../../service/services';
import { Service } from '../../interface/service';
import { uploadImage, getFileUrl } from '../../store/appwrite';

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

const ServicesPage = () => {
    const [servicesList, setServicesList] = useState<Service[]>([]);
    const [filteredServicesList, setFilteredServicesList] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [viewingService, setViewingService] = useState<Service | null>(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

    useEffect(() => {
        loadServicesList();
    }, []);

    useEffect(() => {
        setFilteredServicesList(
            servicesList.filter(item =>
                item.title?.toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [servicesList, searchText]);

    const loadServicesList = async () => {
        setIsLoading(true);
        try {
            console.log('🔍 Đang tải danh sách services...');
            const response = await serviceService.getAllServices();
            console.log('📥 Response từ server:', response);
            if (response.success) {
                console.log('✅ Danh sách services:', response.data);
                setServicesList(Array.isArray(response.data) ? response.data : []);
            } else {
                console.log('❌ Lỗi tải danh sách:', response.message);
                message.error(response.message || 'Không tải được ưu điểm dịch vụ');
            }
        } catch (error) {
            console.error('💥 Lỗi khi tải danh sách services:', error);
            message.error('Không tải được ưu điểm dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddService = () => {
        setEditingService(null);
        form.resetFields();
        setUploadedImageUrl('');
        setIsModalVisible(true);
    };

    const handleEditService = (serviceItem: Service) => {
        setEditingService(serviceItem);
        setUploadedImageUrl(serviceItem.imageUrl || '');
        form.setFieldsValue(serviceItem);
        setIsModalVisible(true);
    };

    const handleViewService = (serviceItem: Service) => {
        setViewingService(serviceItem);
        setIsViewModalVisible(true);
    };

    const handleDeleteService = async (id: string) => {
        try {
            console.log('🗑️ Đang xóa service ID:', id);
            const response = await serviceService.deleteService(id);
            console.log('✅ Response xóa:', response);
            if (response.success) {
                setServicesList(servicesList.filter(item => item._id !== id));
                message.success('Xóa ưu điểm dịch vụ thành công');
            } else {
                console.log('❌ Lỗi xóa:', response.message);
                message.error(response.message || 'Xóa ưu điểm dịch vụ thất bại');
            }
        } catch (error) {
            console.error('💥 Lỗi khi xóa service:', error);
            message.error('Xóa ưu điểm dịch vụ thất bại');
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
            const serviceData = {
                title: values.title,
                description: values.description,
                imageUrl: uploadedImageUrl || values.imageUrl || '',
            };

            console.log('📤 Dữ liệu gửi về server:', serviceData);
            console.log('📝 Form values:', values);
            console.log('📷 Uploaded Image URL:', uploadedImageUrl);

            if (editingService) {
                console.log('🔄 Đang cập nhật service ID:', editingService._id);
                const response = await serviceService.updateService(editingService._id, serviceData);
                console.log('✅ Response cập nhật:', response);
                if (response.success) {
                    setServicesList(servicesList.map(item =>
                        item._id === editingService._id ? response.data : item
                    ));
                    message.success('Cập nhật ưu điểm dịch vụ thành công');
                } else {
                    console.log('❌ Lỗi cập nhật:', response.message);
                    message.error(response.message || 'Cập nhật ưu điểm dịch vụ thất bại');
                }
            } else {
                console.log('➕ Đang tạo service mới');
                const response = await serviceService.createService(serviceData);
                console.log('✅ Response tạo mới:', response);
                if (response.success) {
                    setServicesList([...servicesList, response.data]);
                    message.success('Thêm ưu điểm dịch vụ thành công');
                } else {
                    console.log('❌ Lỗi tạo mới:', response.message);
                    message.error(response.message || 'Thêm ưu điểm dịch vụ thất bại');
                }
            }

            setIsModalVisible(false);
            setUploadedImageUrl('');
            form.resetFields();
        } catch (error) {
            console.error('💥 Lỗi khi lưu service:', error);
            message.error('Lưu ưu điểm dịch vụ thất bại');
        }
    };

    const tableColumns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Service, b: Service) => a.title.localeCompare(b.title),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 350,
            ellipsis: true,
            render: (description: string) => {
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
                    <div style={{ maxWidth: 350 }}>
                        {textContent.length > 100 ? `${textContent.substring(0, 100)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 120,
            render: (imageUrl: string) => (
                <Image
                    src={imageUrl || 'https://via.placeholder.com/300x200/1890ff/ffffff?text=Không+có+ảnh'}
                    alt="Ảnh ưu điểm dịch vụ"
                    width={80}
                    height={60}
                    style={{ objectFit: 'cover' }}
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_: any, record: Service) => (
                <Space>
                    <Button
                        type="default"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewService(record)}
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditService(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa ưu điểm dịch vụ này?"
                        onConfirm={() => handleDeleteService(record._id)}
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
                    <h1>Quản lý ưu điểm dịch vụ</h1>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddService}>
                        Thêm ưu điểm dịch vụ
                    </Button>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Input.Search
                        placeholder="Tìm kiếm theo tiêu đề"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
            </Row>

            <Table
                columns={tableColumns}
                dataSource={filteredServicesList}
                rowKey="_id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} trong tổng ${total} mục`,
                }}
                scroll={{ x: 900 }}
            />

            {/* Add/Edit Modal */}
            <Modal
                title={editingService ? 'Chỉnh sửa ưu điểm dịch vụ' : 'Thêm ưu điểm dịch vụ'}
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
                        <Input placeholder="Nhập tiêu đề ưu điểm dịch vụ" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '200px', marginBottom: '50px' }}
                            placeholder="Nhập mô tả ưu điểm dịch vụ..."
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
                                {editingService ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Chi tiết ưu điểm dịch vụ"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {viewingService && (
                    <div style={{ padding: '16px 0' }}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Tiêu đề</h3>
                                <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
                                    {viewingService.title}
                                </p>
                            </Col>
                        </Row>

                        {viewingService.imageUrl && (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Hình ảnh</h3>
                                    <Image
                                        src={viewingService.imageUrl}
                                        alt="Ảnh ưu điểm dịch vụ"
                                        width="100%"
                                        style={{ maxWidth: 400, marginBottom: 16 }}
                                    />
                                </Col>
                            </Row>
                        )}

                        <Row gutter={[16, 16]}>
                            <Col span={24}>
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
                                    {viewingService.description ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: viewingService.description
                                            }}
                                            className="quill-content"
                                        />
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic' }}>
                                            Không có mô tả
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

export default ServicesPage;
