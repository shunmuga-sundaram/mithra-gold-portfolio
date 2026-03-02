import { Router } from 'express';
import { ApiRouter } from '../../helpers/api-router';
import { AppSettingsController } from '../../controllers/app-settings/app-settings-controller';
import { AuthenticationMiddleware } from '../../middlewares/authentication-middleware';
import { RequireAdmin } from '../../middlewares/authorization-middleware';

/**
 * APP SETTINGS ROUTER
 *
 * GET  /app-settings   - Public (no auth) — member portal fetches this
 * PATCH /app-settings  - Admin only
 */

export class AppSettingsRouter implements ApiRouter {
    public readonly baseUrl = '/app-settings';
    private router: Router;

    public constructor() {
        this.router = Router();
        this.initRoutes();
    }

    public get Router(): Router {
        return this.router;
    }

    private initRoutes(): void {
        // GET /app-settings - no auth required (member portal needs this)
        this.router.get('/', AppSettingsController.getSettings);

        // PATCH /app-settings - admin only
        this.router.patch(
            '/',
            AuthenticationMiddleware,
            RequireAdmin,
            AppSettingsController.updateSettings
        );
    }
}
