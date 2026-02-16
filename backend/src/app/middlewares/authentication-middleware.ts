import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiException, ExceptionDetails } from '../error/api-exception';
import { JWT_CONFIG, JWTPayload } from '../config/jwt-config';

/**
 * AUTHENTICATION MIDDLEWARE
 *
 * Verifies JWT token from Authorization header
 */

/**
 * EXTEND REQUEST TYPE
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const AuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiException(
        401,
        new ExceptionDetails(
          'unauthorized',
          'Authorization token is required. Please login.'
        )
      );
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiException(
        401,
        new ExceptionDetails(
          'invalid_token_format',
          'Invalid token format. Use: Bearer <token>'
        )
      );
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new ApiException(
        401,
        new ExceptionDetails(
          'unauthorized',
          'Authorization token is required. Please login.'
        )
      );
    }

    const decoded = jwt.verify(
      token,
      JWT_CONFIG.ACCESS_TOKEN_SECRET as string,
      {
        issuer: JWT_CONFIG.ISSUER,
        audience: JWT_CONFIG.AUDIENCE,
      }
    ) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiException(
          401,
          new ExceptionDetails(
            'token_expired',
            'Token has expired. Please login again.'
          )
        )
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return next(
        new ApiException(
          401,
          new ExceptionDetails(
            'invalid_token',
            'Invalid token. Please login again.'
          )
        )
      );
    }

    if (error instanceof ApiException) {
      return next(error);
    }

    return next(
      new ApiException(
        401,
        new ExceptionDetails(
          'authentication_failed',
          'Authentication failed. Please login again.'
        )
      )
    );
  }
};

export default AuthenticationMiddleware;
