



import apiClient from "../config/axios";

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

export const contactService = {
    getAllContactInfo: async (): Promise<ContactInfoResponse> => {
        try {
            const response = await apiClient.get('/contact-info');
            return response.data;
        } catch (error) {
            console.error('Error fetching contact info:', error);
            throw error;
        }
    },

    getContactInfoById: async (id: string): Promise<SingleContactInfoResponse> => {
        try {
            const response = await apiClient.get(`/contact-info/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching contact info with id ${id}:`, error);
            throw error;
        }
    },

    // Admin-only routes - authentication required
    createContactInfo: async (contactData: CreateContactInfoRequest): Promise<SingleContactInfoResponse> => {
        try {
            const response = await apiClient.post('/contact-info', contactData);
            return response.data;
        } catch (error) {
            console.error('Error creating contact info:', error);
            throw error;
        }
    },

    updateContactInfo: async (id: string, contactData: UpdateContactInfoRequest): Promise<SingleContactInfoResponse> => {
        try {
            const response = await apiClient.put(`/contact-info/${id}`, contactData);
            return response.data;
        } catch (error) {
            console.error(`Error updating contact info with id ${id}:`, error);
            throw error;
        }
    },

    deleteContactInfo: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/contact-info/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting contact info with id ${id}:`, error);
            throw error;
        }
    }
};
