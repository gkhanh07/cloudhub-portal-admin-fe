'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { contactService } from '../../service/contact-info';
import { ContactInfo } from '../../interface/contact-info';

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

const ContactInfoPage: React.FC = () => {
    const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingContactInfo, setEditingContactInfo] = useState<ContactInfo | null>(null);
    const [viewingContactInfo, setViewingContactInfo] = useState<ContactInfo | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadContactInfos();
    }, []);

    const loadContactInfos = async () => {
        setLoading(true);
        try {
            const response = await contactService.getAllContactInfo();
            setContactInfos(response.data);
        } catch (error) {
            message.error('Không thể tải thông tin liên hệ');
        } finally {
            setLoading(false);
        }
    };

    const showAddModal = () => {
        setEditingContactInfo(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (contactInfo: ContactInfo) => {
        setEditingContactInfo(contactInfo);
        form.setFieldsValue(contactInfo);
        setIsModalVisible(true);
    };

    const showViewModal = (contactInfo: ContactInfo) => {
        setViewingContactInfo(contactInfo);
        setIsViewModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingContactInfo(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Nếu không nhập gì thì form trả về undefined, mình ép thành chuỗi rỗng để gửi server
            const payload = {
                email: values.email || "",
                phone: values.phone || "",
                address: values.address || "",
                helpdesk: values.helpdesk || ""
            };

            // 🔎 Log ra để debug
            console.log("📤 Payload gửi về server:", payload);

            if (editingContactInfo) {
                const response = await contactService.updateContactInfo(editingContactInfo._id, payload);
                setContactInfos(contactInfos.map(info =>
                    info._id === editingContactInfo._id ? response.data : info
                ));
                message.success('Cập nhật thông tin liên hệ thành công!');
            } else {
                const response = await contactService.createContactInfo(payload);
                setContactInfos([...contactInfos, response.data]);
                message.success('Thêm thông tin liên hệ thành công!');
            }

            handleCancel();
        } catch (error) {
            console.error("❌ Error khi submit:", error);
            message.error('Lưu thông tin liên hệ thất bại');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await contactService.deleteContactInfo(id);
            setContactInfos(contactInfos.filter(info => info._id !== id));
            message.success('Xóa thông tin liên hệ thành công!');
        } catch (error) {
            message.error('Xóa thông tin liên hệ thất bại');
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
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (email: string) => {
                if (!email) return 'Chưa có';

                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(email);
                return (
                    <div style={{ maxWidth: 200 }}>
                        {textContent.length > 30 ? `${textContent.substring(0, 30)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone: string) => {
                if (!phone) return 'Chưa có';

                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(phone);
                return (
                    <div style={{ maxWidth: 150 }}>
                        {textContent.length > 20 ? `${textContent.substring(0, 20)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: 300,
            ellipsis: true,
            render: (address: string) => {
                if (!address) return 'Chưa có';

                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(address);
                return (
                    <div style={{ maxWidth: 300 }}>
                        {textContent.length > 50 ? `${textContent.substring(0, 50)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Helpdesk',
            dataIndex: 'helpdesk',
            key: 'helpdesk',
            width: 200,
            render: (helpdesk: string) => {
                if (!helpdesk) return 'Chưa có';

                // Strip HTML tags for table display
                const stripHtml = (html: string) => {
                    if (typeof window !== 'undefined') {
                        const tmp = document.createElement('div');
                        tmp.innerHTML = html || '';
                        return tmp.textContent || tmp.innerText || '';
                    }
                    return html || '';
                };

                const textContent = stripHtml(helpdesk);
                return (
                    <div style={{ maxWidth: 200 }}>
                        {textContent.length > 30 ? `${textContent.substring(0, 30)}...` : textContent}
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 180,
            render: (_: any, record: ContactInfo) => (
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
                        description="Bạn có chắc muốn xóa thông tin liên hệ này?"
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
                <h1>Quản lý thông tin liên hệ</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    style={{ marginTop: 16 }}
                >
                    Thêm thông tin liên hệ
                </Button>
            </div>

            <Table
                dataSource={contactInfos}
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
                title={editingContactInfo ? 'Chỉnh sửa thông tin liên hệ' : 'Thêm thông tin liên hệ mới'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingContactInfo ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[]} // No validation rules applied
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '150px', marginBottom: '50px' }}
                            placeholder="Nhập thông tin email..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '150px', marginBottom: '50px' }}
                            placeholder="Nhập thông tin số điện thoại..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '200px', marginBottom: '50px' }}
                            placeholder="Nhập địa chỉ..."
                        />
                    </Form.Item>

                    <Form.Item
                        label="Helpdesk"
                        name="helpdesk"
                    >
                        <ReactQuill
                            modules={quillModules}
                            formats={quillFormats}
                            style={{ height: '150px', marginBottom: '50px' }}
                            placeholder="Nhập thông tin helpdesk..."
                        />
                    </Form.Item>

                </Form>
            </Modal>

            <Modal
                title="Chi tiết thông tin liên hệ"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {viewingContactInfo && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>ID</h3>
                            <p style={{ fontFamily: 'monospace', color: '#666', marginBottom: 16 }}>
                                {viewingContactInfo._id}
                            </p>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Email</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 60
                            }}>
                                {viewingContactInfo.email ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: viewingContactInfo.email
                                        }}
                                        className="quill-content"
                                        style={{ margin: 0 }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                                        Chưa có thông tin
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Số điện thoại</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 60
                            }}>
                                {viewingContactInfo.phone ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: viewingContactInfo.phone
                                        }}
                                        className="quill-content"
                                        style={{ margin: 0 }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                                        Chưa có thông tin
                                    </p>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Helpdesk</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 60
                            }}>
                                {viewingContactInfo.helpdesk ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: viewingContactInfo.helpdesk
                                        }}
                                        className="quill-content"
                                        style={{ margin: 0 }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                                        Chưa có thông tin
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 style={{ marginBottom: 8, color: '#1890ff' }}>Địa chỉ</h3>
                            <div style={{
                                backgroundColor: '#fafafa',
                                padding: 16,
                                borderRadius: 6,
                                border: '1px solid #d9d9d9',
                                lineHeight: 1.8,
                                fontSize: 14,
                                minHeight: 60
                            }}>
                                {viewingContactInfo.address ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: viewingContactInfo.address
                                        }}
                                        className="quill-content"
                                        style={{ margin: 0 }}
                                    />
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                                        Chưa có thông tin
                                    </p>
                                )}
                            </div>
                        </div>

                        {(viewingContactInfo.createdAt || viewingContactInfo.updatedAt) && (
                            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                                {viewingContactInfo.createdAt && (
                                    <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#666' }}>
                                        <strong>Tạo lúc:</strong> {new Date(viewingContactInfo.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                )}
                                {viewingContactInfo.updatedAt && (
                                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                                        <strong>Cập nhật lúc:</strong> {new Date(viewingContactInfo.updatedAt).toLocaleString('vi-VN')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ContactInfoPage;
