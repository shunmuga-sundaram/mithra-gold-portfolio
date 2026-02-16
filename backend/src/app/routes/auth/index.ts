import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import adminAuthRouter from './admin-auth-router';
import memberAuthRouter from './member-auth-router';

/**
 * Auth Router
 *
 * Main authentication router that mounts all auth-related sub-routes.
 * Currently includes:
 * - Admin authentication routes at /auth/admin/*
 * - Member authentication routes at /auth/member/*
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

        // Mount member authentication routes
        // All member auth routes will be available at /auth/member/*
        // Routes: /auth/member/login, /auth/member/refresh, /auth/member/me, /auth/member/logout
        this.router.use('/member', memberAuthRouter);
    }
}
