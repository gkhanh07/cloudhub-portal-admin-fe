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
