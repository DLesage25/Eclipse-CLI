export interface ApiResponse<T> {
    payload: T;
    statusCode: number;
    message: string;
}
