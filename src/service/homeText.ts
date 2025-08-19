import apiClient from "../config/axios";
import {
    HomeText,
    CreateHomeTextRequest,
    UpdateHomeTextRequest,
    HomeTextResponse,
    HomeTextsResponse
} from "../../interface/homeText";

export const homeTextService = {
    // Public routes - no authentication required
    getAllHomeText: async (): Promise<HomeTextsResponse> => {
        try {
            const response = await apiClient.get('/home-text');
            return response.data;
        } catch (error) {
            console.error('Error fetching home text:', error);
            throw error;
        }
    },

    getHomeTextById: async (id: string): Promise<HomeTextResponse> => {
        try {
            const response = await apiClient.get(`/home-text/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching home text with id ${id}:`, error);
            throw error;
        }
    },

    // Admin routes - authentication and authorization required
    createHomeText: async (homeTextData: CreateHomeTextRequest): Promise<HomeTextResponse> => {
        try {
            const response = await apiClient.post('/home-text', homeTextData);
            return response.data;
        } catch (error) {
            console.error('Error creating home text:', error);
            throw error;
        }
    },

    updateHomeText: async (id: string, homeTextData: UpdateHomeTextRequest): Promise<HomeTextResponse> => {
        try {
            const response = await apiClient.put(`/home-text/${id}`, homeTextData);
            return response.data;
        } catch (error) {
            console.error(`Error updating home text with id ${id}:`, error);
            throw error;
        }
    },

    deleteHomeText: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/home-text/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting home text with id ${id}:`, error);
            throw error;
        }
    }
};