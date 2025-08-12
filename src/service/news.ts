import apiClient from "../config/axios";

export interface News {
    _id: string;
    title: string;
    content: string;
    summary?: string;
    author: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateNewsRequest {
    title: string;
    content: string;
    summary?: string;
    author: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    status: 'draft' | 'published' | 'archived';
    publishedAt?: string;
}

export interface UpdateNewsRequest {
    title?: string;
    content?: string;
    summary?: string;
    author?: string;
    category?: string;
    tags?: string[];
    imageUrl?: string;
    status?: 'draft' | 'published' | 'archived';
    publishedAt?: string;
}

export interface NewsResponse {
    success: boolean;
    data: News[];
    message?: string;
}

export interface SingleNewsResponse {
    success: boolean;
    data: News;
    message?: string;
}

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
    }
};