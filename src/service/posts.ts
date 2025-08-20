import apiClient from '../config/axios';
import { Post, CreatePostRequest, UpdatePostRequest } from '../interface/posts';


// Get all posts
export const getPosts = async (): Promise<Post[]> => {
    try {
        const response = await apiClient.get('/posts');
        const data = response.data;

        // Đảm bảo luôn trả về mảng
        if (Array.isArray(data)) {
            return data;
        }

        // Nếu API trả về { data: [...] }
        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        // Trường hợp còn lại: trả về mảng rỗng
        return [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Tránh throw nếu muốn Table vẫn render mà không lỗi
    }
};


// Get post by ID
export const getPostById = async (id: number): Promise<Post> => {
    try {
        const response = await apiClient.get(`/posts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
};

// Create new post
export const createPost = async (postData: CreatePostRequest): Promise<Post> => {
    try {
        const response = await apiClient.post('/posts', postData);
        return response.data;
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
};

// Update post
export const updatePost = async (postData: UpdatePostRequest): Promise<Post> => {
    try {
        const response = await apiClient.put(`/posts/${postData.id}`, postData);
        return response.data;
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/posts/${id}`);
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};