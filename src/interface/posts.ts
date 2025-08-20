export interface Post {
    _id: number;
    name: string;
    content: string;
    price: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePostRequest {
    name: string;
    content: string;
    price: number;
}

export interface UpdatePostRequest extends CreatePostRequest {
    id: number;
}