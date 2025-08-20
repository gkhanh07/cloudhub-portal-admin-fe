export interface HomeText {
    _id: string;
    title: string;
    text: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateHomeTextRequest {
    title: string;
    text: string;
}

export interface UpdateHomeTextRequest {
    title?: string;
    text?: string;
}

export interface HomeTextResponse {
    success: boolean;
    data: HomeText;
    message?: string;
}

export interface HomeTextsResponse {
    success: boolean;
    data: HomeText[];
    message?: string;
}
