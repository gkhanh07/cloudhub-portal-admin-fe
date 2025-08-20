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

export interface UploadImageResponse {
    success: boolean;
    data: {
        imageUrl: string;
        fileName: string;
    };
    message?: string;
}
