export interface Service {
    _id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateServiceRequest {
    title: string;
    description?: string;
    imageUrl?: string;
}

export interface UpdateServiceRequest {
    title?: string;
    description?: string;
    imageUrl?: string;
}
export interface ServicesResponse {
    success: boolean;
    data: Service[];
    message?: string;
}

export interface ServiceResponse {
    success: boolean;
    data: Service;
    message?: string;
}