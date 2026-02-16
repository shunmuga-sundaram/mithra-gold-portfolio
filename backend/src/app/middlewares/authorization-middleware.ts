import { Request, Response, NextFunction } from 'express';
import { ApiException, ExceptionDetails } from '../error/api-exception';
import { JWTPayload } from '../config/jwt-config';

/**
 * AUTHORIZATION MIDDLEWARE
 *
 * Verifies user has required role/permissions after authentication
 */

export const AuthorizeRole = (...allowedRoles: string[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user as JWTPayload | undefined;

      if (!user) {
        throw new ApiException(
          401,
          new ExceptionDetails(
            'unauthorized',
            'Authentication required. Please login first.'
          )
        );
      }

      const hasPermission = allowedRoles.includes(user.role);

      if (!hasPermission) {
        throw new ApiException(
          403,
          new ExceptionDetails(
            'forbidden',
            'Access denied. You do not have permission to perform this action.'
          )
        );
      }

      next();
    } catch (error: any) {
      if (error instanceof ApiException) {
        return next(error);
      }

      return next(
        new ApiException(
          403,
          new ExceptionDetails(
            'authorization_failed',
            'Authorization failed. Please try again.'
          )
        )
      );
    }
  };
};

/**
 * SHORTHAND HELPERS
 */
export const RequireAdmin = AuthorizeRole('admin', 'super_admin');
export const RequireSuperAdmin = AuthorizeRole('super_admin');
export const RequireMember = AuthorizeRole('member');

export default AuthorizeRole;
