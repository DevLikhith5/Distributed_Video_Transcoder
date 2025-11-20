export declare class AppError extends Error {
    message: string;
    statusCode: number;
    details?: unknown | undefined;
    constructor(message: string, statusCode?: number, details?: unknown | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class AuthError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ExternalServiceError extends AppError {
    constructor(message?: string, statusCode?: number, details?: unknown);
}
//# sourceMappingURL=error.d.ts.map