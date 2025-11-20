"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalServiceError = exports.DatabaseError = exports.UnprocessableEntityError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.AuthError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    message;
    statusCode;
    details;
    constructor(message, statusCode = 500, details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = new.target.name;
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = "Validation failed", details) {
        super(message, 400, details);
    }
}
exports.ValidationError = ValidationError;
class AuthError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.AuthError = AuthError;
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class UnprocessableEntityError extends AppError {
    constructor(message = "Unprocessable entity") {
        super(message, 422);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class DatabaseError extends AppError {
    constructor(message = "Database error", details) {
        super(message, 500, details);
    }
}
exports.DatabaseError = DatabaseError;
class ExternalServiceError extends AppError {
    constructor(message = "External service error", statusCode = 502, details) {
        super(message, statusCode, details);
    }
}
exports.ExternalServiceError = ExternalServiceError;
//# sourceMappingURL=error.js.map