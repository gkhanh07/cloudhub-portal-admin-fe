export interface ContactInfo {
    _id: string;
    email?: string;
    phone?: string;
    address?: string;
    helpdesk?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateContactInfoRequest {
    email?: string;
    phone?: string;
    address?: string;
    helpdesk?: string;
}

export interface UpdateContactInfoRequest {
    email?: string;
    phone?: string;
    address?: string;
    helpdesk?: string;
}

export interface ContactInfoResponse {
    success: boolean;
    data: ContactInfo[];
    message?: string;
}

export interface SingleContactInfoResponse {
    success: boolean;
    data: ContactInfo;
    message?: string;
}
