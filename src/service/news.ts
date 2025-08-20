import apiClient from "../config/axios";
import { CreateNewsRequest, UpdateNewsRequest, NewsResponse, SingleNewsResponse, UploadImageResponse } from "../interface/news";

export const newsService = {
    // Public routes - no authentication required
    getAllNews: async (): Promise<NewsResponse> => {
        try {
            const response = await apiClient.get('/news');
            return response.data;
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    },

    getNewsById: async (id: string): Promise<SingleNewsResponse> => {
        try {
            const response = await apiClient.get(`/news/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching news with id ${id}:`, error);
            throw error;
        }
    },

    // Admin & Editor routes - authentication required
    createNews: async (newsData: CreateNewsRequest): Promise<SingleNewsResponse> => {
        try {
            const response = await apiClient.post('/news', newsData);
            return response.data;
        } catch (error) {
            console.error('Error creating news:', error);
            throw error;
        }
    },

    updateNews: async (id: string, newsData: UpdateNewsRequest): Promise<SingleNewsResponse> => {
        try {
            const response = await apiClient.put(`/news/${id}`, newsData);
            return response.data;
        } catch (error) {
            console.error(`Error updating news with id ${id}:`, error);
            throw error;
        }
    },

    // Admin only route - authentication required
    deleteNews: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/news/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting news with id ${id}:`, error);
            throw error;
        }
    },

    // Upload image for news - Admin only
    uploadImage: async (file: File): Promise<UploadImageResponse> => {
        try {
            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('image', file);

            // Gửi request với Content-Type multipart/form-data
            const response = await apiClient.post('/news/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
};