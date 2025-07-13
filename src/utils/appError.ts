export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    errorCode?: string;
    metadata?: any;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode?: string,
        metadata?: any
    ) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = errorCode;
        this.metadata = metadata;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class ValidationError extends AppError {
    constructor(message: string, field?: string) {
        super(message, 400, 'VALIDATION_ERROR', { field });
    }
}


export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
    }
}

export class BusinessLogicError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 400, code || 'BUSINESS_LOGIC_ERROR');
    }
}

export class InvalidCategoryError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 400, code || 'INVALID_CATEGORY_ERROR');
    }
}