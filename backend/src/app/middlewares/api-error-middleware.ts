import { Request, Response, NextFunction } from 'express';
import { ApiException } from '../error/api-exception';
import { ApiResponse } from '../helpers/api-response';

export function apiErrorHandler(
    error: ApiException | Error,
    request: Request,
    response: Response,
    next: NextFunction
): void {
    console.error(error);

    // Check if it's an ApiException with details
    const data: Record<string, any> = {};
    if (error instanceof ApiException && error.details) {
        for (const [key, val] of Object.entries(error.details)) {
            data[key] = val;
        }
    }

    // Determine status code and message
    const statusCode = error instanceof ApiException ? error.httpCode : 500;
    const message = error.message || 'Internal server error';

    response.status(statusCode).send(
        new ApiResponse(
            statusCode,
            data,
            message
        )
    );
}
