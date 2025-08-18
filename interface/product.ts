export interface Product {
    _id: string;
    name: string;
    cpu: string;
    gpu: string;
    memory_gb: number;
    disk_ssd_gb: number;
    ip: string;
    os: string;
    bandwidth: string;
    price_per_month: number;
    link?: string;
    category: {
        _id: string;
        name: string;
    } | string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductRequest {
    name: string;
    cpu: string;
    gpu: string;
    memory_gb: number;
    disk_ssd_gb: number;
    ip: string;
    os: string;
    bandwidth: string;
    price_per_month: number;
    link: string;
    category: string; // ObjectId as string
}

export interface UpdateProductRequest {
    name?: string;
    cpu?: string;
    gpu?: string;
    memory_gb?: number;
    disk_ssd_gb?: number;
    ip?: string;
    os?: string;
    bandwidth?: string;
    price_per_month?: number;
    link?: string;
    category?: string;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    message?: string;
}

export interface ProductResponse {
    success: boolean;
    data: Product;
    message?: string;
}