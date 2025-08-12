import apiClient from "../config/axios";

export interface Category {
    _id: string;
    name: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
}

export interface CategoriesResponse {
    success: boolean;
    data: Category[];
    message?: string;
}

export interface CategoryResponse {
    success: boolean;
    data: Category;
    message?: string;
}

export const categoryService = {
    // Public routes - no authentication required
    getAllCategories: async (): Promise<CategoriesResponse> => {
        try {
            const response = await apiClient.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getCategoryById: async (id: string): Promise<CategoryResponse> => {
        try {
            const response = await apiClient.get(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching category with id ${id}:`, error);
            throw error;
        }
    },

    // Admin-only routes - authentication required
    createCategory: async (categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
        try {
            const response = await apiClient.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    updateCategory: async (id: string, categoryData: UpdateCategoryRequest): Promise<CategoryResponse> => {
        try {
            const response = await apiClient.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            console.error(`Error updating category with id ${id}:`, error);
            throw error;
        }
    },

    deleteCategory: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting category with id ${id}:`, error);
            throw error;
        }
    }
};