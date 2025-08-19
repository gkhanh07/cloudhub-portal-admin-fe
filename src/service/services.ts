import apiClient from "../config/axios";
import { Service, CreateServiceRequest, UpdateServiceRequest } from "../../interface/service";

export interface ServicesResponse {
    success: boolean;
    data: Service[];
    message?: string;
}

export interface ServiceResponse {
    success: boolean;
    data: Service;
    message?: string;
}

export const serviceService = {
    // Public routes - no authentication required
    getAllServices: async (): Promise<ServicesResponse> => {
        try {
            const response = await apiClient.get('/services');
            return response.data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    },

    getServiceById: async (id: string): Promise<ServiceResponse> => {
        try {
            const response = await apiClient.get(`/services/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching service with id ${id}:`, error);
            throw error;
        }
    },

    // Admin-only routes - authentication required
    createService: async (serviceData: CreateServiceRequest): Promise<ServiceResponse> => {
        try {
            const response = await apiClient.post('/services', serviceData);
            return response.data;
        } catch (error) {
            console.error('Error creating service:', error);
            throw error;
        }
    },

    updateService: async (id: string, serviceData: UpdateServiceRequest): Promise<ServiceResponse> => {
        try {
            const response = await apiClient.put(`/services/${id}`, serviceData);
            return response.data;
        } catch (error) {
            console.error(`Error updating service with id ${id}:`, error);
            throw error;
        }
    },

    deleteService: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/services/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting service with id ${id}:`, error);
            throw error;
        }
    }
};
