export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;

        // giữ nguyên stack trace (quan trọng cho debug)
        Error.captureStackTrace(this, this.constructor);
    }
}