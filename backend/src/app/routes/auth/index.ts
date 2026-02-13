import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import adminAuthRouter from './admin-auth-router';

/**
 * Auth Router
 *
 * Main authentication router that mounts all auth-related sub-routes.
 * Currently includes:
 * - Admin authentication routes at /auth/admin/*
 *
 * Future member authentication routes can be added here at /auth/member/*
 */
export class AuthRouter implements ApiRouter {
    public readonly baseUrl = '/auth';

    private router: Router;

    public constructor() {
        this.router = Router();
        this.initRoutes();
    }

    public get Router(): Router {
        return this.router;
    }

    private initRoutes(): void {
        // Mount admin authentication routes
        // All admin auth routes will be available at /auth/admin/*
        // Routes: /auth/admin/login, /auth/admin/refresh, /auth/admin/me, /auth/admin/logout
        this.router.use('/admin', adminAuthRouter);
    }
}
