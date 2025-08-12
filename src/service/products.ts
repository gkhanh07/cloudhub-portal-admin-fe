import apiClient from "../config/axios";
import {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductsResponse,
    ProductResponse
} from "../../interface/product";

export const productService = {
    getAllProducts: async (): Promise<ProductsResponse> => {
        try {
            const response = await apiClient.get('/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    getProductById: async (id: number): Promise<ProductResponse> => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            throw error;
        }
    },

    createProduct: async (productData: CreateProductRequest): Promise<ProductResponse> => {
        try {
            const response = await apiClient.post('/products', productData);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    updateProduct: async (id: string, productData: UpdateProductRequest): Promise<ProductResponse> => {
        try {
            const response = await apiClient.put(`/products/${id}`, productData);
            return response.data;
        } catch (error) {
            console.error(`Error updating product with id ${id}:`, error);
            throw error;
        }
    },

    deleteProduct: async (id: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await apiClient.delete(`/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product with id ${id}:`, error);
            throw error;
        }
    }
};

